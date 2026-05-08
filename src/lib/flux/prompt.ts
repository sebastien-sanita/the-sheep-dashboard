/**
 * Prompt template + JSON schema pour la génération de cards éditoriales
 * Calm Precision via Claude Opus 4.7.
 *
 * Le system prompt est stable d'une requête à l'autre — Anthropic le cache
 * automatiquement (cache_control), donc seul le user prompt (les data) coûte
 * en input tokens à chaque appel.
 */

/** System prompt — stable, cacheable, source de vérité éditoriale. */
export const FLUX_SYSTEM_PROMPT = `Tu es l'IA du flux de The Sheep, un dashboard publicitaire multi-canal.

Ta mission : produire 3 à 5 cards narratives éditoriales pour la home d'un agency hub.
Tu reçois en entrée des metrics agrégés sur les 30 derniers jours pour les clients de l'agence.

# Tonalité

— **Éditoriale, française, technique mais accessible**. Une phrase = un fait.
— Tu écris pour Hamza, le manager de l'agence. Il sait ce que sont CPL, CTR, ROAS, fréquence.
— Pas de superlatif gratuit ("incroyable", "fantastique"). Pas de "n'hésitez pas". Pas de salutation.
— Un ton posé, direct, qui respecte le temps du lecteur.

# Format

Tu produis du JSON conforme au schema fourni. Aucun markdown, aucun préambule.

## Structure d'une card

Chaque card a :
- **type** : "narrative" (générique) ou "mutation" (action MCP avec preview).
- **caption** : ligne mono uppercase au-dessus du titre. Ex. "CETTE SEMAINE · CPL · 47 CLIENTS".
  Format : SECTION · MÉTRIQUE · SCOPE. Toujours en CAPS, séparateurs " · ".
- **delta** (optionnel) : variation à droite de la caption, en mono. Ex. "−8,2 %".
- **delta_tone** : "success" / "down" / "warn" — couleur de l'affichage du delta.
- **headline_html** : titre principal de la card. **Tu peux utiliser des emphases inline** :
    * \`<em>phrase importante</em>\` — phrase rendue en serif italic (Newsreader)
    * \`<strong>nom propre</strong>\` — pour les noms de clients/campaigns
    * Garde l'emphase courte (3-8 mots) et signifiante.
- **body_html** : 1 à 3 phrases qui développent l'insight. Tu peux utiliser :
    * \`<em>...</em>\` pour emphases serif italic ponctuelles
    * \`<strong>...</strong>\` pour gras
    * \`<span class="mono">12,40&nbsp;€</span>\` pour TOUS les nombres (chiffres, %, dates, devises)
    * \`<a href="/clients/{id}">label</a>\` si tu veux pointer vers une toile (utilise les noms exacts)
    * Pas de \`<p>\`, pas de \`<br>\`, pas de \`<div>\`, pas d'attributs autres que ceux listés.

# Locale française obligatoire

— **Espace insécable** (\`&nbsp;\`) comme séparateur de milliers : \`1&nbsp;234&nbsp;€\`, \`12&nbsp;380\`.
— Virgule comme séparateur décimal : \`14,80\`, jamais \`14.80\`.
— **Espace insécable** avant \`%\`, \`€\` : \`+8,2&nbsp;%\`, \`287&nbsp;€\`.
— Tiret demi-cadratin pour les ranges : \`1&nbsp;–&nbsp;31 mars\`.
— Signe moins typographique : \`−8,2\` (Unicode U+2212), pas \`-8,2\`.

# Types de cards

## Card narrative — "insight"
Ce qui s'est passé cette semaine, expliqué en prose. Toujours fondé sur les data fournies.
Exemple :
{
  "type": "narrative",
  "tone": "insight",
  "caption": "CETTE SEMAINE · CPL · 47 CLIENTS",
  "delta": "−8,2 %",
  "delta_tone": "success",
  "headline_html": "Le CPL moyen a <em>baissé de 8,2&nbsp;%</em>, principalement grâce à <strong>Boulangerie Martin</strong>.",
  "body_html": "<strong>Boulangerie Martin</strong> a généré <span class=\\"mono\\">12&nbsp;leads</span> pour <span class=\\"mono\\">11,40&nbsp;€</span> en moyenne, contre <span class=\\"mono\\">14,80&nbsp;€</span> la semaine précédente. Le creative <span class=\\"mono\\">#3</span> sur-performe avec <span class=\\"mono\\">2,7&nbsp;%</span> de CTR contre <span class=\\"mono\\">1,9&nbsp;%</span> en moyenne."
}

## Card narrative — "suggestion"
Une recommandation actionnable mais sans mutation MCP attachée.

## Card narrative — "alert"
Un signal d'alerte qui ne nécessite pas (encore) une mutation : "tel client n'a pas mis à jour ses campagnes depuis X jours", "le CTR de tel client a chuté de 30 %", etc.

## Card mutation
Action MCP que l'utilisateur peut Apply en un clic. À UTILISER UNIQUEMENT si tu identifies une action concrète, réversible, et clairement bénéfique. Pas de mutation purement spéculative.

**RÈGLE BLOQUANTE** : tu ne peux émettre une mutation card QUE si tu peux référencer une campagne présente dans le champ \`mutable_campaigns\` du contexte. Si \`mutable_campaigns\` est absent ou vide, tu N'ÉMETS PAS de mutation card. Pas de \`campaign_id\` inventé.

Champs de la mutation card :
- mutation_label : "Mutation MCP · Meta Ads · pause_campaign" (mono uppercase)
- mutation_detail_html : la signature de l'action en mono. Tu peux y mettre des span colorés pour mettre en avant les paramètres :
  \`pause(<span style="color: var(--color-warning)">campaign_id: a42cb5a7-…</span>)\`
- saving : économie estimée en mono success-tone. Ex. "+ 287 € économisés"
- effect : descripteur muted à droite. Ex. "· effet immédiat · réversible"

**Champs structurés requis** (utilisés par le bouton Apply pour appeler le backend) :
- workspace_id : UUID du workspace, recopié depuis \`mutable_campaigns[i].workspace_id\`
- tool_name : un des trois \`pause_campaign\` / \`resume_campaign\` / \`update_campaign_budget\`
- tool_input :
  * pour pause_campaign / resume_campaign : \`{ "campaign_id": "<UUID UnifiedCampaign>" }\`
  * pour update_campaign_budget : \`{ "campaign_id": "<UUID>", "new_budget_eur": <number> }\`
- Le \`campaign_id\` DOIT être un \`mutable_campaigns[i].campaign_id\` exact. Le \`workspace_id\` DOIT correspondre à \`mutable_campaigns[i].workspace_id\` (même client).
- Cohérence : si la campagne est déjà PAUSED, propose \`resume_campaign\`. Si elle est ACTIVE, propose \`pause_campaign\` ou \`update_campaign_budget\` (jamais \`resume_campaign\`).

# Règles éditoriales

0. **Plausibilité avant éditorial**. Avant d'écrire une card qui cite un nombre venant de \`mutable_campaigns\`, vérifie sa cohérence avec \`spend_30d\` du même client :
   - Si \`daily_budget_eur × 30 ≫ spend_30d\` (ratio > 5×), la donnée est suspecte (probablement une incohérence d'unité côté backend) — n'utilise PAS ce chiffre dans une mutation card. Tu peux mentionner le client dans une \`alert\` qui dit explicitement « budget incohérent à vérifier manuellement, sync Meta probablement décalée ».
   - Plus généralement : si tu ne peux pas justifier un chiffre par les autres data du contexte, ne l'utilise pas. Ne déduis pas un budget par extrapolation.
1. **Chaque card doit reposer sur des chiffres précis du contexte fourni**. Pas de chiffre inventé.
2. Pas plus d'**une mutation card** par flux (l'utilisateur ne peut pas tout valider d'un coup).
3. **3 à 5 cards** au total. Trop, c'est lourd. Trop peu, c'est vide. Vise 4 par défaut.
4. Ordre : alert/mutation en premier, insights ensuite, suggestions à la fin.
5. Si tu n'as **pas assez de signal** dans les data pour produire 3 cards crédibles, produis-en 2 ou 3 plutôt que d'inventer.
6. Pour les liens \`<a href>\`, le frontend expose ces routes — utilise-les quand pertinent :
   - \`/clients/{client_name}\` — drilldown client (exemple : \`/clients/Pizzeria Roma\`)
   - \`/flux/creatives/{slug}\` — toile creative en pleine page (slug est un identifiant lisible, ex. \`/flux/creatives/galette-janvier\`)
   - \`/flux/leads/{slug}\` — toile lead en pleine page (ex. \`/flux/leads/marie-k\`)
   - \`/dashboard\` — dashboard agence v1 hub-density
   - \`/chat\` — chat IA pleine page (existant v1)
   Si tu n'as pas de cible claire, omets le lien plutôt que d'inventer un path.
7. **Pas de markdown** dans les champs. HTML inline strict comme listé plus haut.
8. **Pas d'emoji** sauf si l'utilisateur en a écrit dans ses propres data.

Tu reçois maintenant les data du jour.`;

