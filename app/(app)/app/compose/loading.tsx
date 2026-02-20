import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ComposeLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        {/* Left Panel */}
        <div className="space-y-4">
          {/* Resume Selection card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border p-3"
                >
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Job Details card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <Card className="h-full">
          <CardContent className="p-5 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 border-b pb-2">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>
            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
