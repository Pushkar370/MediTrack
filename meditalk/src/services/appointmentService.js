import { apiFetch } from './apiClient';
import { getDoctors } from './doctorService';

export function getAppointments(filters = {}) {
  const params = new URLSearchParams();
  if (filters.patientId) params.set('patientId', filters.patientId);
  if (filters.doctorId) params.set('doctorId', filters.doctorId);
  if (filters.status) params.set('status', filters.status);
  if (filters.date) params.set('date', filters.date);
  const qs = params.toString();
  return apiFetch(`/appointments${qs ? `?${qs}` : ''}`);
}

export function getAppointmentById(id) {
  return apiFetch(`/appointments/${id}`);
}

export async function bookAppointment(payload) {
  const res = await apiFetch('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res;
}

export function cancelAppointment(id) {
  return apiFetch(`/appointments/${id}/cancel`, { method: 'PATCH' });
}

export function rescheduleAppointment(id, { date, time }) {
  return apiFetch(`/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({ date, time }),
  });
}

export function updateAppointmentStatus(id, status) {
  return apiFetch(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Delegates to doctor service — consistent API surface
export { getDoctors };
