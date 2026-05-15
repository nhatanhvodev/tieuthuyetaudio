import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";

type Episode = {
  id: string;
  episodeNumber: number;
  title: string;
  durationSeconds: number | null;
};

export function EpisodeList({ slug, episodes }: { slug: string; episodes: Episode[] }) {
  return (
    <div className="grid gap-2">
      {episodes.map((episode) => (
        <div key={episode.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-bold">
            {episode.episodeNumber}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{episode.title}</p>
            <p className="text-sm text-muted-foreground">{formatDuration(episode.durationSeconds)}</p>
          </div>
          <Button asChild size="sm">
            <Link href={`/truyen/${slug}/tap/${episode.episodeNumber}`}>
              <Play data-icon="inline-start" />
              Nghe
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
