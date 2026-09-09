import { apiFetch } from './apiClient';

export function getAuditLogs(filters = {}) {
  const params = new URLSearchParams();
  if (filters.role) params.set('role', filters.role);
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString();
  return apiFetch(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
}

export function getAnalytics() {
  return apiFetch('/admin/analytics');
}

export function getDashboardStats(role) {
  if (role === 'admin') return apiFetch('/admin/stats');
  return Promise.resolve({});
}
