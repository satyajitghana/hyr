import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function JobsLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="flex flex-wrap gap-1.5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-md" />
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-md" />
            ))}
          </div>
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-md" />
            ))}
          </div>
        </div>
      </div>

      <Skeleton className="h-4 w-24" />

      {/* Job cards */}
      <div className="grid gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-1.5 pt-1">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton
                        key={j}
                        className="h-5 w-16 rounded-full"
                      />
                    ))}
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-lg shrink-0 self-center" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
