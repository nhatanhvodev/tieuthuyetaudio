"use client";

import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { featureFlags } from "@/lib/features";
import { usePlayerStore } from "@/stores/player-store";

export function MiniPlayer() {
  const pathname = usePathname();
  const current = usePlayerStore((state) => state.current);
  const queue = usePlayerStore((state) => state.queue);
  const currentQueueIndex = usePlayerStore((state) => state.currentQueueIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const autoPlayNext = usePlayerStore((state) => state.autoPlayNext);
  const togglePlay = usePlayerStore((state) => state.togglePlay);

  if (!current) return null;
  if (pathname === `/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`) return null;

  const percent = progress.durationSeconds > 0 ? (progress.currentSeconds / progress.durationSeconds) * 100 : 0;
  const nextEpisode = currentQueueIndex >= 0 ? queue[currentQueueIndex + 1] ?? null : null;
  const showNextUp = featureFlags.continuousPlay && autoPlayNext && Boolean(nextEpisode) && percent >= 85;

  return (
    <aside className="fixed inset-x-3 bottom-[4.7rem] z-40 rounded-lg border bg-card/96 p-3 shadow-2xl backdrop-blur md:bottom-4 md:left-auto md:right-4 md:w-[420px]">
      <div className="flex items-center gap-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-secondary">
          {current.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.coverUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
          ) : null}
        </div>
        <Link href={`/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{current.title}</p>
          <p className="truncate text-xs text-muted-foreground">{current.seriesTitle}</p>
          {showNextUp && nextEpisode ? (
            <p className="mt-1 truncate text-[11px] text-accent">Sap phat tiep: {nextEpisode.title}</p>
          ) : null}
        </Link>
        <Button type="button" size="icon" onClick={togglePlay} aria-label={isPlaying ? "Tam dung" : "Phat"}>
          {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </Button>
      </div>
      <Progress value={percent} className="mt-3" />
    </aside>
  );
}
