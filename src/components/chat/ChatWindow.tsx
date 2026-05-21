import { useEffect, useRef, useState } from "react";
import {
  Send, Paperclip, Ellipsis, Trash2, X, ChevronLeft, Users, Loader2, Pencil,
} from "lucide-react";
import type { ChatType, MessageType, UserType } from "@/types";
import { Socket } from "socket.io-client";
import {
  useGetDirectChat,
  useGetGroupChat,
  useCheckFriendship,
} from "@/lib/apis/queries";
import { getOtherParticipant } from "./ChatList";
import { useOnlineUsersStore } from "@/lib/store/onlineUsers";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditGroupModal from "./EditGroupModal";
import { getProfileImageUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  chat: ChatType;
  currentUser: UserType;
  socket: Socket;
  onClose: () => void;
}

export default function ChatWindow({ chat, currentUser, socket, onClose }: Props) {
  const isGroup = !!chat.groupName;
  const other = !isGroup ? getOtherParticipant(chat, currentUser._id) : null;
  const chatName = isGroup ? chat.groupName! : `${other?.fName ?? ""} ${other?.lName ?? ""}`.trim();
  const { onlineUsers } = useOnlineUsersStore();
  const online = !isGroup && other ? onlineUsers.has(other._id) : false;

  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch messages ──────────────────────────────────────────────────────────
  const directQuery = useGetDirectChat(!isGroup ? other?._id ?? "" : "");
  const groupQuery = useGetGroupChat(isGroup ? chat._id : "");
  const activeQuery = isGroup ? groupQuery : directQuery;

  // ── Friendship guard (OVO only) ─────────────────────────────────────────────
  const { data: friendshipData } = useCheckFriendship(!isGroup ? (other?._id ?? "") : "");
  const isFriend = isGroup || friendshipData?.status === "friends";

  const messages: MessageType[] = (activeQuery.data?.pages ?? [])
    .flatMap((page: any) => page.data.data.chat?.messages ?? [])
    .filter((m: MessageType) => !m.deletedAt);

  // ── Mutations ── none needed (delete ops are socket-only) ──────────────────

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const send = async () => {
    if (!text.trim() && attachments.length === 0) return;
    setIsSending(true);
    try {
      if (isGroup) {
        socket.emit("sendGroupMessage", {
          chatId: chat._id,
          content: text.trim() || undefined,
          attachments: await filesToBuffers(attachments),
        });
      } else {
        socket.emit("sendMessage", {
          sendTo: other!._id,
          content: text.trim() || undefined,
          attachments: await filesToBuffers(attachments),
        });
      }
      setText("");
      setAttachments([]);
    } finally {
      setIsSending(false);
    }
  };

  // ── Delete message (socket-only — handler saves to DB + notifies all participants) ───
  const handleDeleteMessage = (messageId: string) => {
    socket.emit("deleteMessage", { chatId: chat._id, messageId });
  };

  // ── Delete / leave chat (socket-only — BE socket handler does DB + notifications) ──
  const handleDeleteChat = () => {
    // deleteChatSocket handles: leave group (non-creator) OR soft-delete + chatDeleted emit
    socket.emit("deleteChat", { chatId: chat._id });
    onClose();
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-strong bg-card/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
              <ChevronLeft size={20} />
            </button>

            <div className="relative">
              {isGroup ? (
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden">
                  {chat.groupImage ? (
                    <img src={getProfileImageUrl(chat.groupImage)} alt={chatName} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={16} className="text-primary" />
                  )}
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-muted overflow-hidden">
                  {other?.profileImage ? (
                    <img src={getProfileImageUrl(other.profileImage)} alt={chatName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {chatName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
              {online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{chatName}</p>
              <p className="text-xs text-muted-foreground">
                {isGroup
                  ? `${chat.participants.length} members`
                  : online ? "Active now" : "Offline"}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="text-muted-foreground h-8! w-8! bg-transparent hover:bg-primary/8! hover:text-primary! transition duration-200 cursor-pointer rounded-xl!">
                <Ellipsis size={17} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl min-w-36 max-w-50 border-border-strong p-1">
            {isGroup && (chat.createdBy as any) === currentUser._id && (
              <DropdownMenuItem
                className="rounded-xl py-2 px-3 group hover:bg-primary/8! focus:bg-primary/8! hover:text-primary! focus:text-primary! text-foreground/75 text-[13px] font-medium cursor-pointer"
                onClick={() => setShowEditGroup(true)}
              >
                <Pencil className="group-hover:text-primary group-focus:text-primary! group-hover:scale-[1.1] transition duration-200" size={14} />
                <span>Edit group</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="rounded-xl py-2 px-3 group hover:bg-destructive/10! focus:bg-destructive/10! hover:text-destructive! focus:text-destructive! text-foreground/75 text-[13px] font-medium cursor-pointer"
              onClick={handleDeleteChat}
            >
              <Trash2 className="group-hover:text-destructive group-focus:text-destructive! group-hover:scale-[1.1] transition duration-200" size={14} />
              <span>{isGroup
                ? (chat.createdBy as any) === currentUser._id ? "Delete group" : "Leave group"
                : "Delete chat"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          {activeQuery.isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          )}

          {activeQuery.hasNextPage && (
            <div className="flex justify-center mb-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground cursor-pointer"
                onClick={() => activeQuery.fetchNextPage()}
                disabled={activeQuery.isFetchingNextPage}
              >
                {activeQuery.isFetchingNextPage ? (
                  <Loader2 size={12} className="animate-spin mr-1" />
                ) : null}
                Load older messages
              </Button>
            </div>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.createdBy?._id === currentUser._id || (msg.createdBy as any) === currentUser._id;
            const sender = msg.createdBy as UserType | undefined;
            const senderName = isGroup && !isMe
              ? `${sender?.fName ?? ""} ${sender?.lName ?? ""}`.trim()
              : "";

            // Hide avatar if next message is from same person (compact mode)
            const nextMsg = messages[index + 1];
            const nextIsMe = nextMsg ? (nextMsg.createdBy?._id === currentUser._id || (nextMsg.createdBy as any) === currentUser._id) : true;
            const nextSenderId = nextMsg ? (nextMsg.createdBy?._id ?? nextMsg.createdBy) : null;
            const thisSenderId = msg.createdBy?._id ?? (msg.createdBy as any);
            const showAvatar = !isMe && (nextIsMe || nextSenderId !== thisSenderId);

            // Resolve sender — backend now sends populated createdBy on socket msgs.
            // For paginated REST messages, fall back to chat.participants lookup.
            const senderId = typeof msg.createdBy === "string" ? msg.createdBy : msg.createdBy?._id;
            const resolvedSender: UserType | undefined =
              (typeof msg.createdBy === "object" && msg.createdBy?.fName)
                ? (msg.createdBy as UserType)
                : chat.participants.find((p) => p._id === senderId);

            // Pick avatar source
            const otherParticipant = chat.participants.find((p) => p._id !== currentUser._id);
            const avatarSource = isGroup ? resolvedSender : otherParticipant;
            const avatarSrc = getProfileImageUrl(avatarSource?.profileImage);
            const avatarFallback = (avatarSource?.fName?.charAt(0) ?? "?").toUpperCase();

            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2 group ${isMe ? "justify-end" : "justify-start"}`}
                onMouseEnter={() => setHoveredMsg(msg._id)}
                onMouseLeave={() => setHoveredMsg(null)}
              >
                {/* Delete button (only for own messages) */}
                {isMe && hoveredMsg === msg._id && (
                  <button
                    onClick={() => handleDeleteMessage(msg._id)}
                    className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    title="Delete message"
                  >
                    <Trash2 size={13} />
                  </button>
                )}

                {/* Sender avatar (incoming messages only) */}
                {!isMe && (
                  <div className="w-7 h-7 shrink-0 mb-1">
                    {showAvatar && (
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={avatarSrc ?? undefined} />
                        <AvatarFallback className="text-[10px] font-bold text-white bg-linear-[135deg] from-primary to-accent">
                          {avatarFallback}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}

                {/* Bubble */}
                <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                  {senderName && (
                    <span className="text-[10px] text-muted-foreground mb-0.5 px-1">{senderName}</span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed
                    ${isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                  >
                    {msg.content && <p>{msg.content}</p>}
                    {msg.attachments?.map((att, i) => {
                      const url = getProfileImageUrl(att) ?? att;
                      const filename = att.split("/").pop() ?? `Attachment ${i + 1}`;
                      const isImage = /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(filename);
                      return isImage ? (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block mt-1">
                          <img
                            src={url}
                            alt={filename}
                            className="max-w-50 max-h-50 rounded-lg object-cover border border-white/20"
                          />
                        </a>
                      ) : (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs underline mt-1 opacity-80 break-all"
                        >
                          📎 {filename}
                        </a>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                    {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : ""}
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {attachments.map((f, i) => (
              <div key={i} className="relative group">
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
                  {f.type.startsWith("image/") ? (
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="px-1 text-center leading-tight">{f.name.slice(0, 10)}</span>
                  )}
                </div>
                <button
                  onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute cursor-pointer -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={9} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input — locked for non-friends in OVO chats */}
        {!isFriend ? (
          <div className="px-4 py-4 border-t border-border-strong flex items-center justify-center gap-2.5 shrink-0 bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-base">🔒</span>
              <span>You can't send messages — you're no longer friends.</span>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 border-t border-border-strong flex items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
              }}
            />
            <Button
              className="text-muted-foreground h-8! w-8! p-0! bg-transparent hover:bg-primary/8! hover:text-primary! transition duration-200 cursor-pointer rounded-xl! shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={17} />
            </Button>

            <input
              className="flex-1 bg-muted/60 rounded-xl px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              placeholder={`Message ${isGroup ? chat.groupName : chatName.split(" ")[0]}…`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />

            <Button
              size="icon"
              disabled={(!text.trim() && attachments.length === 0) || isSending}
              onClick={send}
              className="rounded-xl w-8 h-8 shrink-0 bg-primary text-primary-foreground disabled:opacity-30 cursor-pointer"
            >
              {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </Button>
          </div>
        )}
      </div>

      {showEditGroup && (
        <EditGroupModal chat={chat} onClose={() => setShowEditGroup(false)} />
      )}
    </>
  );
}

// Helper: convert File[] to buffer array for socket emission
async function filesToBuffers(files: File[]) {
  return Promise.all(
    files.map(async (f) => ({
      buffer: Array.from(new Uint8Array(await f.arrayBuffer())),
      originalname: f.name,
      mimetype: f.type,
    })),
  );
}
