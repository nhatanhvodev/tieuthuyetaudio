import { Skeleton } from "@/components/ui/skeleton";

export function StoryCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/80 bg-card/85 p-2.5">
      <Skeleton className="aspect-[3/4] w-full rounded-md" />
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <Skeleton className="mt-1 h-9 w-full rounded-md" />
      </div>
    </div>
  );
}
