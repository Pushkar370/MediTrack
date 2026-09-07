import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, hint, tone = "primary", action }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    sage: "bg-sage/30 text-primary",
    accent: "bg-accent/20 text-yellow-800",
    danger: "bg-danger/10 text-danger",
    success: "bg-success/15 text-success",
  };
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className={"h-11 w-11 rounded-xl flex items-center justify-center " + tones[tone]}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        {action}
      </div>
      <p className="mt-4 text-2xl font-bold text-ink">{value}</p>
      <p className="text-sm text-ink/60 mt-0.5">{label}</p>
      {hint && (
        <p className="mt-2 text-xs flex items-center gap-1 text-ink/40">
          {hint.startsWith("+") || hint.startsWith("-") ? (
            hint.startsWith("+") ? (
              <ArrowUpRight className="h-3 w-3 text-success" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-danger" />
            )
          ) : null}
          {hint}
        </p>
      )}
    </div>
  );
}
