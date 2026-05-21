import { Skeleton } from "@/components/ui/skeleton";

function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      {/* Avatar */}
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />

      {/* Lines */}
      <div className="flex-1 space-y-2 pt-0.5">
        <Skeleton className="h-3.5 w-4/5 rounded-md" />
        <Skeleton className="h-3 w-1/3 rounded-md" />
      </div>

      {/* Dot placeholder */}
      <Skeleton className="w-2 h-2 rounded-full mt-2 shrink-0" />
    </div>
  );
}

export default function NotificationSkeleton() {
  return (
    <div className="divide-y divide-border-strong/40">
      {Array.from({ length: 6 }).map((_, i) => (
        <NotificationItemSkeleton key={i} />
      ))}
    </div>
  );
}
