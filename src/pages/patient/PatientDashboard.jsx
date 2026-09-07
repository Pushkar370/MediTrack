import { useNavigate } from "react-router-dom";
import {
  CalendarClock, CalendarDays, Pill, FileText, Plus, Eye, RefreshCw, X, HeartPulse,
  Stethoscope, Activity, FlaskConical,
} from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import AppointmentCard from "../../components/cards/AppointmentCard";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { greeting, formatDate } from "../../constants";
import { patients } from "../../data/mockData";
import { getAppointments } from "../../services/appointmentService";
import { getMedicalRecords, getPrescriptions } from "../../services/prescriptionService";

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patient = patients.find((p) => p.id === user?.id) || patients[0];

  const { data: appts, loading } = useFetch(() => getAppointments({ patientId: patient.id }));
  const { data: records } = useFetch(() => getMedicalRecords(patient.id));
  const { data: rx } = useFetch(() => getPrescriptions({ patientId: patient.id }));

  if (loading) return <LoadingState />;

  const upcoming = (appts || []).filter((a) => a.status === "upcoming" || a.status === "confirmed");
  const nextAppt = upcoming[0];

  const recentActivity = [
    ...(records || []).map((r) => ({ ...r, kind: r.type })),
    ...(rx || []).map((p) => ({ ...p, kind: "Prescription", date: p.date })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{greeting()}, {patient.name.split(" ")[0]}</h1>
        <p className="text-sm text-ink/50">Here's your health summary for today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarClock} label="Upcoming Appointment" value={upcoming.length} tone="accent" />
        <StatCard icon={CalendarDays} label="Total Appointments" value={(appts || []).length} tone="primary" />
        <StatCard icon={Pill} label="Active Prescriptions" value={(rx || []).filter((p) => p.status === "active").length} tone="success" />
        <StatCard icon={FileText} label="Health Records" value={(records || []).length} tone="sage" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming appointment */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink">Upcoming Appointment</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/patient/appointments")}>
                View all
              </Button>
            </div>
            {nextAppt ? (
              <AppointmentCard
                appointment={nextAppt}
                onView={() => navigate("/patient/appointments")}
                onReschedule={() => navigate("/patient/appointments")}
                onCancel={() => navigate("/patient/appointments")}
              />
            ) : (
              <div className="text-center py-8 text-ink/50">
                <CalendarClock className="h-8 w-8 mx-auto text-ink/30" />
                <p className="mt-2 text-sm">No upcoming appointments.</p>
                <Button className="mt-3" size="sm" onClick={() => navigate("/patient/book-appointment")}>
                  <Plus className="h-4 w-4" /> Book Appointment
                </Button>
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="card mt-6">
            <h3 className="font-semibold text-ink mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.length === 0 && <p className="text-sm text-ink/50">No recent activity.</p>}
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-background">
                  <div className="h-9 w-9 rounded-full bg-sage/20 flex items-center justify-center text-primary">
                    {item.kind === "Prescription" ? <Pill className="h-4 w-4" /> :
                      item.kind === "Lab Result" ? <FlaskConical className="h-4 w-4" /> :
                      item.kind === "Vital Signs" ? <Activity className="h-4 w-4" /> :
                      <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{item.kind}</p>
                    <p className="text-xs text-ink/50 truncate">{item.description || item.doctorName}</p>
                  </div>
                  <span className="text-xs text-ink/40">{formatDate(item.date)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health summary */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-ink">Health Summary</h3>
            </div>
            <dl className="space-y-3 text-sm">
              <Row label="Blood Group" value={patient.bloodGroup} />
              <Row label="Height" value={patient.height} />
              <Row label="Weight" value={patient.weight} />
              <Row label="Allergies" value={patient.allergies.join(", ") || "None"} />
              <Row label="Medications" value={patient.currentMedications.join(", ") || "None"} />
            </dl>
          </div>

          <div className="card">
            <h3 className="font-semibold text-ink mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start" onClick={() => navigate("/patient/book-appointment")}>
                <Plus className="h-4 w-4" /> Book Appointment
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/patient/records")}>
                <FileText className="h-4 w-4" /> View Records
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/patient/prescriptions")}>
                <Pill className="h-4 w-4" /> View Prescriptions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-ink/50">{label}</dt>
      <dd className="font-medium text-ink text-right">{value}</dd>
    </div>
  );
}
