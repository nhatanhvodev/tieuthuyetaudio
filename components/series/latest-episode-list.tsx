import Link from "next/link";
import { Clock3, Headphones, Play } from "lucide-react";
import { CoverImage } from "@/components/common/cover-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCount, formatDuration } from "@/lib/format";

type LatestEpisode = {
  id: string;
  episodeNumber: number;
  title: string;
  durationSeconds: number | null;
  listenCount: number;
  series: {
    slug: string;
    title: string;
    coverUrl: string | null;
    producer: string | null;
  };
};

export function LatestEpisodeList({ episodes }: { episodes: LatestEpisode[] }) {
  if (!episodes.length) return null;

  return (
    <div className="grid gap-2">
      {episodes.map((episode) => (
        <article key={episode.id} className="flex items-center gap-3 rounded-lg border bg-card/90 p-2.5 transition hover:border-accent/60 hover:bg-card motion-reduce:transition-none">
          <Link href={`/truyen/${episode.series.slug}`} className="relative flex size-16 shrink-0 items-end overflow-hidden rounded-md bg-secondary" aria-label={episode.series.title}>
            <CoverImage src={episode.series.coverUrl} alt={episode.series.title} sizes="64px" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <span className="relative p-1.5 text-xs font-black text-white">{episode.episodeNumber}</span>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Moi cap nhat</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock3 aria-hidden="true" className="size-3.5" />
                {formatDuration(episode.durationSeconds)}
              </span>
            </div>
            <Link href={`/truyen/${episode.series.slug}/tap/${episode.episodeNumber}`} className="mt-1 block truncate font-semibold">
              {episode.title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="truncate">{episode.series.title}</span>
              <span className="inline-flex items-center gap-1">
                <Headphones aria-hidden="true" className="size-4" />
                {formatCount(episode.listenCount)}
              </span>
            </div>
          </div>
          <Button asChild size="icon" aria-label={`Nghe ${episode.title}`}>
            <Link href={`/truyen/${episode.series.slug}/tap/${episode.episodeNumber}`}>
              <Play aria-hidden="true" />
            </Link>
          </Button>
        </article>
      ))}
    </div>
  );
}
