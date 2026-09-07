import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../services/notificationService";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markAsRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllAsRead();
  }, []);

  const remove = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotification(id);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        unread,
        reload: load,
        markRead,
        markAllRead,
        remove,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
