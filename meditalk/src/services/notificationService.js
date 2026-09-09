import { apiFetch } from './apiClient';

function getUserId() {
  try {
    const user = localStorage.getItem('meditrack_user');
    return user ? JSON.parse(user)?.id : null;
  } catch {
    return null;
  }
}

export function getNotifications() {
  const userId = getUserId();
  const qs = userId ? `?userId=${userId}` : '';
  return apiFetch(`/notifications${qs}`);
}

export function markAsRead(id) {
  return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllAsRead() {
  const userId = getUserId();
  return apiFetch('/notifications/read-all', {
    method: 'PATCH',
    body: JSON.stringify({ userId }),
  });
}

export function deleteNotification(id) {
  return apiFetch(`/notifications/${id}`, { method: 'DELETE' });
}
