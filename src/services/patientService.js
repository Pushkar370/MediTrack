import { simulateDelay } from "./apiClient";
import { patients } from "../data/mockData";

export function getPatients() {
  return simulateDelay(patients);
}

export function getPatientById(id) {
  return simulateDelay(patients.find((p) => p.id === id) || null);
}

export function addPatient(payload) {
  return simulateDelay({ success: true, id: "P-" + Date.now(), ...payload }, 400);
}

export function updatePatient(id, payload) {
  return simulateDelay({ success: true, id, ...payload }, 400);
}

export function setPatientStatus(id, status) {
  return simulateDelay({ success: true, id, status }, 300);
}
