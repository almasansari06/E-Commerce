export const apiUrl = (path = '/') => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
};

export const assetUrl = (value = '') => value.replace('http://localhost:4000', process.env.REACT_APP_API_URL || 'http://localhost:4000');
