import { Skeleton } from "@/components/ui/skeleton";

export default function MobileNavSkeleton() {
  return (
    <aside className="fixed bottom-0 md:hidden z-50 right-0 left-0 bg-background border-t flex items-center justify-center">
      <ul className="flex justify-around items-center py-5 px-2 w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex flex-col items-center gap-1.5">
            {/* Icon placeholder */}
            <Skeleton className="w-5 h-5 rounded-md" />
            {/* Label placeholder */}
            <Skeleton className="w-8 h-2 rounded-full" />
          </li>
        ))}
      </ul>
    </aside>
  );
}
