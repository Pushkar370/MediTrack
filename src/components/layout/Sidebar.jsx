import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import Logo from "../ui/Logo";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../constants";

export default function Sidebar({ role, items, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-sage/30 h-full flex flex-col">
      <div className="p-5 border-b border-sage/30">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition " +
                (isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-ink/70 hover:bg-sage/20 hover:text-primary")
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sage/30 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
            {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
            <p className="text-[11px] text-ink/50">{ROLE_LABELS[role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
