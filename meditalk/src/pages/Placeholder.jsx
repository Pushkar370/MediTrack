import { Link } from "react-router-dom";
import { Hammer } from "lucide-react";
import Button from "../components/ui/Button";

// Temporary placeholder for routes built in later phases.
export default function Placeholder({ title }) {
  return (
    <div className="card">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-14 w-14 rounded-full bg-sage/20 flex items-center justify-center mb-3">
          <Hammer className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-lg font-semibold text-ink">{title || "Coming soon"}</h1>
        <p className="mt-1 text-sm text-ink/50">This section is part of an upcoming milestone.</p>
        <Link to="/" className="mt-4">
          <Button variant="outline" size="sm">Back home</Button>
        </Link>
      </div>
    </div>
  );
}
