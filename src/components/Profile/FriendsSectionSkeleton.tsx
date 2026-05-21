import { Skeleton } from "../ui/skeleton";

export function FriendCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border-strong">
      <Skeleton className="w-16 h-16 rounded-full" />

      <div className="space-y-2 w-full text-center">
        <Skeleton className="h-3.5 w-24 mx-auto rounded-full" />
        <Skeleton className="h-3 w-16 mx-auto rounded-full" />
      </div>

      <div className="w-full h-px bg-border-strong mt-1" />

      <div className="flex items-center justify-between w-full">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-14 rounded-full" />
      </div>
    </div>
  );
}

export default function FriendsSectionSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="max-w-240 mx-auto rounded-2xl border border-border-strong shadow-md overflow-hidden bg-card">
      <div className="px-6 py-4 border-b border-border-strong flex items-center gap-2.5">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
      </div>

      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <FriendCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
