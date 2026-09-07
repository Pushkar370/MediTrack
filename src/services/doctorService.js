import { simulateDelay } from "./apiClient";
import { doctors } from "../data/mockData";

let localDoctors = [...doctors];

export function getDoctors() {
  return simulateDelay(localDoctors);
}

export function getDoctorById(id) {
  return simulateDelay(localDoctors.find((d) => d.id === id) || null);
}

export function addDoctor(payload) {
  const id = "D-" + (200 + localDoctors.length + 1);
  localDoctors = [{ id, status: "active", ...payload }, ...localDoctors];
  return simulateDelay({ success: true, doctor: { id, ...payload } }, 400);
}

export function updateDoctor(id, payload) {
  localDoctors = localDoctors.map((d) => (d.id === id ? { ...d, ...payload } : d));
  return simulateDelay({ success: true, id }, 400);
}

export function setDoctorStatus(id, status) {
  localDoctors = localDoctors.map((d) => (d.id === id ? { ...d, status } : d));
  return simulateDelay({ success: true, id, status }, 300);
}
