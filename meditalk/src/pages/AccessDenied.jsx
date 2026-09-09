import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { DASHBOARD_ROUTES } from "../constants";

export default function AccessDenied() {
  const { role } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-danger/10 flex items-center justify-center">
          <ShieldAlert className="h-7 w-7 text-danger" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink">Access Denied</h1>
        <p className="mt-2 text-sm text-ink/60">
          You don't have permission to view this page. If you think this is a mistake, contact your administrator.
        </p>
        <Link to={role ? DASHBOARD_ROUTES[role] : "/login"} className="mt-6 inline-block">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
