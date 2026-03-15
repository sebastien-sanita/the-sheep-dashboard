const REMOVE_WORDS = new Set([
  // Client prefixes (common patterns)
  "bodyhouse", "body", "house",
  // Objectives (full words)
  "engagement", "trafic", "traffic", "notoriety", "notoriete", "notoriété",
  "leadgen", "leadads", "lead", "conversion", "conversions",
  "fans", "brand", "awareness", "reach", "messages", "video", "views",
  "sales", "purchase", "event", "recrutement",
  // Platforms
  "ig", "fb", "meta", "instagram", "facebook", "tiktok", "linkedin",
  // Tags
  "ville", "copie", "copy",
  // Years
  "2024", "2025", "2026",
]);

// Words to keep even if they're the last remaining
const KEEP_IF_LAST = new Set(["national", "natio", "france", "europe"]);

/**
 * Clean campaign names by splitting on separators and removing
 * known prefix/tag words. Keeps the meaningful segments.
 */
export function cleanCampaignName(fullName: string): string {
  // Split on _ - and / (but keep / content together with surrounding words)
  const parts = fullName.split(/[_-]+/).map((p) => p.trim()).filter(Boolean);

  // Filter out known words
  const cleaned = parts.filter((part) => {
    const lower = part.toLowerCase().replace(/[()]/g, "").trim();
    if (!lower) return false;
    if (REMOVE_WORDS.has(lower)) return false;
    // Check if it's a pure number (like month "11")
    if (/^\d{1,2}$/.test(lower)) return false;
    return true;
  });

  // If everything was removed, try keeping KEEP_IF_LAST words, or fallback to last part
  let result = cleaned;
  if (result.length === 0) {
    const lastResort = parts.filter((p) => {
      const lower = p.toLowerCase().trim();
      return KEEP_IF_LAST.has(lower) || (!REMOVE_WORDS.has(lower) && lower.length > 1);
    });
    result = lastResort.length > 0 ? lastResort : [parts[parts.length - 1] || fullName];
  }

  // Capitalize properly
  return result
    .map((word) => {
      // Handle parenthetical content: AVIGNON(SUD) → Avignon (Sud)
      const parenMatch = word.match(/^([^(]+)\(([^)]+)\)$/);
      if (parenMatch) {
        return `${capitalize(parenMatch[1])} (${capitalize(parenMatch[2])})`;
      }
      // Handle slash content: Investisseurs/Multi-franchisés
      if (word.includes("/")) {
        return word.split("/").map(capitalize).join(" / ");
      }
      return capitalize(word);
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function capitalize(word: string): string {
  if (!word) return word;
  // ALL CAPS longer than 2 chars → Title Case
  if (word === word.toUpperCase() && word.length > 2) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  // Already mixed case → keep as-is but ensure first letter uppercase
  return word.charAt(0).toUpperCase() + word.slice(1);
}
