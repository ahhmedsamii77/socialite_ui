import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UnreadState {
  counts: Record<string, number>; // chatId → unread count
  readChats: string[]; // Chats that have been opened in this session
  activeChatId: string | null;
  setActiveChatId: (chatId: string | null) => void;
  increment: (chatId: string) => void;
  reset: (chatId: string) => void;
}

export const useUnreadCountsStore = create<UnreadState>()(
  persist(
    (set, get) => ({
      counts: {},
      readChats: [],
      activeChatId: null,
      setActiveChatId: (chatId) => set({ activeChatId: chatId }),
      increment: (chatId) => {
        if (get().activeChatId === chatId) return;
        set((s) => ({
          counts: { ...s.counts, [chatId]: (s.counts[chatId] ?? 0) + 1 },
          // If a new message arrives, it's no longer 'read' unless it's the active chat
          readChats: s.readChats.filter((id) => id !== chatId),
        }));
      },
      reset: (chatId) =>
        set((s) => ({
          counts: { ...s.counts, [chatId]: 0 },
          readChats: s.readChats.includes(chatId) ? s.readChats : [...s.readChats, chatId],
        })),
    }),
    {
      name: "unread-counts-storage",
      partialize: (state) => ({ counts: state.counts, readChats: state.readChats }), // ignore activeChatId
    }
  )
);
