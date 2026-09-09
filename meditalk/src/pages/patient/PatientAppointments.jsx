import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import AppointmentCard from "../../components/cards/AppointmentCard";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getAppointments, cancelAppointment, rescheduleAppointment } from "../../services/appointmentService";
import { useFetch } from "../../hooks/useFetch";
import { TIME_SLOTS } from "../../constants";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function PatientAppointments() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const patientId = user?.id;

  const { data: appts, loading, reload } = useFetch(() => getAppointments({ patientId }), [patientId]);
  const [tab, setTab] = useState("upcoming");
  const [toCancel, setToCancel] = useState(null);
  const [toReschedule, setToReschedule] = useState(null);
  const [form, setForm] = useState({ date: "", time: "" });
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingState />;

  const list = (appts || []).filter((a) => {
    if (tab === "upcoming") return a.status === "upcoming" || a.status === "confirmed";
    return a.status === tab;
  });

  async function confirmCancel() {
    setBusy(true);
    try {
      await cancelAppointment(toCancel.id);
      setToCancel(null);
      reload();
      toast.success("Appointment cancelled.");
    } catch (err) {
      toast.error(err.message || "Failed to cancel appointment.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmReschedule() {
    if (!form.date || !form.time) {
      toast.error("Please choose a new date and time.");
      return;
    }
    setBusy(true);
    try {
      await rescheduleAppointment(toReschedule.id, form);
      setToReschedule(null);
      reload();
      toast.success("Appointment rescheduled.");
    } catch (err) {
      toast.error(err.message || "Failed to reschedule appointment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Appointments"
        subtitle="View and manage your appointments."
        action={<Button onClick={() => navigate("/patient/book-appointment")}><CalendarDays className="h-4 w-4" /> Book</Button>}
      />

      <div className="flex gap-2 border-b border-sage/30">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition " +
              (tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-ink/50 hover:text-ink")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CalendarDays}
            title={`No ${tab} appointments`}
            message="When you book an appointment it will appear here."
            action={tab === "upcoming" ? <Button onClick={() => navigate("/patient/book-appointment")}>Book Appointment</Button> : null}
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onView={() => navigate("/patient/appointments")}
              onReschedule={(appt) => { setToReschedule(appt); setForm({ date: "", time: "" }); }}
              onCancel={setToCancel}
            />
          ))}
        </div>
      )}

      <ConfirmationModal
        open={!!toCancel}
        onClose={() => setToCancel(null)}
        onConfirm={confirmCancel}
        loading={busy}
        title="Cancel appointment?"
        message={`Cancel your appointment with ${toCancel?.doctorName}? This cannot be undone.`}
        confirmLabel="Yes, Cancel"
      />

      <Modal
        open={!!toReschedule}
        onClose={() => setToReschedule(null)}
        title="Reschedule Appointment"
        footer={
          <>
            <Button variant="outline" onClick={() => setToReschedule(null)} disabled={busy}>Cancel</Button>
            <Button onClick={confirmReschedule} loading={busy}>Confirm</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="New date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <Select label="New time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}>
            <option value="">Select a slot</option>
            {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
