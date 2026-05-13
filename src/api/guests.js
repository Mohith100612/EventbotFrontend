const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api/guests${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = new Error(`Request failed: ${res.status}`);
    err.status = res.status;
    try {
      err.body = await res.json();
    } catch {
      err.body = null;
    }
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export function fetchAllGuests() {
  return request('/all');
}

export function fetchGuest(shortcode) {
  return request(`/${encodeURIComponent(shortcode)}`);
}

export function updateGuest(shortcode, patch) {
  return request(`/edit/${encodeURIComponent(shortcode)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export const DISPLAY_FIELDS = [
  { key: 'email', label: 'Email' },
  { key: 'phone_number', label: 'Phone number' },
  { key: 'role', label: 'Role' },
  { key: 'organization', label: 'Organization' },
  { key: 'experience_level', label: 'Experience level', capitalize: true },
  { key: 'years_of_experience', label: 'Years of experience' },
  { key: 'linkedin', label: 'LinkedIn URL', isLink: true },
  { key: 'about_you', label: 'About' },
  { key: 'how_can_help', label: 'How they can help' },
  { key: 'expectations', label: 'Expectations from event' },
];

export const EDITABLE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone_number', label: 'Phone number', type: 'tel' },
  { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
  { key: 'years_of_experience', label: 'Years of experience', type: 'number' },
  { key: 'about_you', label: 'About you', type: 'textarea' },
  { key: 'how_can_help', label: 'How can you help others?', type: 'textarea' },
  { key: 'expectations', label: 'Expectations from event', type: 'textarea' },
];
