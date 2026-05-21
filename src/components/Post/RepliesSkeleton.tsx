import { Skeleton } from "../ui/skeleton";

export function RepliesSkeleton() {
  return (
    <div className="space-y-2.5">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-start gap-2">
          <Skeleton className="w-6 h-6 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-2.5 w-20 rounded-full" />
            <Skeleton className="h-2 w-40 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}