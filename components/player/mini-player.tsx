"use client";

import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePlayerStore } from "@/stores/player-store";

export function MiniPlayer() {
  const current = usePlayerStore((state) => state.current);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const togglePlay = usePlayerStore((state) => state.togglePlay);

  if (!current) return null;

  const percent = progress.durationSeconds > 0 ? (progress.currentSeconds / progress.durationSeconds) * 100 : 0;

  return (
    <aside className="fixed inset-x-3 bottom-[4.7rem] z-40 rounded-xl border bg-card/96 p-3 shadow-2xl backdrop-blur md:bottom-4 md:left-auto md:right-4 md:w-[420px]">
      <div className="flex items-center gap-3">
        <div className="size-11 shrink-0 rounded-md bg-gradient-to-br from-amber-400 via-teal-400 to-violet-500" />
        <Link href={`/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{current.title}</p>
          <p className="truncate text-xs text-muted-foreground">{current.seriesTitle}</p>
        </Link>
        <Button type="button" size="icon" onClick={togglePlay} aria-label={isPlaying ? "Tam dung" : "Phat"}>
          {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </Button>
      </div>
      <Progress value={percent} className="mt-3" />
    </aside>
  );
}
