import { APPOINTMENT_STATUS_LABELS } from "../../constants";

const STATUS_STYLES = {
  upcoming: "bg-accent/20 text-yellow-800 border border-accent/50",
  confirmed: "bg-sage/30 text-primary border border-sage/50",
  completed: "bg-success/15 text-success border border-success/30",
  cancelled: "bg-danger/10 text-danger border border-danger/30",
  pending: "bg-accent/20 text-yellow-800 border border-accent/50",
  active: "bg-success/15 text-success border border-success/30",
  inactive: "bg-ink/10 text-ink/60 border border-ink/20",
  available: "bg-success/15 text-success border border-success/30",
  busy: "bg-accent/20 text-yellow-800 border border-accent/50",
  success: "bg-success/15 text-success border border-success/30",
  failed: "bg-danger/10 text-danger border border-danger/30",
};

export default function StatusBadge({ status, label, className = "" }) {
  const text = label || APPOINTMENT_STATUS_LABELS[status] || status;
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize " +
        (STATUS_STYLES[status] || "bg-ink/10 text-ink/60 border border-ink/20") +
        " " +
        className
      }
    >
      {text}
    </span>
  );
}
