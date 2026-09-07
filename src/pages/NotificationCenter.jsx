import { CheckCheck, Bell } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import NotificationItem from "../components/cards/NotificationItem";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationCenter() {
  const { notifications, loading, markRead, markAllRead, remove } = useNotifications();

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with your appointments and care."
        action={
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        }
      />

      {notifications.length === 0 ? (
        <div className="card">
          <EmptyState icon={Bell} title="No notifications" message="You're all caught up." />
        </div>
      ) : (
        <div className="card divide-y divide-sage/20 p-2">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={markRead}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
