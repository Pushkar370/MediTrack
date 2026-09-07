import { useState } from "react";
import { Pill, Plus, Trash2, FileDown, Send } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import { useToast } from "../../context/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import { patients } from "../../data/mockData";
import { getPrescriptions } from "../../services/prescriptionService";
import { PrescriptionPreview } from "../patient/PatientPrescriptions";
import { formatDate } from "../../constants";

const EMPTY_MED = { medicine: "", dosage: "", frequency: "", duration: "", instructions: "" };

export default function DoctorPrescriptions() {
  const toast = useToast();
  const { data: rx, loading } = useFetch(() => getPrescriptions({ doctorId: "D-201" }));
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ patientId: patients[0].id, medications: [{ ...EMPTY_MED }], additionalInstructions: "" });

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function updateMed(i, key, value) {
    setForm((f) => ({ ...f, medications: f.medications.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)) }));
  }
  function addMed() {
    setForm((f) => ({ ...f, medications: [...f.medications, { ...EMPTY_MED }] }));
  }
  function removeMed(i) {
    setForm((f) => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));
  }

  function handleSave() {
    if (!form.medications[0].medicine) {
      toast.error("Add at least one medicine.");
      return;
    }
    toast.success("Prescription saved (mock)");
    setCreating(false);
  }

  if (loading) return <LoadingState />;
  const list = rx || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescriptions"
        subtitle="Create and manage digital prescriptions."
        action={<Button onClick={() => { setForm({ patientId: patients[0].id, medications: [{ ...EMPTY_MED }], additionalInstructions: "" }); setCreating(true); }}><Plus className="h-4 w-4" /> New Prescription</Button>}
      />

      {list.length === 0 ? (
        <div className="card"><EmptyState icon={Pill} title="No prescriptions" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">Rx #{p.id}</p>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-xs text-ink/50 mt-1">{formatDate(p.date)} · {p.patientName}</p>
              <p className="text-sm text-ink/70 mt-3">{p.medications.length} medication(s)</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New Prescription"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Prescription</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label-base">Patient</label>
            <select className="input-base" value={form.patientId} onChange={(e) => update("patientId", e.target.value)}>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            {form.medications.map((m, i) => (
              <div key={i} className="rounded-xl border border-sage/30 p-3 grid sm:grid-cols-2 gap-3 relative">
                <Input label="Medicine" value={m.medicine} onChange={(e) => updateMed(i, "medicine", e.target.value)} />
                <Input label="Dosage" value={m.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} />
                <Input label="Frequency" value={m.frequency} onChange={(e) => updateMed(i, "frequency", e.target.value)} />
                <Input label="Duration" value={m.duration} onChange={(e) => updateMed(i, "duration", e.target.value)} />
                <div className="sm:col-span-2">
                  <Input label="Instructions" value={m.instructions} onChange={(e) => updateMed(i, "instructions", e.target.value)} />
                </div>
                {form.medications.length > 1 && (
                  <button onClick={() => removeMed(i)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-danger text-white flex items-center justify-center">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={addMed}><Plus className="h-4 w-4" /> Add Medicine</Button>
          </div>

          <Input label="Additional Instructions" value={form.additionalInstructions} onChange={(e) => update("additionalInstructions", e.target.value)} />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info("PDF generated (mock)")}><FileDown className="h-4 w-4" /> Generate PDF</Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("Sent to patient (mock)")}><Send className="h-4 w-4" /> Send to Patient</Button>
          </div>

          <Card title="Live Preview">
            <PrescriptionPreview
              rx={{
                doctorName: "Dr. Sneha Menon",
                date: new Date().toISOString().slice(0, 10),
                medications: form.medications.filter((m) => m.medicine),
                additionalInstructions: form.additionalInstructions,
              }}
            />
          </Card>
        </div>
      </Modal>
    </div>
  );
}
