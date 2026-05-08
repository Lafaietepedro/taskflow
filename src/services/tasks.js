import { apiFetch } from './api';
import { API_URL } from '../config/env';

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

export async function downloadTasksCsv(token) {
  const response = await fetch(`${API_URL}/tasks/export.csv`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao exportar relatório.');
  }

  return response.blob();
}
