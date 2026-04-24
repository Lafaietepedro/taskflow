import { apiFetch } from './api';

export function register(payload) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function login(payload) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function fetchCurrentUser(token) {
  return apiFetch('/auth/me', { token });
}

export function requestCheckoutIntent(token, payload) {
  return apiFetch('/auth/checkout-intent', {
    token,
    method: 'POST',
    body: payload,
  });
}
