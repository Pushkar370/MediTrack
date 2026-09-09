import { FileText, FlaskConical, ScanLine, Pill, Activity } from "lucide-react";
import { formatDate } from "../../constants";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";

const TYPE_ICON = {
  Consultation: FileText,
  "Lab Result": FlaskConical,
  Imaging: ScanLine,
  Prescription: Pill,
  "Vital Signs": Activity,
};

export default function MedicalRecordCard({ record, onView, onDownload }) {
  const Icon = TYPE_ICON[record.type] || FileText;
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-sage/20 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-ink">{record.type}</p>
            <p className="text-xs text-ink/50">{formatDate(record.date)}</p>
          </div>
        </div>
        <StatusBadge status={record.status} />
      </div>
      <p className="mt-3 text-sm text-ink/70 line-clamp-2">{record.description}</p>
      <p className="mt-1 text-xs text-ink/40">By {record.doctor}</p>
      <div className="mt-3 flex gap-2">
        {onView && (
          <Button size="sm" variant="outline" onClick={() => onView(record)}>
            View
          </Button>
        )}
        {onDownload && (
          <Button size="sm" variant="ghost" onClick={() => onDownload(record)}>
            Download
          </Button>
        )}
      </div>
    </div>
  );
}
