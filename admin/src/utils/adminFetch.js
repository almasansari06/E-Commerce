export default function adminFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem('admin-token');
  if (token) headers.set('admin-token', token);
  return fetch(url, { ...options, headers });
}
