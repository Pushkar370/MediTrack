import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Stethoscope, Activity, Pill, Save, FileText, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import LoadingState from "../../components/ui/LoadingState";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import { getPatientById } from "../../services/patientService";
import { saveConsultation } from "../../services/prescriptionService";

const VITALS = [
  { key: "bp", label: "Blood Pressure", placeholder: "120/80" },
  { key: "hr", label: "Heart Rate", placeholder: "78 bpm" },
  { key: "temp", label: "Temperature", placeholder: "36.8 °C" },
  { key: "spo2", label: "Oxygen Saturation", placeholder: "98%" },
  { key: "weight", label: "Weight", placeholder: "70 kg" },
];

export default function DoctorConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const doctorId = user?.id || "D-201";

  const { data: patient, loading } = useFetch(() => getPatientById(id), [id]);

  const [form, setForm] = useState({
    symptoms: "",
    vitals: { bp: "", hr: "", temp: "", spo2: "", weight: "" },
    diagnosis: "",
    diagnosisCode: "",
    observations: "",
    labStatus: "pending",
    treatmentPlan: "",
    followUpDate: "",
    followUpInstructions: "",
  });
  const [saving, setSaving] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function setVital(key, value) {
    setForm((f) => ({ ...f, vitals: { ...f.vitals, [key]: value } }));
  }

  if (loading) return <LoadingState />;
  if (!patient) return <div className="card"><p className="text-ink/50">Patient not found.</p></div>;

  async function handleSave() {
    setSaving(true);
    try {
      await saveConsultation({
        patientId: patient.id,
        doctorId,
        reason: form.symptoms || form.diagnosis,
        symptoms: form.symptoms,
        vitals: form.vitals,
        diagnosis: form.diagnosis,
        diagnosisCode: form.diagnosisCode,
        observations: form.observations,
        labResults: form.labStatus,
        treatmentPlan: form.treatmentPlan,
        followUpDate: form.followUpDate,
        followUpInstructions: form.followUpInstructions,
        status: "completed",
      });
      toast.success("Consultation saved successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to save consultation.");
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    setSaving(true);
    try {
      await saveConsultation({
        patientId: patient.id,
        doctorId,
        reason: form.symptoms || form.diagnosis,
        symptoms: form.symptoms,
        vitals: form.vitals,
        diagnosis: form.diagnosis,
        diagnosisCode: form.diagnosisCode,
        observations: form.observations,
        labResults: form.labStatus,
        treatmentPlan: form.treatmentPlan,
        followUpDate: form.followUpDate,
        followUpInstructions: form.followUpInstructions,
        status: "completed",
      });
      toast.success("Consultation completed successfully.");
      navigate("/doctor/patients");
    } catch (err) {
      toast.error(err.message || "Failed to complete consultation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Consultation" subtitle={`Patient: ${patient.name} (${patient.id})`} />

      <Card>
        <div className="flex items-center gap-3">
          <Avatar name={patient.name} size="md" />
          <div>
            <p className="font-semibold text-ink">{patient.name}</p>
            <p className="text-xs text-ink/50">
              {patient.gender || "—"} · {patient.bloodGroup || patient.blood_group || "—"} · {Array.isArray(patient.allergies) ? (patient.allergies.join(", ") || "No allergies") : (patient.allergies || "No allergies")}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title={
          <span className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" /> Symptoms & Vitals</span>
        }>
          <div className="space-y-4">
            <Input label="Symptoms" value={form.symptoms} onChange={(e) => set("symptoms", e.target.value)} placeholder="Reported symptoms" />
            <div className="grid sm:grid-cols-2 gap-3">
              {VITALS.map((v) => (
                <Input key={v.key} label={v.label} value={form.vitals[v.key]} onChange={(e) => setVital(v.key, e.target.value)} placeholder={v.placeholder} />
              ))}
            </div>
            <div>
              <label className="label-base">Laboratory Results</label>
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-sage/50 p-4">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-sm text-ink/60 flex-1">Upload lab report (UI only)</span>
                <span className={"text-xs font-medium px-2 py-1 rounded-full " + (form.labStatus === "pending" ? "bg-accent/20 text-yellow-800" : "bg-success/15 text-success")}>
                  {form.labStatus}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title={
            <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Diagnosis & Plan</span>
          }>
            <div className="space-y-4">
              <Input label="Diagnosis" value={form.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} />
              <Input label="Diagnosis Code (ICD-10)" value={form.diagnosisCode} onChange={(e) => set("diagnosisCode", e.target.value)} placeholder="e.g. J06.9" />
              <div>
                <label className="label-base">Clinical Observations</label>
                <textarea className="input-base min-h-[80px]" value={form.observations} onChange={(e) => set("observations", e.target.value)} />
              </div>
              <div>
                <label className="label-base">Treatment Plan</label>
                <textarea className="input-base min-h-[80px]" value={form.treatmentPlan} onChange={(e) => set("treatmentPlan", e.target.value)} />
              </div>
            </div>
          </Card>

          <Card title="Follow-up">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Follow-up Date" type="date" value={form.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} />
              <Input label="Instructions" value={form.followUpInstructions} onChange={(e) => set("followUpInstructions", e.target.value)} placeholder="e.g. Review in 2 weeks" />
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" /> Save Consultation</Button>
        <Button variant="outline" onClick={() => toast.info("Prescription form — go to the Prescriptions page.")}><Pill className="h-4 w-4" /> Generate Prescription</Button>
        <Button variant="success" onClick={handleComplete} loading={saving}><CheckCircle2 className="h-4 w-4" /> Complete Consultation</Button>
      </div>
    </div>
  );
}
