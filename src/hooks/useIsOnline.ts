import { useOnlineUsersStore } from "@/lib/store/onlineUsers";

export function useIsOnline(userId?: string): boolean {
  const onlineUsers = useOnlineUsersStore((s) => s.onlineUsers);
  if (!userId) return false;
  return onlineUsers.has(userId);
}
