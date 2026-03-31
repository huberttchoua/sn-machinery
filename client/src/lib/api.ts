/**
 * API utility for constructing URLs with dynamic base URL
 * Uses environment variable VITE_API_URL, defaults to localhost:3001
 * In production (non-local), API is served from the same origin.
 */

const getApiBaseUrl = (): string => {
  // Explicit override via env var (takes priority)
  if (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== '') {
    return import.meta.env.VITE_API_URL;
  }

  const host = window.location.hostname;
  const isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(host);

  if (!isLocal) {
    // Production: frontend and API are served from the same Express server
    return '';
  }

  return `http://${host}:3001`;
};

export const API_BASE_URL = getApiBaseUrl();

export const createApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export const apiCall = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const url = createApiUrl(endpoint);
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    }
  });
};
