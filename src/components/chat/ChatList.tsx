import { useState } from "react";
import { Search, Plus, Users, Loader2 } from "lucide-react";
import type { ChatType, UserType } from "@/types";
import { useOnlineUsersStore } from "@/lib/store/onlineUsers";
import { useUnreadCountsStore } from "@/lib/store/unreadCounts";
import {  formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import { getProfileImageUrl } from "@/lib/utils";

interface Props {
  chats: ChatType[];
  isLoading: boolean;
  selected: ChatType | null;
  currentUserId: string;
  onSelect: (chat: ChatType) => void;
  onCreateGroup: () => void;
}

export default function ChatList({ chats, isLoading, selected, currentUserId, onSelect, onCreateGroup }: Props) {
  const [search, setSearch] = useState("");
  const { onlineUsers } = useOnlineUsersStore();

  const filtered = chats.filter((c) => {
    const name = c.groupName ?? getOtherParticipant(c, currentUserId)?.fName ?? "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-strong flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Messages</h2>
        <Button
          className="text-muted-foreground  h-8! w-8! p-0! bg-transparent hover:bg-primary/8! hover:text-primary! transition duration-200 cursor-pointer rounded-xl!"
          onClick={onCreateGroup}
          title="Create group"
        >
          <Plus size={17} />
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-border-strong">
        <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Users size={20} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          </div>
        )}

        {filtered.map((chat) => (
          <ConversationItem
            key={chat._id}
            chat={chat}
            currentUserId={currentUserId}
            isSelected={selected?._id === chat._id}
            onlineUsers={onlineUsers}
            onClick={() => onSelect(chat)}
          />
        ))}
      </div>
    </div>
  );
}

function ConversationItem({
  chat,
  currentUserId,
  isSelected,
  onlineUsers,
  onClick,
}: {
  chat: ChatType;
  currentUserId: string;
  isSelected: boolean;
  onlineUsers: Set<string>;
  onClick: () => void;
}) {
  const { counts } = useUnreadCountsStore();
  const unread = counts[chat._id] ?? 0;
  const isGroup = !!chat.groupName;
  const other = !isGroup ? getOtherParticipant(chat, currentUserId) : null;
  const 
  name = isGroup ? chat.groupName! : `${other?.fName ?? ""} ${other?.lName ?? ""}`.trim();
  const online = !isGroup && other ? onlineUsers.has(other._id) : false;
  const lastMsg = chat.messages?.[chat.messages.length - 1];
  const lastMsgDate = lastMsg?.createdAt ?? "";
  const lastTime = lastMsgDate ? formatRelativeDate(lastMsgDate) : "";
  const preview = lastMsg?.deletedAt
    ? "🚫 Message deleted"
    : lastMsg?.content
    ? lastMsg.content.slice(0, 45)
    : lastMsg?.attachments?.length
    ? "📎 Attachment"
    : "No messages yet";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-150 text-left cursor-pointer
        ${isSelected ? "bg-primary/10 border-r-2 border-primary" : "hover:bg-muted/40"}`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {isGroup ? (
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Users size={16} className="text-primary" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden">
            {other?.profileImage ? (
              <img src={getProfileImageUrl(other.profileImage)} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm font-semibold truncate ${unread > 0 ? "text-foreground" : "text-foreground"}`}>
            {name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {lastTime && <span className="text-[11px] text-muted-foreground">{lastTime}</span>}
            {unread > 0 && (
              <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </div>
        </div>
        <p className={`text-xs truncate ${unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
          {preview}
        </p>
      </div>
    </button>
  );
}

export function getOtherParticipant(chat: ChatType, currentUserId: string): UserType | undefined {
  return chat.participants.find((p) => p._id !== currentUserId);
}

function formatRelativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return formatDistanceToNowStrict(d, { addSuffix: false })
      .replace(" seconds", "s")
      .replace(" second", "s")
      .replace(" minutes", "m")
      .replace(" minute", "m")
      .replace(" hours", "h")
      .replace(" hour", "h")
      .replace(" days", "d")
      .replace(" day", "d")
      .replace(" months", "mo")
      .replace(" month", "mo")
      .replace(" years", "y")
      .replace(" year", "y");
  } catch {
    return "";
  }
}
