import Link from "next/link";
import { Headphones, Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SeriesWithRelations } from "@/lib/series/queries";
import { formatCount, formatStatus } from "@/lib/format";

function Cover({ title }: { title: string }) {
  return (
    <div className="flex aspect-[3/4] items-end rounded-lg bg-gradient-to-br from-amber-400 via-teal-400 to-violet-500 p-3 shadow-lg shadow-black/20">
      <p className="line-clamp-3 text-sm font-black leading-tight text-slate-950">{title}</p>
    </div>
  );
}

export function StoryCard({ series }: { series: SeriesWithRelations }) {
  const firstEpisode = series.episodes[0];
  return (
    <article className="group min-w-0 rounded-lg border bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary/50">
      <Link href={`/truyen/${series.slug}`} aria-label={series.title}>
        <Cover title={series.title} />
      </Link>
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={series.status === "COMPLETED" ? "accent" : "secondary"}>{formatStatus(series.status)}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star aria-hidden="true" /> {series.averageRating.toFixed(1)}
          </span>
        </div>
        <Link href={`/truyen/${series.slug}`} className="line-clamp-2 min-h-10 font-bold leading-5">
          {series.title}
        </Link>
        <p className="truncate text-sm text-muted-foreground">{series.producer ?? "Demo Studio"}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Headphones aria-hidden="true" /> {formatCount(series.listenCount)}
          </span>
          <span>{series.episodeCount} tap</span>
        </div>
        <Button asChild size="sm" className="mt-1 w-full">
          <Link href={firstEpisode ? `/truyen/${series.slug}/tap/${firstEpisode.episodeNumber}` : `/truyen/${series.slug}`}>
            <Play data-icon="inline-start" />
            Nghe thu
          </Link>
        </Button>
      </div>
    </article>
  );
}
