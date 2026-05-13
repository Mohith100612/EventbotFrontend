const SEARCH_BASE = import.meta.env.VITE_SEARCH_BASE_URL;

export function isSearchConfigured() {
  return !!SEARCH_BASE && !SEARCH_BASE.includes('REPLACE_WITH_EC2_IP');
}

export async function searchAttendees({ q, limit = 10, experience_level, organization, signal } = {}) {
  if (!isSearchConfigured()) {
    throw new Error('Search service URL not configured. Set VITE_SEARCH_BASE_URL in .env.');
  }
  const params = new URLSearchParams({ q, limit: String(limit) });
  if (experience_level) params.set('experience_level', experience_level);
  if (organization) params.set('organization', organization);

  const res = await fetch(`${SEARCH_BASE}/search?${params.toString()}`, { signal });
  if (!res.ok) {
    const err = new Error(`Search failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior', 'expert'];

export function normalizeSearchHit(hit) {
  return {
    id: hit.id,
    shortcode: hit.id,
    name: hit.full_name,
    full_name: hit.full_name,
    role: hit.role,
    organization: hit.organization,
    experience_level: hit.experience_level,
    linkedin: hit.linkedin_url,
    linkedin_url: hit.linkedin_url,
    about_you: hit.detailed_profile,
    detailed_profile: hit.detailed_profile,
    score: hit.score,
  };
}
