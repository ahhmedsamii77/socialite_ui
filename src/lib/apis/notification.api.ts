import { api } from "./apis";

export function getNotifications(cursor?: string, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  return api.get(`/notification?${params.toString()}`, { signal });
}

export function getUnreadCount(signal?: AbortSignal) {
  return api.get("/notification/unread-count", { signal });
}

export function markAllRead() {
  return api.patch("/notification/mark-all-read");
}

export function markOneRead(notificationId: string) {
  return api.patch(`/notification/${notificationId}/read`);
}

export function deleteNotification(notificationId: string) {
  return api.delete(`/notification/${notificationId}`);
}

export function clearAllNotifications() {
  return api.delete("/notification");
}
