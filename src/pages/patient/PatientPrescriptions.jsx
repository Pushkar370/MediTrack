import { Pill } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import PrescriptionCard from "../../components/cards/PrescriptionCard";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { patients } from "../../data/mockData";
import { getPrescriptions } from "../../services/prescriptionService";
import { formatDate } from "../../constants";

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const patient = patients.find((p) => p.id === user?.id) || patients[0];
  const [selected, setSelected] = useState(null);

  const { data: rx, loading } = useFetch(() => getPrescriptions({ patientId: patient.id }));

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Prescriptions" subtitle="Digital prescriptions from your doctors." />

      {!rx || rx.length === 0 ? (
        <div className="card"><EmptyState icon={Pill} title="No prescriptions" message="When a doctor creates a prescription it will appear here." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rx.map((p) => (
            <PrescriptionCard key={p.id} prescription={p} onView={setSelected} />
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Prescription ${selected?.id}`}
        size="md"
        footer={<Button onClick={() => setSelected(null)}>Close</Button>}
      >
        {selected && <PrescriptionPreview rx={selected} />}
      </Modal>
    </div>
  );
}

export function PrescriptionPreview({ rx }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl bg-cream/70 border border-accent/30 p-4">
        <p className="font-semibold text-ink">{rx.doctorName}</p>
        <p className="text-xs text-ink/50">Issued on {formatDate(rx.date)}</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink/50 border-b border-sage/30">
            <th className="py-2 font-medium">Medicine</th>
            <th className="py-2 font-medium">Dosage</th>
            <th className="py-2 font-medium">Frequency</th>
            <th className="py-2 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody>
          {rx.medications.map((m, i) => (
            <tr key={i} className="border-b border-sage/20">
              <td className="py-2 font-medium text-ink">{m.medicine}</td>
              <td className="py-2">{m.dosage}</td>
              <td className="py-2">{m.frequency}</td>
              <td className="py-2">{m.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rx.medications[0]?.instructions && (
        <p className="text-ink/70"><span className="text-ink/50">Instructions: </span>{rx.medications[0].instructions}</p>
      )}
      {rx.additionalInstructions && (
        <p className="text-ink/70"><span className="text-ink/50">Notes: </span>{rx.additionalInstructions}</p>
      )}
    </div>
  );
}
