import { useState } from "react";
import { Download, FileText } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import MedicalRecordCard from "../../components/cards/MedicalRecordCard";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { patients } from "../../data/mockData";
import { getMedicalRecords } from "../../services/prescriptionService";
import { RECORD_TYPES, formatDate } from "../../constants";

const FILTERS = ["All", ...RECORD_TYPES];

export default function PatientRecords() {
  const { user } = useAuth();
  const patient = patients.find((p) => p.id === user?.id) || patients[0];
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const { data: records, loading } = useFetch(() => getMedicalRecords(patient.id));

  if (loading) return <LoadingState />;

  const list = (records || []).filter((r) => filter === "All" || r.type === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Health Records" subtitle="Your electronic health record (EHR) history." />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "px-3 py-1.5 rounded-full text-sm font-medium transition " +
              (filter === f
                ? "bg-primary text-white"
                : "bg-white text-ink/60 border border-sage/40 hover:bg-sage/20")
            }
          >
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card">
          <EmptyState icon={FileText} title="No records found" message="No records match this filter yet." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((r) => (
            <MedicalRecordCard
              key={r.id}
              record={r}
              onView={setSelected}
              onDownload={() => {}}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.type} · ${formatDate(selected.date)}` : ""}
        size="lg"
        footer={<Button onClick={() => setSelected(null)}>Close</Button>}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <Info label="Record ID" value={selected.id} />
              <Info label="Doctor" value={selected.doctor} />
              <Info label="Status" value={selected.status} />
              <Info label="Date" value={formatDate(selected.date)} />
            </div>
            <Info label="Description" value={selected.description} />
            <Info label="Symptoms" value={(selected.details?.symptoms || []).join(", ") || "N/A"} />
            <Info label="Diagnosis" value={selected.details?.diagnosis || "N/A"} />
            <Info label="Treatment" value={selected.details?.treatment || "N/A"} />
            <Info label="Notes" value={selected.details?.notes || "N/A"} />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Download</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-ink/50 text-xs">{label}</p>
      <p className="text-ink font-medium mt-0.5">{value}</p>
    </div>
  );
}
