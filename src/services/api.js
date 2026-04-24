import { API_URL } from '../config/env';

export async function apiFetch(path, { token, headers, body, ...options } = {}) {
  const requestHeaders = {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Erro inesperado na API.');
  }

  return data;
}
