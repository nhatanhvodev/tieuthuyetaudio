import Link from "next/link";
import { Play } from "lucide-react";
import { CoverImage } from "@/components/common/cover-image";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSeconds } from "@/lib/format";
import type { ContinueListeningItem } from "@/lib/series/queries";

export function ContinueListeningShelf({
  items,
  title = "Nghe tiep",
  href,
  loading
}: {
  items: ContinueListeningItem[];
  title?: string;
  href?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black">{title}</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card/90 p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-14 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
                <Skeleton className="size-9 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-2 w-full rounded" />
              <Skeleton className="mt-2 h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8" style={{ contentVisibility: "auto", containIntrinsicSize: "560px" }}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black">{title}</h2>
        {href ? <Link href={href} className="text-sm font-semibold text-accent">Xem tat ca</Link> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const episodeHref = `/truyen/${item.series.slug}/tap/${item.episode.episodeNumber}`;
          return (
            <article key={item.progressId} className="rounded-lg border bg-card/90 p-3">
              <div className="flex items-center gap-3">
                <Link href={episodeHref} className="relative size-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <CoverImage src={item.series.coverUrl} alt={item.series.title} sizes="56px" className="absolute inset-0 size-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.series.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.episode.title}</p>
                </div>
                <Button asChild size="icon" aria-label={`Tiep tuc nghe ${item.episode.title}`}>
                  <Link href={episodeHref}>
                    <Play aria-hidden="true" />
                  </Link>
                </Button>
              </div>

              <Progress value={item.percentCompleted} className="mt-3" />
              <p className="mt-2 text-xs text-muted-foreground">
                {item.percentCompleted}% - {formatSeconds(item.currentSeconds)} / {formatSeconds(item.durationSeconds)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
