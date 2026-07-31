/**
 * Utility functions for managing Auth token and API requests with JWT headers.
 */

export const getAuthToken = () => localStorage.getItem('token') || '';

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

const apiCache = new Map();
const inFlightRequests = new Map();

export const clearAuthSession = () => {
  localStorage.clear();
  sessionStorage.removeItem('vs_preferred_sports_cache');
  sessionStorage.removeItem('vs_all_sports_cache');
  apiCache.clear();
  inFlightRequests.clear();
};

export async function prefetchUserSports() {
  const token = getAuthToken();
  if (!token) return;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  try {
    const [prefRes, allRes] = await Promise.allSettled([
      apiFetch(`${apiUrl}/api/sports/preferred`),
      apiFetch(`${apiUrl}/api/sports`)
    ]);
    if (prefRes.status === 'fulfilled' && prefRes.value.ok) {
      const prefData = await prefRes.value.json();
      if (prefData.preferredSports) {
        sessionStorage.setItem('vs_preferred_sports_cache', JSON.stringify(prefData.preferredSports));
      }
    }
    if (allRes.status === 'fulfilled' && allRes.value.ok) {
      const allData = await allRes.value.json();
      if (allData.sports) {
        sessionStorage.setItem('vs_all_sports_cache', JSON.stringify(allData.sports));
      }
    }
  } catch (err) {
    console.warn('Background prefetch for sports failed silently:', err);
  }
}

/**
 * Custom fetch wrapper that automatically attaches JWT Authorization header.
 * Deduplicates in-flight requests and caches GET results for lookup endpoints (/api/sports, /api/venues).
 * - For auth (/api/auth) and health (/health) endpoints: sends 'Authorization': ''
 * - For all other endpoints: sends 'Authorization': 'Bearer <token>'
 */
export async function apiFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const isCacheable = method === 'GET' && (url.includes('/api/sports') || url.includes('/api/venues'));

  if (isCacheable) {
    if (apiCache.has(url)) {
      return apiCache.get(url).clone();
    }
    if (inFlightRequests.has(url)) {
      const pendingResponse = await inFlightRequests.get(url);
      return pendingResponse.clone();
    }
  }

  const token = getAuthToken();
  const isAuthOrHealth =
    url.includes('/api/auth') || url.includes('/auth') || url.includes('/health');

  const authHeaderValue = isAuthOrHealth ? '' : (token ? `Bearer ${token}` : '');

  const headers = {
    'Authorization': authHeaderValue,
    ...options.headers
  };

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (isCacheable && response.ok) {
        apiCache.set(url, response.clone());
      }
      return response;
    } finally {
      if (isCacheable) {
        inFlightRequests.delete(url);
      }
    }
  })();

  if (isCacheable) {
    inFlightRequests.set(url, fetchPromise);
  }

  const response = await fetchPromise;
  return response.clone ? response.clone() : response;
}
