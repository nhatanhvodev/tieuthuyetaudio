"use client";

import Link from "next/link";
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatTimeSmart } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";

export function MiniPlayer() {
  const pathname = usePathname();
  const current = usePlayerStore((state) => state.current);
  const queue = usePlayerStore((state) => state.queue);
  const currentQueueIndex = usePlayerStore((state) => state.currentQueueIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const volume = usePlayerStore((state) => state.volume);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const requestSeek = usePlayerStore((state) => state.requestSeek);
  const playNextInQueue = usePlayerStore((state) => state.playNextInQueue);
  const playPrevInQueue = usePlayerStore((state) => state.playPrevInQueue);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (!current || pathname === `/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`) return;

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && (target.isContentEditable || Boolean(target.closest("button"))))
      ) {
        return;
      }

      switch (event.key) {
        case " ":
          event.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft": {
          event.preventDefault();
          const { currentSeconds } = usePlayerStore.getState().progress;
          requestSeek(currentSeconds - 10);
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          const { currentSeconds } = usePlayerStore.getState().progress;
          requestSeek(currentSeconds + 10);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [current, pathname, requestSeek, togglePlay]);

  if (!current) return null;
  if (pathname === `/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`) return null;

  const percent = progress.durationSeconds > 0 ? Math.max(0, Math.min(100, (progress.currentSeconds / progress.durationSeconds) * 100)) : 0;
  const nextEpisode = currentQueueIndex >= 0 ? queue[currentQueueIndex + 1] ?? null : null;
  const prevEpisode = currentQueueIndex > 0 ? queue[currentQueueIndex - 1] ?? null : null;
  const currentTimeLabel = formatTimeSmart(progress.currentSeconds, progress.durationSeconds);
  const durationLabel = formatTimeSmart(progress.durationSeconds, progress.durationSeconds);
  const hasDuration = progress.durationSeconds > 0;
  const miniTimeDisplay = hasDuration ? `${currentTimeLabel} / ${durationLabel}` : "Đang tải thời lượng...";
  const mobileTimeDisplay = hasDuration ? currentTimeLabel : "Đang tải...";

  return (
    <aside className="fixed inset-x-3 bottom-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom)+0.65rem)] z-40 rounded-2xl border border-[var(--player-border)] bg-[linear-gradient(135deg,var(--player-shell),color-mix(in_srgb,var(--player-shell)_82%,var(--accent)_16%))] p-2.5 shadow-[0_20px_40px_rgba(120,53,15,0.16)] backdrop-blur-lg md:inset-x-0 md:bottom-6 md:left-1/2 md:max-w-4xl md:-translate-x-1/2 md:p-3 md:px-4">
      <div className="relative mb-2 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--foreground)_12%,transparent)]">
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>

      <div className="hidden items-center gap-4 md:grid md:grid-cols-[auto_1fr_auto_auto]">
        <Link href={`/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`} className="flex items-center gap-3 min-w-0">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-secondary/20">
            {current.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.coverUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 size-full object-cover transition-transform duration-500 ${isPlaying ? "animate-[spin_14s_linear_infinite]" : ""}`}
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{current.title}</p>
            <p className="truncate text-xs text-muted-foreground">{current.seriesTitle}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="icon" className="h-9 w-9 rounded-full" onClick={() => playPrevInQueue()} disabled={!prevEpisode} aria-label="Tập trước">
            <SkipBack aria-hidden="true" className="size-4" />
          </Button>
          <Button type="button" size="icon" className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:brightness-95" onClick={togglePlay} aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
            {isPlaying ? <Pause aria-hidden="true" className="size-5" /> : <Play aria-hidden="true" className="size-5 translate-x-[1px]" />}
          </Button>
          <Button type="button" variant="secondary" size="icon" className="h-9 w-9 rounded-full" onClick={() => playNextInQueue()} disabled={!nextEpisode} aria-label="Tập tiếp theo">
            <SkipForward aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <p className="text-xs tabular-nums text-muted-foreground">{miniTimeDisplay}</p>

        <label className="flex items-center gap-2">
          <Volume2 className="size-4 text-muted-foreground" aria-hidden="true" />
          <input
            aria-label="Âm lượng mini player"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="h-1.5 w-24 cursor-pointer accent-primary"
          />
        </label>
      </div>

      <div className="md:hidden">
        <div className="flex items-center gap-2">
          <Link href={`/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`} className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">
              <span className={`mr-1.5 inline-block size-1.5 rounded-full align-middle ${isPlaying ? "bg-primary animate-pulse" : "bg-muted-foreground/50"}`} />
              {current.title}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{current.seriesTitle}</p>
          </Link>
          <span className="text-[11px] tabular-nums text-muted-foreground">{mobileTimeDisplay}</span>
        </div>

        <div className="mt-2 grid grid-cols-[auto_auto_auto_1fr] items-center gap-1.5">
          <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => playPrevInQueue()} disabled={!prevEpisode} aria-label="Tập trước">
            <SkipBack aria-hidden="true" className="size-3.5" />
          </Button>
          <Button type="button" size="icon" className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:brightness-95" onClick={togglePlay} aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
            {isPlaying ? <Pause aria-hidden="true" className="size-5" /> : <Play aria-hidden="true" className="size-5 translate-x-[1px]" />}
          </Button>
          <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => playNextInQueue()} disabled={!nextEpisode} aria-label="Tập tiếp theo">
            <SkipForward aria-hidden="true" className="size-3.5" />
          </Button>
          <button
            type="button"
            className="justify-self-end rounded-full bg-secondary/20 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
            onClick={() => requestSeek(progress.currentSeconds + 10)}
            disabled={!hasDuration}
          >
            +10s
          </button>
        </div>
      </div>
    </aside>
  );
}
