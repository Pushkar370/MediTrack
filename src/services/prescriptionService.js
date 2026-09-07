import { simulateDelay } from "./apiClient";
import { prescriptions, consultations, medicalRecords } from "../data/mockData";

export function getPrescriptions(filters = {}) {
  let result = [...prescriptions];
  if (filters.patientId) result = result.filter((p) => p.patientId === filters.patientId);
  if (filters.doctorId) result = result.filter((p) => p.doctorId === filters.doctorId);
  return simulateDelay(result);
}

export function getPrescriptionById(id) {
  return simulateDelay(prescriptions.find((p) => p.id === id) || null);
}

export function savePrescription(payload) {
  return simulateDelay({ success: true, id: "P-" + Date.now(), ...payload }, 400);
}

export function getConsultations(filters = {}) {
  let result = [...consultations];
  if (filters.patientId) result = result.filter((c) => c.patientId === filters.patientId);
  if (filters.doctorId) result = result.filter((c) => c.doctorId === filters.doctorId);
  return simulateDelay(result);
}

export function saveConsultation(payload) {
  return simulateDelay({ success: true, id: "C-" + Date.now(), ...payload }, 400);
}

export function getMedicalRecords(patientId) {
  return simulateDelay(medicalRecords.filter((r) => r.patientId === patientId));
}
