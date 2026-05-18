import Link from "next/link";
import { Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatSeconds } from "@/lib/format";
import type { ContinueListeningItem } from "@/lib/series/queries";

export function ContinueListeningShelf({
  items,
  title = "Nghe tiep",
  href
}: {
  items: ContinueListeningItem[];
  title?: string;
  href?: string;
}) {
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
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
                  {item.series.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.series.coverUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                  ) : null}
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
