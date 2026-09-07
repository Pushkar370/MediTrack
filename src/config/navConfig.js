import {
  LayoutDashboard, User, FileText, CalendarDays, History, Pill, Bell, Settings, LogOut, Calendar,
} from "lucide-react";

export const NAV_CONFIG = {
  patient: [
    { label: "Dashboard", to: "/patient/dashboard", icon: LayoutDashboard },
    { label: "My Profile", to: "/patient/profile", icon: User },
    { label: "Health Records", to: "/patient/records", icon: FileText },
    { label: "Appointments", to: "/patient/appointments", icon: CalendarDays },
    { label: "Medical History", to: "/patient/history", icon: History },
    { label: "Prescriptions", to: "/patient/prescriptions", icon: Pill },
    { label: "Notifications", to: "/patient/notifications", icon: Bell },
    { label: "Settings", to: "/settings", icon: Settings },
  ],
  doctor: [
    { label: "Dashboard", to: "/doctor/dashboard", icon: LayoutDashboard },
    { label: "Appointments", to: "/doctor/appointments", icon: CalendarDays },
    { label: "Patients", to: "/doctor/patients", icon: User },
    { label: "Calendar", to: "/doctor/calendar", icon: Calendar },
    { label: "Prescriptions", to: "/doctor/prescriptions", icon: Pill },
    { label: "Notifications", to: "/notifications", icon: Bell },
    { label: "Settings", to: "/settings", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Patients", to: "/admin/patients", icon: User },
    { label: "Doctors", to: "/admin/doctors", icon: User },
    { label: "Appointments", to: "/admin/appointments", icon: CalendarDays },
    { label: "Analytics", to: "/admin/analytics", icon: LayoutDashboard },
    { label: "Audit Logs", to: "/admin/audit-logs", icon: FileText },
    { label: "Notifications", to: "/notifications", icon: Bell },
    { label: "Settings", to: "/settings", icon: Settings },
  ],
};
