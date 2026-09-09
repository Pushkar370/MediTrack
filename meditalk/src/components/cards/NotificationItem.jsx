import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Pill,
  BellRing,
  Info,
} from "lucide-react";
import { formatDateTime, NOTIFICATION_TYPES } from "../../constants";

const TYPE_ICON = {
  [NOTIFICATION_TYPES.REMINDER]: CalendarClock,
  [NOTIFICATION_TYPES.CONFIRMED]: CheckCircle2,
  [NOTIFICATION_TYPES.CANCELLED]: XCircle,
  [NOTIFICATION_TYPES.PRESCRIPTION]: Pill,
  [NOTIFICATION_TYPES.FOLLOWUP]: BellRing,
  [NOTIFICATION_TYPES.SYSTEM]: Info,
};

const TYPE_COLOR = {
  [NOTIFICATION_TYPES.REMINDER]: "text-accent",
  [NOTIFICATION_TYPES.CONFIRMED]: "text-success",
  [NOTIFICATION_TYPES.CANCELLED]: "text-danger",
  [NOTIFICATION_TYPES.PRESCRIPTION]: "text-primary",
  [NOTIFICATION_TYPES.FOLLOWUP]: "text-accent",
  [NOTIFICATION_TYPES.SYSTEM]: "text-ink/50",
};

export default function NotificationItem({ notification, onRead, onDelete }) {
  const Icon = TYPE_ICON[notification.type] || Info;
  const color = TYPE_COLOR[notification.type] || "text-ink/50";
  return (
    <div
      className={
        "flex items-start gap-3 p-3 rounded-xl transition " +
        (notification.read ? "bg-white" : "bg-cream/60 border border-accent/30")
      }
    >
      <div className={"h-9 w-9 rounded-full bg-sage/20 flex items-center justify-center shrink-0 " + color}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-ink text-sm truncate">{notification.title}</p>
          {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
        </div>
        <p className="text-xs text-ink/60 mt-0.5">{notification.message}</p>
        <p className="text-[11px] text-ink/40 mt-1">{formatDateTime(notification.date)}</p>
      </div>
      <div className="flex flex-col gap-1">
        {!notification.read && onRead && (
          <button
            onClick={() => onRead(notification.id)}
            className="text-[11px] text-primary hover:underline"
          >
            Mark read
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(notification.id)}
            className="text-[11px] text-danger hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
