import { simulateDelay } from "./apiClient";
import { notifications } from "../data/mockData";

let localNotifications = [...notifications];

export function getNotifications() {
  return simulateDelay(localNotifications);
}

export function markAsRead(id) {
  localNotifications = localNotifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  return simulateDelay({ success: true }, 150);
}

export function markAllAsRead() {
  localNotifications = localNotifications.map((n) => ({ ...n, read: true }));
  return simulateDelay({ success: true }, 150);
}

export function deleteNotification(id) {
  localNotifications = localNotifications.filter((n) => n.id !== id);
  return simulateDelay({ success: true }, 150);
}

export function unreadCount() {
  return localNotifications.filter((n) => !n.read).length;
}
