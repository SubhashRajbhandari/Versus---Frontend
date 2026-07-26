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

/**
 * Custom fetch wrapper that automatically attaches JWT Authorization header.
 * - For auth (/api/auth) and health (/health) endpoints: sends 'Authorization': ''
 * - For all other endpoints: sends 'Authorization': 'Bearer <token>'
 */
export async function apiFetch(url, options = {}) {
  const token = getAuthToken();
  const isAuthOrHealth =
    url.includes('/api/auth') || url.includes('/auth') || url.includes('/health');

  const authHeaderValue = isAuthOrHealth ? '' : (token ? `Bearer ${token}` : '');

  const headers = {
    'Authorization': authHeaderValue,
    ...options.headers
  };

  return fetch(url, {
    ...options,
    headers
  });
}
