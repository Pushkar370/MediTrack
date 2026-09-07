import { Star, Clock } from "lucide-react";
import { initials } from "../../constants";

export default function DoctorCard({ doctor, onSelect }) {
  const d = doctor;
  return (
    <button
      onClick={() => onSelect?.(d)}
      className="card text-left hover:shadow-card-hover hover:-translate-y-0.5 transition flex flex-col gap-3 w-full"
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
          {initials(d.name)}
        </div>
        <div>
          <p className="font-semibold text-ink">{d.name}</p>
          <p className="text-xs text-ink/50">{d.specialty}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-ink/70">
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 text-accent fill-accent" /> {d.rating}
        </span>
        <span>{d.experience} yrs exp</span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-primary" /> {d.availability}
        </span>
      </div>
    </button>
  );
}
