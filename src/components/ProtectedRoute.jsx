import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps nested dashboard routes. Returns <Outlet/> when authorized,
// otherwise redirects to login or the access-denied page.
export default function ProtectedRoute({ role }) {
  const { isAuthenticated, role: userRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}