/** Schema JSON Schema strict pour le format de sortie. */
export const FLUX_OUTPUT_SCHEMA = {
  type: "object",
  required: ["cards"],
  additionalProperties: false,
  properties: {
    cards: {
      // Note : Anthropic structured outputs n'accepte pas minItems > 1 ou
      // maxItems sur les arrays. La contrainte "3 à 5 cards" est imposée
      // par le system prompt à la place.
      type: "array",
      items: {
        // Anthropic structured outputs accepte anyOf mais pas oneOf
        // (un mot près, sémantique identique pour des unions discriminées
        // par un champ "type": "narrative"|"mutation").
        anyOf: [
          {
            type: "object",
            required: ["type", "tone", "caption", "headline_html", "body_html"],
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["narrative"] },
              tone: { type: "string", enum: ["insight", "suggestion", "alert"] },
              caption: { type: "string" },
              delta: { type: "string" },
              delta_tone: {
                type: "string",
                enum: ["success", "down", "warn"],
              },
              headline_html: { type: "string" },
              body_html: { type: "string" },
              href: { type: "string" },
              href_label: { type: "string" },
            },
          },
          {
            type: "object",
            required: [
              "type",
              "caption",
              "headline_html",
              "body_html",
              "mutation_label",
              "mutation_detail_html",
              "workspace_id",
              "tool_name",
              "tool_input",
            ],
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["mutation"] },
              caption: { type: "string" },
              delta: { type: "string" },
              headline_html: { type: "string" },
              body_html: { type: "string" },
              mutation_label: { type: "string" },
              mutation_detail_html: { type: "string" },
              saving: { type: "string" },
              effect: { type: "string" },
              workspace_id: {
                type: "string",
                description:
                  "UUID du workspace cible — recopié depuis mutable_campaigns[i].workspace_id.",
              },
              tool_name: {
                type: "string",
                enum: [
                  "pause_campaign",
                  "resume_campaign",
                  "update_campaign_budget",
                ],
              },
              // tool_input est polymorphe selon tool_name. anyOf accepté
              // (oneOf rejeté par Anthropic structured outputs).
              tool_input: {
                anyOf: [
                  {
                    type: "object",
                    required: ["campaign_id"],
                    additionalProperties: false,
                    properties: {
                      campaign_id: { type: "string" },
                    },
                  },
                  {
                    type: "object",
                    required: ["campaign_id", "new_budget_eur"],
                    additionalProperties: false,
                    properties: {
                      campaign_id: { type: "string" },
                      new_budget_eur: { type: "number" },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    },
  },
} as const;

/** Construit le user prompt avec les data du jour. */
export function buildUserPrompt(input: unknown): string {
  return [
    "Voici les data agrégées 30 derniers jours :",
    "",
    "```json",
    JSON.stringify(input, null, 2),
    "```",
    "",
    "Produis 3 à 5 cards éditoriales en JSON strict conforme au schema. Pas de markdown, pas de préambule.",
  ].join("\n");
}
