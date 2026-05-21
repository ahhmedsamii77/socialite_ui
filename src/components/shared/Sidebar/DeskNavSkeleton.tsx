import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeskNavSkeleton() {
  return (
    <aside className="sticky top-0 h-screen xl:w-80 xl:py-5 xl:px-6 px-2 py-5 bg-background border-r md:flex flex-col justify-between hidden w-20">
      {/* Top section */}
      <div className="flex flex-col gap-7 items-center xl:block xl:space-y-7">
        {/* Logo */}
        <div className="flex gap-2 items-center">
          <Skeleton className="w-9.5 h-9.5 rounded-lg shrink-0" />
          <Skeleton className="h-5 w-24 hidden xl:block" />
        </div>

        <div className="xl:space-y-6 flex flex-col justify-center items-center gap-6 xl:block">
          {/* UserAvatar skeleton */}
          <div className="flex items-center gap-3 xl:border xl:border-border-strong rounded-xl p-3 w-full">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex flex-col gap-2 flex-1 hidden xl:flex">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>

          {/* Nav links skeleton — 6 items */}
          <ul className="space-y-2 w-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                <Skeleton className="w-5 h-5 rounded-md shrink-0" />
                <Skeleton className="h-3 w-20 hidden xl:block" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator className="bg-linear-90 from-transparent via-foreground/5 to-transparent my-5" />

      {/* Bottom section */}
      <div className="xl:space-y-2 flex flex-col gap-2 justify-center items-center xl:block">
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </aside>
  );
}
