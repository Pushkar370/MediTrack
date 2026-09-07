import { simulateDelay } from "./apiClient";
import { appointments, doctors } from "../data/mockData";

let localAppointments = [...appointments];

export function getAppointments(filters = {}) {
  let result = [...localAppointments];
  if (filters.patientId) result = result.filter((a) => a.patientId === filters.patientId);
  if (filters.doctorId) result = result.filter((a) => a.doctorId === filters.doctorId);
  if (filters.status) result = result.filter((a) => a.status === filters.status);
  return simulateDelay(result);
}

export function getAppointmentById(id) {
  return simulateDelay(localAppointments.find((a) => a.id === id) || null);
}

export function bookAppointment(payload) {
  const id = "A-" + (5000 + localAppointments.length + 1);
  const newAppt = { id, status: "upcoming", ...payload };
  localAppointments = [newAppt, ...localAppointments];
  return simulateDelay({ success: true, appointment: newAppt }, 500);
}

export function cancelAppointment(id) {
  localAppointments = localAppointments.map((a) =>
    a.id === id ? { ...a, status: "cancelled" } : a
  );
  return simulateDelay({ success: true, id }, 300);
}

export function rescheduleAppointment(id, { date, time }) {
  localAppointments = localAppointments.map((a) =>
    a.id === id ? { ...a, date, time, status: "confirmed" } : a
  );
  return simulateDelay({ success: true, id }, 300);
}

export function getDoctors() {
  return simulateDelay(doctors);
}
