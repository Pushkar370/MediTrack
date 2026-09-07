import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, ClipboardList, CalendarClock, Stethoscope, Eye, Play } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { patients, appointments, consultations } from "../../data/mockData";
import { getAppointments } from "../../services/appointmentService";
import { formatDate } from "../../constants";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const doctorId = "D-201";

  const { data: appts, loading } = useFetch(() => getAppointments({ doctorId }));

  if (loading) return <LoadingState />;

  const list = appts || [];
  const todays = list.filter((a) => a.date === "2026-08-30");
  const pending = list.filter((a) => a.status === "upcoming" || a.status === "confirmed").length;
  const followUps = (consultations || []).filter((c) => c.doctorId === doctorId && c.followUpDate >= "2026-08-29").length;

  const columns = [
    { key: "time", label: "Time" },
    { key: "patientName", label: "Patient" },
    { key: "type", label: "Type" },
    { key: "reason", label: "Reason" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="primary" onClick={() => navigate(`/doctor/consultation/${row.patientId}`)}>
            <Play className="h-3.5 w-3.5" /> Start
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/patients/${row.patientId}`)}>
            <Eye className="h-3.5 w-3.5" /> View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Doctor Dashboard" subtitle={`Welcome, ${user?.name}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label="Today's Appointments" value={todays.length} tone="primary" />
        <StatCard icon={Users} label="Total Patients" value={patients.length} tone="sage" />
        <StatCard icon={ClipboardList} label="Pending Consultations" value={pending} tone="accent" />
        <StatCard icon={CalendarClock} label="Follow-ups" value={followUps} tone="success" />
      </div>

      <div className="card">
        <h3 className="font-semibold text-ink mb-4">Today's Appointments</h3>
        <DataTable columns={columns} data={todays} emptyMessage="No appointments scheduled for today." />
      </div>
    </div>
  );
}
