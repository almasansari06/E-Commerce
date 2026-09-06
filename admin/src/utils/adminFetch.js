export const apiUrl = (path = '/') => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
};

export default function adminFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem('admin-token');
  if (token) headers.set('admin-token', token);
  const requestUrl = /^https?:\/\//i.test(url) ? url : apiUrl(url);
  return fetch(requestUrl, { ...options, headers });
}
