import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ClientSummary } from "@/lib/types/workspace";
import { aggregateForPrompt } from "@/lib/flux/aggregator";
import {
  FLUX_SYSTEM_PROMPT,
  FLUX_OUTPUT_SCHEMA,
  buildUserPrompt,
} from "@/lib/flux/prompt";
import type {
  FluxCardsResponse,
  FluxCardsError,
  FluxCardData,
} from "@/lib/flux/types";

/**
 * POST /api/flux/cards
 *
 * Body : { workspaces: ClientSummary[] }
 *
 * Génère 3-5 cards narratives via Claude Opus 4.7 à partir des data
 * agrégées 30j fournies par le client. Pas de cache server-side pour
 * cette première version (React Query gère le cache côté client avec
 * staleTime 1h). Si le scope augmente (multi-utilisateurs), on ajoutera
 * un cache Redis ou unstable_cache.
 *
 * Configuration : ANTHROPIC_API_KEY doit être dans l'env.
 */

const MODEL = "claude-opus-4-7";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<FluxCardsError>(
      {
        error: true,
        type: "configuration",
        message:
          "ANTHROPIC_API_KEY est manquante côté serveur. Ajouter la variable dans Coolify (prod) ou .env.local (dev).",
      },
      { status: 500 },
    );
  }

  let workspaces: ClientSummary[];
  try {
    const body = (await request.json()) as { workspaces?: ClientSummary[] };
    if (!Array.isArray(body.workspaces)) {
      return NextResponse.json<FluxCardsError>(
        {
          error: true,
          type: "validation",
          message: "Body doit être { workspaces: ClientSummary[] }.",
        },
        { status: 400 },
      );
    }
    workspaces = body.workspaces;
  } catch {
    return NextResponse.json<FluxCardsError>(
      { error: true, type: "validation", message: "Body JSON invalide." },
      { status: 400 },
    );
  }

  // Pas assez de données pour générer un flux pertinent
  if (workspaces.length === 0) {
    return NextResponse.json<FluxCardsResponse>({
      generated_at: new Date().toISOString(),
      scope: "all_clients",
      model: MODEL,
      usage: { input_tokens: 0, output_tokens: 0 },
      cards: [],
    });
  }

  const promptInput = aggregateForPrompt(workspaces);
  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: FLUX_SYSTEM_PROMPT,
          // Cache du system prompt pour les générations suivantes
          // (lit à 0,1× du coût après la première écriture)
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: buildUserPrompt(promptInput) }],
      output_config: {
        format: {
          type: "json_schema",
          schema: FLUX_OUTPUT_SCHEMA,
        },
      },
    });

    // Extract text content (the structured JSON output)
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json<FluxCardsError>(
        {
          error: true,
          type: "anthropic",
          message: "Réponse Claude vide (pas de bloc text).",
        },
        { status: 502 },
      );
    }

    let parsed: { cards: FluxCardData[] };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch (e) {
      return NextResponse.json<FluxCardsError>(
        {
          error: true,
          type: "anthropic",
          message: `JSON Claude invalide : ${(e as Error).message}`,
        },
        { status: 502 },
      );
    }

    if (!Array.isArray(parsed.cards)) {
      return NextResponse.json<FluxCardsError>(
        {
          error: true,
          type: "anthropic",
          message: "Réponse Claude sans propriété 'cards' valide.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json<FluxCardsResponse>({
      generated_at: new Date().toISOString(),
      scope: "all_clients",
      model: MODEL,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        cache_read_input_tokens: message.usage.cache_read_input_tokens ?? undefined,
        cache_creation_input_tokens:
          message.usage.cache_creation_input_tokens ?? undefined,
      },
      cards: parsed.cards,
    });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json<FluxCardsError>(
        {
          error: true,
          type: "anthropic",
          message: `Anthropic API ${e.status}: ${e.message}`,
        },
        { status: e.status ?? 502 },
      );
    }
    return NextResponse.json<FluxCardsError>(
      {
        error: true,
        type: "internal",
        message: `Erreur serveur : ${(e as Error).message}`,
      },
      { status: 500 },
    );
  }
}
