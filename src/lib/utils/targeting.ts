export interface TargetingSummary {
  location: string;
  age: string;
  gender: string;
  interests: string[];
  placements: string[];
  devices: string;
}

export function translateTargeting(targeting: Record<string, unknown> | null): TargetingSummary {
  if (!targeting) return { location: "—", age: "—", gender: "—", interests: [], placements: [], devices: "—" };

  const geo = targeting.geo_locations as Record<string, unknown> | undefined;
  const countries = (geo?.countries as string[]) ?? [];
  const cities = (geo?.cities as Array<{ name: string }>) ?? [];
  const regions = (geo?.regions as Array<{ name: string }>) ?? [];

  const location = countries.length > 0
    ? countries.join(", ")
    : cities.length > 0
      ? cities.map((c) => c.name).join(", ")
      : regions.length > 0
        ? regions.map((r) => r.name).join(", ")
        : "—";

  const ageMin = targeting.age_min as number | undefined;
  const ageMax = targeting.age_max as number | undefined;
  const age = ageMin && ageMax ? `${ageMin}-${ageMax} ans` : ageMin ? `${ageMin}+ ans` : "—";

  const genders = targeting.genders as number[] | undefined;
  let gender = "—";
  if (genders) {
    if (genders.includes(0) || (genders.includes(1) && genders.includes(2))) gender = "Tous";
    else if (genders.includes(1)) gender = "Hommes";
    else if (genders.includes(2)) gender = "Femmes";
  }

  const flexSpec = (targeting.flexible_spec as Array<Record<string, Array<{ name: string }>>>) ?? [];
  const interests: string[] = [];
  for (const spec of flexSpec) {
    for (const key of ["interests", "behaviors", "work_positions", "life_events", "education_statuses"]) {
      for (const item of spec[key] ?? []) {
        if (item.name && interests.length < 8) interests.push(item.name);
      }
    }
  }

  const publisherPlatforms = (targeting.publisher_platforms as string[]) ?? [];
  const fbPositions = (targeting.facebook_positions as string[]) ?? [];
  const igPositions = (targeting.instagram_positions as string[]) ?? [];
  const placements = [...publisherPlatforms, ...fbPositions, ...igPositions]
    .map((p) => p.replace(/_/g, " "))
    .slice(0, 6);

  const devicePlatforms = (targeting.device_platforms as string[]) ?? [];
  const devices = devicePlatforms.length > 0 ? devicePlatforms.join(", ") : "—";

  return { location, age, gender, interests, placements, devices };
}
