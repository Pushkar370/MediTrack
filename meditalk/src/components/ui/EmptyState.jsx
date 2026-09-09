import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="h-14 w-14 rounded-full bg-sage/20 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h4 className="font-medium text-ink">{title}</h4>
      {message && <p className="mt-1 text-sm text-ink/50 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
