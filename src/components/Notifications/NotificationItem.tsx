import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfileImageUrl } from "@/lib/utils";
import type { NotificationType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, UserCheck, UserPlus, Reply, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarkOneRead, useDeleteNotification } from "@/lib/apis/queries";

const typeIcon: Record<NotificationType["type"], { bg: string; icon: React.ReactNode }> = {
  friend_request: {
    bg: "bg-primary/15",
    icon: <UserPlus size={12} className="text-primary" />,
  },
  friend_accepted: {
    bg: "bg-emerald-500/15",
    icon: <UserCheck size={12} className="text-emerald-500" />,
  },
  post_like: {
    bg: "bg-rose-500/15",
    icon: <Heart size={12} className="text-rose-500" />,
  },
  post_comment: {
    bg: "bg-blue-500/15",
    icon: <MessageCircle size={12} className="text-blue-500" />,
  },
  comment_like: {
    bg: "bg-rose-500/15",
    icon: <Heart size={12} className="text-rose-500" />,
  },
  comment_reply: {
    bg: "bg-accent/20",
    icon: <Reply size={12} className="text-accent" />,
  },
};

export default function NotificationItem({ notification }: { notification: NotificationType }) {
  const { mutateAsync: markRead, isPending: isMarking } = useMarkOneRead();
  const { mutateAsync: deleteNotif, isPending: isDeleting } = useDeleteNotification();

  const sender = notification.sender;
  const initials = sender?.username?.slice(0, 2).toUpperCase() ?? "??";
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
  const { bg, icon } = typeIcon[notification.type] ?? typeIcon.post_like;

  const handleMarkRead = () => {
    if (!notification.isRead && !isMarking) markRead(notification._id);
  };

  return (
    <div
      onClick={handleMarkRead}
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3.5 transition-all duration-200",
        "border-l-2",
        !notification.isRead
          ? "bg-primary/4 border-primary/40 cursor-pointer hover:bg-primary/[0.07]"
          : "border-transparent",
        isMarking && "pointer-events-none",
      )}
    >
      {/* Avatar + type icon */}
      <div className="relative shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={getProfileImageUrl(sender?.profileImage)}
            alt={sender?.username}
            className="object-cover"
          />
          <AvatarFallback className="text-xs font-bold bg-linear-[135deg] from-primary to-accent text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        {/* Type icon badge */}
        <span
          className={cn(
            "absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full flex items-center justify-center ring-2 ring-card",
            bg,
          )}
        >
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <p
          className={cn(
            "text-[13px] leading-snug",
            notification.isRead ? "text-muted-foreground" : "text-foreground font-medium",
          )}
        >
          {notification?.message}
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-0.5">{timeAgo}</p>
      </div>

      {/* Right side: unread dot OR loading spinner, + delete */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
        {/* Mark-read loading spinner */}
        {isMarking ? (
          <Loader2 size={13} className="animate-spin text-primary" />
        ) : !notification.isRead ? (
          <span className="w-2 h-2 rounded-full bg-linear-[135deg] from-primary to-accent shrink-0" />
        ) : null}

        {/* Delete button — visible on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isDeleting) deleteNotif(notification?._id);
          }}
          disabled={isDeleting}
          title="Delete"
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "w-6 h-6 rounded-full flex items-center justify-center",
            "hover:bg-destructive/15 hover:text-destructive text-muted-foreground/50 cursor-pointer",
            isDeleting && "opacity-100",
          )}
        >
          {isDeleting ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Trash2 size={12} />
          )}
        </button>
      </div>
    </div>
  );
}
