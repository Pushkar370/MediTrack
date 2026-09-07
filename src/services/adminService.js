import { simulateDelay } from "./apiClient";
import { auditLogs, analyticsData, appointments, patients, doctors } from "../data/mockData";

export function getAuditLogs() {
  return simulateDelay(auditLogs);
}

export function getAnalytics() {
  return simulateDelay(analyticsData);
}

export function getDashboardStats(role) {
  if (role === "admin") {
    return simulateDelay({
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      todayAppointments: appointments.filter((a) => a.date === "2026-08-30").length,
      completedConsultations: appointments.filter((a) => a.status === "completed").length,
      cancelledAppointments: appointments.filter((a) => a.status === "cancelled").length,
      pendingAppointments: appointments.filter(
        (a) => a.status === "upcoming" || a.status === "confirmed"
      ).length,
    });
  }
  return simulateDelay({});
}
