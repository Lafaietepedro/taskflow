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
  }).catch(() => {
    throw new Error(
      `Sem conexão com a API em ${API_URL}. No celular, localhost não acessa o backend do computador. ` +
      'Use EXPO_PUBLIC_API_URL com o IP da sua máquina ou exponha o backend por tunnel.'
    );
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
