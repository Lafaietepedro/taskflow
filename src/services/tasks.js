import { apiFetch } from './api';

export function fetchTasks(token) {
  return apiFetch('/tasks', { token });
}

export function createTask(token, payload) {
  return apiFetch('/tasks', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateTask(token, taskId, payload) {
  return apiFetch(`/tasks/${taskId}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export function updateTaskStatus(token, taskId, payload) {
  return apiFetch(`/tasks/${taskId}/status`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteTask(token, taskId) {
  return apiFetch(`/tasks/${taskId}`, {
    method: 'DELETE',
    token,
  });
}
