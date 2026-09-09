/**
 * API client for MediTrack.
 * All requests go through /api/... which the Vite dev proxy forwards to
 * the Express backend on port 3001. No hardcoded localhost URLs needed.
 */

function getToken() {
  try {
    const user = localStorage.getItem('meditrack_user');
    if (!user) return null;
    return JSON.parse(user)?.token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof body === 'object' ? (body.error || body.message || 'Request failed') : body;
    throw new Error(message);
  }

  return body;
}
