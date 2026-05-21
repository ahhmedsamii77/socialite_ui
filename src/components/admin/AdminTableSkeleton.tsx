import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border-strong bg-card-base overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-strong flex items-center justify-between">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-8 w-48 rounded-xl" />
      </div>
      {/* Rows */}
      <div className="divide-y divide-border-strong">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-2.5 w-24 rounded" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
