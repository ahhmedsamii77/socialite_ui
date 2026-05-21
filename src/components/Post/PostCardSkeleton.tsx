import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function PostCardSkeleton() {
  return (
    <Card className="bg-card-base pb-2 border border-border-strong rounded-2xl gap-3! overflow-hidden">
      {/* Header */}
      <CardHeader className="flex justify-between">
        <div className="flex gap-2.5 items-center w-full">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-3 p-0!">
        <div className="px-6 space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>

        {/* Image placeholder */}
        <Skeleton className="w-full h-52 rounded-none" />

        <div className="px-6 mt-4">
          <div className="h-px bg-border-strong w-full" />
        </div>
      </CardContent>

      {/* Footer — Like + Comment + Save */}
      <CardFooter className="flex items-center justify-between pb-0">
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-16 rounded-xl" />
      </CardFooter>
    </Card>
  );
}
