import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkAllRead,
  useClearAllNotifications,
} from "@/lib/apis/queries";
import { Bell, CheckCheck, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NotificationType } from "@/types";
import NotificationSkeleton from "@/components/Notifications/NotificationSkeleton";
import NotificationItem from "@/components/Notifications/NotificationItem";

export default function AlertsPage() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetNotifications();

  const { data: unreadCount = 0 } = useGetUnreadCount();
  const { mutateAsync: markAll, isPending: isMarkingAll } = useMarkAllRead();
  const { mutateAsync: clearAll, isPending: isClearing } = useClearAllNotifications();

  const notifications: NotificationType[] =
    data?.pages.flatMap((page: any) => page.data.data.notifications) ?? [];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up pb-10">

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-[135deg] from-primary to-accent flex items-center justify-center shadow-[0_4px_16px_hsl(var(--primary)/.3)]">
            <Bell size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">Notifications</h1>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              disabled={isMarkingAll}
              onClick={() => markAll()}
              className="text-xs text-muted-foreground hover:bg-primary/18! hover:text-primary gap-1.5 h-8 rounded-lg cursor-pointer"
            >
              {isMarkingAll
                ? <Loader2 size={13} className="animate-spin" />
                : <CheckCheck size={13} />}
              <span className="hidden sm:inline">Mark all read</span>
            </Button>
          )}

          {notifications?.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              disabled={isClearing}
              onClick={() => clearAll()}
              className="transition-opacity duration-200 h-8 rounded-lg flex items-center justify-center
              gap-1.5 text-xs
            hover:bg-destructive/15 hover:text-destructive text-muted-foreground/50 cursor-pointer"
            >
              {isClearing
                ? <Loader2 size={13} className="animate-spin" />
                : <Trash2 size={13} />}
              <span className="hidden sm:inline">Clear all</span>
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border-strong bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">

        {isLoading && <NotificationSkeleton />}

        {!isLoading && notifications?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Bell size={28} className="text-muted-foreground/30" />
            </div>
            <div>
              <p className="font-semibold text-foreground">All caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">
                No notifications yet — we'll let you know when something happens.
              </p>
            </div>
          </div>
        )}

        {!isLoading && notifications?.length > 0 && (
          <div className="divide-y divide-border-strong/40 animate-fade-in-up">
            {notifications.map((n) => (
              <NotificationItem key={n?._id} notification={n} />
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="p-4 border-t border-border-strong/40 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-xs text-muted-foreground hover:text-primary gap-1.5 cursor-pointer"
            >
              {isFetchingNextPage && <Loader2 size={13} className="animate-spin" />}
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
