/**
 * Clean campaign names by removing redundant prefixes, platform tags,
 * objective keywords, and years. Returns a human-readable short name.
 */
export function cleanCampaignName(fullName: string): string {
  let clean = fullName;

  // Remove client prefix before objective keyword
  const objMatch = clean.match(/^.*?[_-](?:engagement|trafic|traffic|notoriet|notoriété|lead|leadgen|leadads|conversion|fans|event|recrutement|brand|awareness|reach|video|vente|sale|messages?)/i);
  if (objMatch) {
    clean = clean.slice(objMatch[0].length);
  }

  // Remove objective keywords themselves
  clean = clean.replace(/[_-]?(?:engagement|trafic|traffic|notoriet|notoriété|lead|leadgen|leadads|conversion|fans|brand|awareness|reach)[_-]?/gi, " ");

  // Remove platform tags
  clean = clean.replace(/[_-]?(?:IG|FB|META|Instagram|Facebook)[_-]?/gi, " ");

  // Remove "Ville" prefix
  clean = clean.replace(/[_-]?\bville[_-]?/gi, " ");

  // Remove years
  clean = clean.replace(/[_-]?\b(?:2024|2025|2026)\b[_-]?/g, " ");

  // Remove "Copie" suffix
  clean = clean.replace(/[_-]?\s*copie\s*$/i, "");

  // Remove common prefixes like "FR-ACQ-"
  clean = clean.replace(/^(?:FR|US|UK)[_-]/i, "");

  // Convert separators to spaces
  clean = clean.replace(/[_-]+/g, " ");

  // Clean multiple spaces
  clean = clean.replace(/\s+/g, " ").trim();

  // Remove leading/trailing parentheses if orphaned
  clean = clean.replace(/^\(\s*/, "").replace(/\s*\)$/, "");

  // Title case
  if (clean.length > 0) {
    clean = clean
      .split(" ")
      .filter(Boolean)
      .map((w) => {
        if (w.length <= 2) return w.toUpperCase(); // Keep short words uppercase (SUD, etc.)
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(" ");
  }

  // If result is too short or empty, fallback to last segment of original
  if (!clean || clean.length < 2) {
    const parts = fullName.split(/[_-]/).filter(Boolean);
    clean = parts[parts.length - 1] || fullName;
    clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }

  return clean;
}
