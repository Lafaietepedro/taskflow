import { apiFetch } from './api';

export function login(payload) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: payload,
  });
}
