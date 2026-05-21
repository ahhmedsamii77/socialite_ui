import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function ProfileHeaderSkeleton() {
  return (
    <Card className="max-w-240 mx-auto rounded-2xl overflow-hidden shadow-md p-0 border border-border-strong">
      <CardContent className="p-0">
        {/* Cover */}
        <Skeleton className="h-52 sm:h-60 w-full rounded-none" />

        <div className="px-5 sm:px-8 pb-6">
          {/* Avatar only row */}
          <div className="-mt-12 sm:-mt-14 mb-5">
            <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-card" />
          </div>

          {/* Name + handle + online pill */}
          <div className="space-y-2 mb-4">
            {/* Name row */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            {/* @handle · online pill row */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-1" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>

          {/* Stats row + action buttons */}
          <div className="flex items-center justify-between gap-4">
            {/* Stats */}
            <div className="flex items-center gap-5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-px" />
              <Skeleton className="h-4 w-14" />
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
