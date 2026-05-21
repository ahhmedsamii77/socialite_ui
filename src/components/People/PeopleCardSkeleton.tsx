import { Skeleton } from "@/components/ui/skeleton";

export function PeopleCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border-strong bg-card overflow-hidden">
      {/* Cover */}
      <Skeleton className="h-20 w-full rounded-none" />

      {/* Avatar */}
      <div className="px-4 -mt-7 mb-1">
        <Skeleton className="w-14 h-14 rounded-full border-[2.5px] border-card" />
      </div>

      <div className="px-4 pb-4 space-y-2">
        {/* Name */}
        <Skeleton className="h-3.5 w-28 rounded-full" />
        {/* Username */}
        <Skeleton className="h-3 w-20 rounded-full" />

        {/* Divider */}
        <div className="h-px bg-border-strong mt-3" />

        {/* Stats */}
        <div className="flex items-center gap-4 pt-1">
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-3.5 w-8 rounded-full" />
            <Skeleton className="h-2.5 w-10 rounded-full" />
          </div>
          <div className="w-px h-6 bg-border-strong" />
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-3.5 w-8 rounded-full" />
            <Skeleton className="h-2.5 w-8 rounded-full" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 flex-1 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PeopleCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PeopleCardSkeleton key={i} />
      ))}
    </div>
  );
}
