import { Pill } from "lucide-react";
import { formatDate } from "../../constants";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";

export default function PrescriptionCard({ prescription, onView }) {
  const p = prescription;
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-sage/20 flex items-center justify-center">
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-ink">Rx #{p.id}</p>
            <p className="text-xs text-ink/50">{formatDate(p.date)}</p>
          </div>
        </div>
        <StatusBadge status={p.status} />
      </div>
      <p className="mt-3 text-sm text-ink/70">
        {p.medications.length} medication{p.medications.length > 1 ? "s" : ""} · {p.doctorName}
      </p>
      <div className="mt-3">
        {onView && (
          <Button size="sm" variant="outline" onClick={() => onView(p)}>
            View Prescription
          </Button>
        )}
      </div>
    </div>
  );
}
