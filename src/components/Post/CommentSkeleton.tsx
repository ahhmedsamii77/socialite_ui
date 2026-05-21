import { Skeleton } from "../ui/skeleton";

export default function CommentSkeleton() {
  return (
    <div className="flex items-start gap-2.5">
      {/* Avatar */}
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />

      <div className="flex-1 space-y-1.5">
        {/* Bubble */}
        <div className="bg-input-base border border-border-strong rounded-2xl px-3.5 py-2.5 mr-2 space-y-2">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-3/4 rounded-full" />
          <Skeleton className="h-2.5 w-16 rounded-full mt-1" />
        </div>
        {/* Like placeholder */}
        <Skeleton className="h-5 w-12 rounded-full ml-1" />
      </div>
    </div>
  );
}
