import Avatar from "../ui/Avatar";
import StatusBadge from "../ui/StatusBadge";

export default function PatientCard({ patient, onView }) {
  const p = patient;
  const age = p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : "-";
  return (
    <div className="card flex items-center gap-3">
      <Avatar name={p.name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink truncate">{p.name}</p>
        <p className="text-xs text-ink/50">
          {p.id} · {age}y · {p.gender}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusBadge status={p.status} />
        {onView && (
          <button onClick={() => onView(p)} className="text-xs text-primary font-medium hover:underline">
            View
          </button>
        )}
      </div>
    </div>
  );
}
