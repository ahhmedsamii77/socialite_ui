import PostCardSkeleton from "../Post/PostCardSkeleton";
import { Skeleton } from "../ui/skeleton";

export default function ProfilePostsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="max-w-240 mx-auto rounded-2xl border border-border-strong shadow-md overflow-hidden bg-card">
      <div className="px-6 py-4 border-b border-border-strong flex items-center gap-2.5">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-10 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
      </div>

      <div className="p-5 space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
