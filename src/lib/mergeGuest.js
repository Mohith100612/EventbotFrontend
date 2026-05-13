function norm(s) {
  return (s || '').toLowerCase().trim();
}

export function findMongoMatch(target, browseGuests) {
  if (!target || !browseGuests?.length) return null;
  const linkedin = norm(target.linkedin || target.linkedin_url);
  if (linkedin) {
    const m = browseGuests.find((g) => norm(g.linkedin) === linkedin);
    if (m) return m;
  }
  const name = norm(target.name || target.full_name);
  if (name) {
    const m = browseGuests.find((g) => norm(g.name) === name);
    if (m) return m;
  }
  return (
    browseGuests.find(
      (g) => g.shortcode === target.shortcode || g.shortcode === target.id
    ) || null
  );
}

export function mergeGuests(mongoRecord, searchHit, clicked) {
  const merged = {
    ...(mongoRecord || {}),
    ...(searchHit || {}),
    ...(clicked || {}),
  };
  merged.name = merged.name || merged.full_name;
  merged.full_name = merged.full_name || merged.name;
  merged.linkedin = merged.linkedin || merged.linkedin_url;
  merged.linkedin_url = merged.linkedin_url || merged.linkedin;
  merged.about_you = merged.about_you || merged.detailed_profile;
  merged.detailed_profile = merged.detailed_profile || merged.about_you;

  if (mongoRecord) {
    merged.email = mongoRecord.email || merged.email;
    merged.phone_number = mongoRecord.phone_number || merged.phone_number;
    if (
      mongoRecord.years_of_experience != null &&
      mongoRecord.years_of_experience !== ''
    ) {
      merged.years_of_experience = mongoRecord.years_of_experience;
    }
  }
  if (searchHit) {
    merged.role = searchHit.role || merged.role;
    merged.organization = searchHit.organization || merged.organization;
    merged.experience_level = searchHit.experience_level || merged.experience_level;
  }
  return merged;
}
