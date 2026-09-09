import { apiFetch } from './apiClient';

export function getDoctors(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.specialty) params.set('specialty', filters.specialty);
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString();
  return apiFetch(`/doctors${qs ? `?${qs}` : ''}`);
}

export function getDoctorById(id) {
  return apiFetch(`/doctors/${id}`);
}

export async function addDoctor(payload) {
  const doctor = await apiFetch('/doctors', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { success: true, doctor };
}

export async function updateDoctor(id, payload) {
  const doctor = await apiFetch(`/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return { success: true, doctor };
}

export function setDoctorStatus(id, status) {
  return apiFetch(`/doctors/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
