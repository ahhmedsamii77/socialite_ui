import { Skeleton } from "@/components/ui/skeleton";

export default function AdminStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border-strong bg-card-base p-4 flex flex-col gap-3"
        >
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-6 w-14 rounded" />
        </div>
      ))}
    </div>
  );
}
