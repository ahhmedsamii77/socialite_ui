import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useGetUserChats } from "@/lib/apis/queries";
import { socket } from "@/lib/socket";
import type { ChatType, UserType } from "@/types";
import ChatList from "@/components/chat/ChatList";
import { useGetUserData } from "@/lib/apis/queries";
import { MessageSquare } from "lucide-react";
import ChatWindow from "@/components/chat/ChatWindow";
import CreateGroupModal from "@/components/chat/CreateGroupModal";
import { useUnreadCountsStore } from "@/lib/store/unreadCounts";

export default function Chat() {
  const location = useLocation();
  const { data: currentUser } = useGetUserData();
  const { data: chats = [], isLoading } = useGetUserChats();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<UserType | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { reset: resetUnread, setActiveChatId } = useUnreadCountsStore();

  const selectChat = (id: string | null) => {
    setSelectedChatId(id);
    setActiveChatId(id);
    if (id) resetUnread(id);
  };

  useEffect(() => {
    return () => setActiveChatId(null);
  }, [setActiveChatId]);

  // Always derive the current chat from the live chats array so socket updates
  // (groupUpdated, participantLeft, etc.) are reflected instantly in ChatWindow
  const selectedChat = selectedChatId
    ? (chats.find((c) => c._id === selectedChatId) ?? null)
    : null;

  // Virtual chat for a new direct conversation that doesn't exist yet
  const virtualChat: ChatType | null =
    !selectedChat && pendingUser && currentUser
      ? {
          _id: "",
          createdBy: currentUser._id,
          participants: [currentUser as UserType, pendingUser],
          messages: [],
          createdAt: new Date().toISOString(),
        }
      : null;

  // Handle directUser passed via navigate("/chat", { state: { directUser } })
  useEffect(() => {
    const directUser = (location.state as any)?.directUser as UserType | undefined;
    if (!directUser) return;

    // Clear router state so back-navigation doesn't re-trigger
    window.history.replaceState({}, "", location.pathname);

    // Look for an existing OVO chat with this user
    const existing = chats.find(
      (c: ChatType) =>
        !c.groupName &&
        c.participants.some((p: any) => (p._id ?? p) === directUser._id),
    );

    if (existing) {
      selectChat(existing._id);
    } else {
      // No chat yet — open a virtual (empty) chat window
      setPendingUser(directUser);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Once the first message creates the real chat, switch from virtual → real
  useEffect(() => {
    if (!pendingUser || !chats.length) return;
    const newChat = chats.find(
      (c: ChatType) =>
        !c.groupName &&
        c.participants.some((p: any) => (p._id ?? p) === pendingUser._id),
    );
    if (newChat) {
      selectChat(newChat._id);
      setPendingUser(null);
    }
  }, [chats, pendingUser]);

  const activeChat = selectedChat ?? virtualChat;

  return (
    <div className="flex h-[calc(100dvh-5rem)] md:h-[calc(100vh-2rem)] md:max-h-200 md:my-4 md:mx-4 rounded-none md:rounded-2xl border-0 md:border border-border-strong overflow-hidden bg-card shadow-lg animate-fade-in-up">
      {/* Left: conversation list — fullscreen on mobile when no chat selected */}
      <div className={`${
        activeChat ? "hidden md:flex" : "flex"
      } flex-col md:w-80 w-full shrink-0 border-r border-border-strong`}>
        <ChatList
          chats={chats}
          isLoading={isLoading}
          selected={selectedChat}
          currentUserId={currentUser?._id ?? ""}
          onSelect={(chat) => { selectChat(chat._id); setPendingUser(null); }}
          onCreateGroup={() => setShowCreateGroup(true)}
        />
      </div>

      {/* Right: message window — fullscreen on mobile when chat selected */}
      <div className={`${
        activeChat ? "flex" : "hidden md:flex"
      } flex-1 min-w-0`}>
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            currentUser={currentUser as UserType}
            socket={socket}
            onClose={() => { selectChat(null); setPendingUser(null); }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageSquare size={28} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Select a conversation</p>
              <p className="text-sm mt-1">Choose from your existing chats or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          currentUserId={currentUser?._id ?? ""}
          onClose={() => setShowCreateGroup(false)}
        />
      )}
    </div>
  );
}
