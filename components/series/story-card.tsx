import Link from "next/link";
import { Headphones, Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SeriesWithRelations } from "@/lib/series/queries";
import { formatCount, formatStatus } from "@/lib/format";

function Cover({ title, coverUrl }: { title: string; coverUrl?: string | null }) {
  return (
    <div className="relative flex aspect-[3/4] items-end overflow-hidden rounded-md bg-secondary shadow-lg shadow-black/25">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-105" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      <p className="relative line-clamp-3 p-3 text-sm font-black leading-tight text-white">{title}</p>
    </div>
  );
}

export function StoryCard({ series }: { series: SeriesWithRelations }) {
  const firstEpisode = series.episodes[0];
  return (
    <article className="group min-w-0 rounded-lg border bg-card/90 p-2.5 transition hover:-translate-y-0.5 hover:border-accent/60 hover:bg-card">
      <Link href={`/truyen/${series.slug}`} aria-label={series.title}>
        <Cover title={series.title} coverUrl={series.coverUrl} />
      </Link>
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={series.status === "COMPLETED" ? "accent" : "secondary"}>{formatStatus(series.status)}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star aria-hidden="true" className="size-3.5" /> {series.averageRating.toFixed(1)}
          </span>
        </div>
        <Link href={`/truyen/${series.slug}`} className="line-clamp-2 min-h-10 font-bold leading-5">
          {series.title}
        </Link>
        <p className="truncate text-sm text-muted-foreground">{series.producer ?? "Xưởng Audio"}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Headphones aria-hidden="true" className="size-3.5" /> {formatCount(series.listenCount)}
          </span>
          <span>{series.episodeCount} tập</span>
        </div>
        <Button asChild size="sm" className="mt-1 w-full">
          <Link href={firstEpisode ? `/truyen/${series.slug}/tap/${firstEpisode.episodeNumber}` : `/truyen/${series.slug}`}>
            <Play data-icon="inline-start" />
            Nghe thử
          </Link>
        </Button>
      </div>
    </article>
  );
}
