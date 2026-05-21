import { Skeleton } from "../ui/skeleton";

export default function SuggestionSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2.5 px-2">
      {/* Avatar */}
      <Skeleton className="w-9 h-9 rounded-full shrink-0" />

      {/* Name + sub */}
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 rounded-full w-24" />
        <Skeleton className="h-2.5 rounded-full w-16" />
      </div>

      {/* Add button */}
      <Skeleton className="h-7 w-14 rounded-full shrink-0" />
    </div>
  );
}
