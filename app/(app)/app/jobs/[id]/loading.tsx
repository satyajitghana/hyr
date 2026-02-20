import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function JobDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Job header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-64" />
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-5 w-16 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
            <Skeleton className="h-9 w-28 rounded-md shrink-0" />
          </div>
        </CardContent>
      </Card>

      {/* Content grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* About the Role */}
        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-px w-full my-2" />
            <Skeleton className="h-5 w-28" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="h-4 w-4 rounded shrink-0" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
