import { useState } from "react";
import type { PostType, UserType } from "@/types";
import { useHardDeletePost, useFreezePost, useRestorePost } from "@/lib/apis/queries";
import { getProfileImageUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trash2, Snowflake, Heart, MessageCircle,
  Search, Image, Loader2, X, RefreshCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AdminTableSkeleton from "./AdminTableSkeleton";
import useDebounce from "@/hooks/useDebounce";

type Props = { posts: PostType[]; loading?: boolean };

export default function PostsTable({ posts, loading }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch               = useDebounce(searchInput, 400);

  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [freezingId,  setFreezingId]  = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const { mutateAsync: hardDelete  } = useHardDeletePost();
  const { mutateAsync: freezePost  } = useFreezePost();
  const { mutateAsync: restorePost } = useRestorePost();

  const isFiltering = searchInput !== debouncedSearch;

  const filtered = debouncedSearch.trim()
    ? posts.filter((p) => {
        const q      = debouncedSearch.toLowerCase();
        const author = p.createdBy as UserType;
        return (
          p.content?.toLowerCase().includes(q) ||
          author?.username?.toLowerCase().includes(q) ||
          author?.fName?.toLowerCase().includes(q)
        );
      })
    : posts;

  if (loading) return <AdminTableSkeleton />;

  const handleHardDelete = async (postId: string) => {
    if (!confirm("Permanently delete this post? This cannot be undone.")) return;
    setDeletingId(postId);
    try {
      await hardDelete(postId);
      toast.success("Post permanently deleted.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to delete post.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFreeze = async (postId: string) => {
    setFreezingId(postId);
    try {
      await freezePost(postId);
      toast.success("Post frozen.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to freeze post.");
    } finally {
      setFreezingId(null);
    }
  };

  const handleRestore = async (postId: string) => {
    setRestoringId(postId);
    try {
      await restorePost(postId);
      toast.success("Post restored.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to restore post.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border-strong bg-card-base overflow-hidden flex flex-col max-h-100 mb-10">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-strong flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 bg-card-base z-10">
        <div>
          <h3 className="text-[14px] font-bold text-foreground">Posts</h3>
          <p className="text-[12px] text-muted-foreground">
            {debouncedSearch.trim()
              ? `${filtered.length} of ${posts.length} posts`
              : `${posts.length} total posts`}
          </p>
        </div>
        {/* Debounced search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts…"
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
            {debouncedSearch ? `No posts match "${debouncedSearch}"` : "No posts found."}
          </p>
        )}

        {filtered.map((post) => {
          const author     = post.createdBy as UserType;
          const isFrozen   = !!post.deletedAt;
          const isDeleting  = deletingId  === post._id;
          const isFreezing  = freezingId  === post._id;
          const isRestoring = restoringId === post._id;

          return (
            <div
              key={post._id}
              className={`flex items-center gap-2.5 px-5 py-3 transition-colors ${isFrozen ? "opacity-60 bg-destructive/3" : "hover:bg-hover"}`}
            >
              {/* Author avatar */}
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={getProfileImageUrl(author?.profileImage)} />
                <AvatarFallback className="text-white text-[11px] font-bold bg-linear-[135deg] from-primary to-accent">
                  {author?.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">
                  {author?.fName ?? author?.username ?? "Unknown"}
                  {isFrozen && (
                    <span className="ml-1.5 text-[10px] text-destructive font-medium">(frozen)</span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {post.content
                    ? post.content.slice(0, 55) + (post.content.length > 55 ? "…" : "")
                    : <span className="italic">No text content</span>}
                </p>
              </div>

              {/* Attachments */}
              {!!post.attachments?.length && (
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground shrink-0">
                  <Image size={11} />
                  {post.attachments.length}
                </span>
              )}

              {/* Likes */}
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                <Heart size={11} />
                {post.likes?.length ?? 0}
              </span>

              {/* Comments */}
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                <MessageCircle size={11} />
                {post.comments?.length ?? 0}
              </span>

              {/* Freeze — only when not frozen */}
              {!isFrozen && (
                <button
                  onClick={() => handleFreeze(post._id)}
                  disabled={!!freezingId}
                  title="Freeze post"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-500/10 transition cursor-pointer disabled:opacity-50"
                >
                  {isFreezing
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Snowflake size={13} />
                  }
                </button>
              )}

              {/* Restore — only when frozen */}
              {isFrozen && (
                <button
                  onClick={() => handleRestore(post._id)}
                  disabled={!!restoringId}
                  title="Restore post"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-green-500 hover:bg-green-500/10 transition cursor-pointer disabled:opacity-50"
                >
                  {isRestoring
                    ? <Loader2 size={13} className="animate-spin" />
                    : <RefreshCcw size={13} />
                  }
                </button>
              )}

              {/* Hard delete — only when frozen */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <button
                      onClick={() => isFrozen && handleHardDelete(post._id)}
                      disabled={!isFrozen || !!deletingId}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
                        isFrozen
                          ? "text-destructive hover:bg-destructive/10 cursor-pointer"
                          : "text-muted-foreground/30 cursor-not-allowed"
                      } disabled:opacity-50`}
                    >
                      {isDeleting
                        ? <Loader2 size={13} className="animate-spin text-destructive" />
                        : <Trash2 size={13} />
                      }
                    </button>
                  </span>
                </TooltipTrigger>
                {!isFrozen && (
                  <TooltipContent side="top" className="text-[11px]">
                    Freeze post first to permanently delete
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
