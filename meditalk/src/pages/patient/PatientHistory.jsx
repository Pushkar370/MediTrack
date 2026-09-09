import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/ui/PageHeader";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";
import { useFetch } from "../../hooks/useFetch";
import { getConsultations, getMedicalRecords } from "../../services/prescriptionService";
import { formatDate } from "../../constants";
import { Activity, Stethoscope, Pill, FileText, FlaskConical } from "lucide-react";

const ICONS = {
  Consultation: Stethoscope,
  "Lab Result": FlaskConical,
  Prescription: Pill,
  "Vital Signs": Activity,
};

export default function PatientHistory() {
  const { user } = useAuth();
  const patientId = user?.id;

  const { data: consultations, loading: cl } = useFetch(() => getConsultations({ patientId }), [patientId]);
  const { data: medicalRecords, loading: ml } = useFetch(() => getMedicalRecords(patientId), [patientId]);

  if (cl || ml) return <LoadingState />;

  const timeline = [
    ...(consultations || []).map((c) => ({ ...c, type: "Consultation", title: c.diagnosis, date: c.date })),
    ...(medicalRecords || []).map((r) => ({ ...r, title: r.description })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (timeline.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Medical History" subtitle="A chronological timeline of your care." />
        <div className="card"><EmptyState title="No history yet" message="Your consultations and records will appear here." /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Medical History" subtitle="A chronological timeline of your care." />
      <div className="card">
        <ol className="relative border-l-2 border-sage/30 ml-3 space-y-6">
          {timeline.map((item) => {
            const Icon = ICONS[item.type] || FileText;
            return (
              <li key={item.id} className="ml-6">
                <span className="absolute -left-[15px] flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-background">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-semibold text-ink">{item.type}</p>
                  <span className="text-xs text-ink/40">{formatDate(item.date)}</span>
                </div>
                <p className="text-sm text-ink/70 mt-1">{item.title || item.description}</p>
                {item.doctor && <p className="text-xs text-ink/40 mt-0.5">By {item.doctor}</p>}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
