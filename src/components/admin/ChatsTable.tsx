import { useState } from "react";
import type { ChatType } from "@/types";
import {
  Search, Loader2, X, Users, MessageSquare,
  Trash2, Snowflake, RefreshCcw,
} from "lucide-react";
import { getProfileImageUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import useDebounce from "@/hooks/useDebounce";
import AdminTableSkeleton from "./AdminTableSkeleton";
import { useFreezeChat, useRestoreChat, useHardDeleteChat } from "@/lib/apis/queries";
import toast from "react-hot-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = { chats: ChatType[]; loading?: boolean };

export default function ChatsTable({ chats, loading }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const isFiltering = searchInput !== debouncedSearch;

  const [freezingId,  setFreezingId]  = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);

  const { mutateAsync: doFreeze }      = useFreezeChat();
  const { mutateAsync: doRestore }     = useRestoreChat();
  const { mutateAsync: doHardDelete }  = useHardDeleteChat();

  const filtered = debouncedSearch.trim()
    ? chats.filter((c) => {
        const q = debouncedSearch.toLowerCase();
        if (c.groupName?.toLowerCase().includes(q)) return true;
        return c.participants?.some(
          (p: any) =>
            p?.username?.toLowerCase().includes(q) ||
            p?.fName?.toLowerCase().includes(q) ||
            p?.lName?.toLowerCase().includes(q),
        );
      })
    : chats;

  const totalGroups  = chats.filter((c) => !!c.groupName).length;
  const totalDirect  = chats.filter((c) => !c.groupName).length;
  const totalFrozen  = chats.filter((c) => !!c.deletedAt).length;

  const handleFreeze = async (chatId: string) => {
    if (!confirm("Freeze this chat? Participants will lose access to it.")) return;
    setFreezingId(chatId);
    try {
      await doFreeze(chatId);
      toast.success("Chat frozen.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to freeze chat.");
    } finally {
      setFreezingId(null);
    }
  };

  const handleRestore = async (chatId: string) => {
    setRestoringId(chatId);
    try {
      await doRestore(chatId);
      toast.success("Chat restored.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to restore chat.");
    } finally {
      setRestoringId(null);
    }
  };

  const handleHardDelete = async (chatId: string) => {
    if (!confirm("Permanently delete this chat? This cannot be undone.")) return;
    setDeletingId(chatId);
    try {
      await doHardDelete(chatId);
      toast.success("Chat permanently deleted.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to delete chat.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <AdminTableSkeleton />;

  return (
    <div className="rounded-2xl border border-border-strong bg-card-base overflow-hidden flex flex-col max-h-[480px] mb-10">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-strong flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 bg-card-base z-10">
        <div>
          <h3 className="text-[14px] font-bold text-foreground">Chats</h3>
          <p className="text-[12px] text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>{chats.length} total</span>
            <span className="text-border-strong">·</span>
            <span className="text-primary">{totalGroups} groups</span>
            <span className="text-border-strong">·</span>
            <span>{totalDirect} direct</span>
            {totalFrozen > 0 && (
              <>
                <span className="text-border-strong">·</span>
                <span className="text-destructive">{totalFrozen} frozen</span>
              </>
            )}
          </p>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search chats…"
            className="pl-8 pr-8 h-8 text-[13px] rounded-xl bg-input-base border border-input focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all duration-200 w-52"
          />
          {isFiltering && (
            <Loader2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary animate-spin" />
          )}
          {!isFiltering && searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border-strong overflow-y-auto flex-1">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-[13px] py-8">
            {debouncedSearch ? `No chats match "${debouncedSearch}"` : "No chats found."}
          </p>
        )}

        {filtered.map((chat) => {
          const isGroup     = !!chat.groupName;
          const isFrozen    = !!chat.deletedAt;
          const isFreezing  = freezingId  === chat._id;
          const isRestoring = restoringId === chat._id;
          const isDeleting  = deletingId  === chat._id;

          return (
            <div
              key={chat._id}
              className={`flex items-center gap-2.5 px-5 py-3 transition-colors ${
                isFrozen ? "opacity-60 bg-destructive/3" : "hover:bg-hover"
              }`}
            >
              {/* Avatar */}
              {isGroup ? (
                <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Users size={14} className="text-primary" />
                </div>
              ) : (
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage
                    src={getProfileImageUrl((chat.participants?.[0] as any)?.profileImage)}
                  />
                  <AvatarFallback className="text-white text-[11px] font-bold bg-linear-[135deg] from-primary to-accent">
                    {(chat.participants?.[0] as any)?.username?.slice(0, 2).toUpperCase() ?? "??"}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate flex items-center gap-1.5">
                  {isGroup
                    ? chat.groupName
                    : (chat.participants
                        ?.map((p: any) => `${p?.fName ?? ""} ${p?.lName ?? ""}`.trim())
                        .filter(Boolean)
                        .join(" & ") || "Direct Chat"
                    )}
                  {isFrozen && (
                    <span className="text-[10px] text-destructive font-medium">(frozen)</span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {isGroup ? (
                    <span className="flex items-center gap-1">
                      <Users size={10} />
                      {chat.participants?.length ?? 0} participants
                    </span>
                  ) : (
                    chat.participants?.map((p: any) => `@${p?.username ?? ""}`).join(", ")
                  )}
                </p>
              </div>

              {/* Type badge */}
              <span
                className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isGroup
                    ? "bg-primary/10 text-primary"
                    : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                }`}
              >
                {isGroup ? "Group" : "Direct"}
              </span>

              {/* Messages count */}
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                <MessageSquare size={11} />
                {chat.messages?.length ?? 0}
              </span>

              {/* Date */}
              <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:block">
                {chat.createdAt ? format(new Date(chat.createdAt), "MMM d, yyyy") : ""}
              </span>

              {/* Freeze — only when not frozen */}
              {!isFrozen && (
                <button
                  onClick={() => handleFreeze(chat._id)}
                  disabled={!!freezingId}
                  title="Freeze chat"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-500/10 transition cursor-pointer disabled:opacity-50"
                >
                  {isFreezing
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Snowflake size={13} />}
                </button>
              )}

              {/* Restore — only when frozen */}
              {isFrozen && (
                <button
                  onClick={() => handleRestore(chat._id)}
                  disabled={!!restoringId}
                  title="Restore chat"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-green-500 hover:bg-green-500/10 transition cursor-pointer disabled:opacity-50"
                >
                  {isRestoring
                    ? <Loader2 size={13} className="animate-spin" />
                    : <RefreshCcw size={13} />}
                </button>
              )}

              {/* Hard Delete — tooltip if not frozen yet */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <button
                      onClick={() => isFrozen && handleHardDelete(chat._id)}
                      disabled={!isFrozen || !!deletingId}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
                        isFrozen
                          ? "text-destructive hover:bg-destructive/10 cursor-pointer"
                          : "text-muted-foreground/30 cursor-not-allowed"
                      } disabled:opacity-50`}
                    >
                      {isDeleting
                        ? <Loader2 size={13} className="animate-spin text-destructive" />
                        : <Trash2 size={13} />}
                    </button>
                  </span>
                </TooltipTrigger>
                {!isFrozen && (
                  <TooltipContent side="top" className="text-[11px]">
                    Freeze chat first to permanently delete
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}
