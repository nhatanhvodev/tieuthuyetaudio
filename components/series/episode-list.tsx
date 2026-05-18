import Link from "next/link";
import { Headphones, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCount, formatDuration } from "@/lib/format";

type Episode = {
  id: string;
  episodeNumber: number;
  title: string;
  durationSeconds: number | null;
  listenCount?: number | null;
  audioUrl?: string | null;
};

export function EpisodeList({
  slug,
  episodes,
  coverUrl,
  currentEpisodeNumber
}: {
  slug: string;
  episodes: Episode[];
  coverUrl?: string | null;
  currentEpisodeNumber?: number;
}) {
  return (
    <div className="grid gap-2">
      {episodes.map((episode) => {
        const isCurrent = episode.episodeNumber === currentEpisodeNumber;
        return (
          <div
            key={episode.id}
            className={`flex items-center gap-3 rounded-lg border bg-card/90 p-2.5 transition hover:border-accent/60 hover:bg-card ${
              isCurrent ? "border-accent" : ""
            }`}
          >
            <div className="relative flex size-14 shrink-0 items-end overflow-hidden rounded-md bg-secondary">
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <span className="relative p-1.5 text-xs font-black text-white">{episode.episodeNumber}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{episode.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span>{formatDuration(episode.durationSeconds)}</span>
                <span className="inline-flex items-center gap-1">
                  <Headphones aria-hidden="true" className="size-4" />
                  {formatCount(episode.listenCount ?? 0)}
                </span>
                {isCurrent ? <span className="text-accent">Dang nghe</span> : null}
              </div>
            </div>
            <Button asChild size="icon" aria-label={`Nghe ${episode.title}`} disabled={!episode.audioUrl}>
              <Link href={`/truyen/${slug}/tap/${episode.episodeNumber}`}>
                <Play aria-hidden="true" />
              </Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
