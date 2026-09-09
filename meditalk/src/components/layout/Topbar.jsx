import { useNavigate } from "react-router-dom";
import { Bell, Menu, Search } from "lucide-react";
import Avatar from "../ui/Avatar";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ onMenuClick, notificationTo, searchTo = "/patient/appointments" }) {
  const { user } = useAuth();
  const { unread } = useNotifications();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-sage/30">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-sage/20 text-ink/70"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <input
              type="text"
              placeholder="Search patients, doctors, records..."
              onKeyDown={(e) => e.key === "Enter" && navigate(searchTo)}
              className="input-base pl-9"
            />
          </div>
        </div>

        <div className="flex-1 sm:flex-none" />

        <button
          onClick={() => navigate(notificationTo)}
          className="relative p-2 rounded-xl hover:bg-sage/20 text-ink/70"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-1">
          <Avatar name={user?.name || "User"} size="sm" />
          <span className="hidden md:block text-sm font-medium text-ink">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
