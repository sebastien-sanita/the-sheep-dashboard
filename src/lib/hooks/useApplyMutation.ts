import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import type { FluxMutationToolName, FluxMutationToolInput } from "@/lib/flux/types";

/**
 * useApplyMutation — déclenche une mutation MCP côté backend.
 *
 * POST /api/workspaces/:workspaceId/mutations/apply
 *   body : { tool_name, tool_input }   (dry_run: false implicite)
 *   réponse 201 : { ok, result, audit_id }
 *
 * Sémantique d'erreur :
 *   - 4xx / 5xx → apiPost throw (géré par onError)
 *   - 201 + ok:false → succès HTTP mais le tool a renvoyé une erreur
 *     métier (campagne introuvable, garde de sécurité, etc.). On le
 *     traite comme une erreur applicative et on rejette la promesse.
 *
 * Pas de dry_run : le user a déjà vu le preview au moment de la
 * génération du flux par Claude. Apply = commit immédiat.
 */

export interface ApplyMutationVariables {
  workspaceId: string;
  toolName: FluxMutationToolName;
  toolInput: FluxMutationToolInput;
}

export interface ApplyMutationResponse {
  ok: boolean;
  result: unknown;
  audit_id: string;
}

export class MutationToolError extends Error {
  auditId: string;
  toolError: string;
  constructor(toolError: string, auditId: string) {
    super(toolError);
    this.name = "MutationToolError";
    this.toolError = toolError;
    this.auditId = auditId;
  }
}

function extractToolError(result: unknown): string {
  if (result && typeof result === "object" && "error" in result) {
    const err = (result as { error: unknown }).error;
    if (typeof err === "string") return err;
  }
  return "Le backend a renvoyé ok:false sans détail d'erreur.";
}

async function applyMutation({
  workspaceId,
  toolName,
  toolInput,
}: ApplyMutationVariables): Promise<ApplyMutationResponse> {
  const res = await apiPost<ApplyMutationResponse>(
    `/api/workspaces/${workspaceId}/mutations/apply`,
    {
      tool_name: toolName,
      tool_input: toolInput,
      // dry_run absent → confirm=true côté serveur (commit réel)
    },
  );

  // 201 + ok:false → tool error métier (campaign not found, garde Meta…)
  if (!res.ok) {
    throw new MutationToolError(extractToolError(res.result), res.audit_id);
  }
  return res;
}

export function useApplyMutation() {
  return useMutation<ApplyMutationResponse, Error, ApplyMutationVariables>({
    mutationFn: applyMutation,
  });
}
