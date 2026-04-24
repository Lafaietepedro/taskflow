import { apiFetch } from './api';

export function fetchTasks(token) {
  return apiFetch('/tasks', { token });
}

export function updateTaskStatus(token, taskId, status) {
  return apiFetch(`/tasks/${taskId}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}

export function updateTask(token, taskId, payload) {
  return apiFetch(`/tasks/${taskId}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}
