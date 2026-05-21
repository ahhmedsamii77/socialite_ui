import { create } from "zustand";

interface OnlineUsersState {
  onlineUsers: Set<string>;
  setOnline: (userId: string) => void;
  setOffline: (userId: string) => void;
  setInitial: (ids: string[]) => void;
}

export const useOnlineUsersStore = create<OnlineUsersState>((set) => ({
  onlineUsers: new Set<string>(),

  setOnline: (userId) =>
    set((state) => ({
      onlineUsers: new Set(state.onlineUsers).add(userId),
    })),

  setOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),

  setInitial: (ids) =>
    set(() => ({
      onlineUsers: new Set(ids),
    })),
}));
