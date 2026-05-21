"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { featureFlags } from "@/lib/features";
import { formatSeconds, formatTimeSmart } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";

export function MiniPlayer() {
  const pathname = usePathname();
  const current = usePlayerStore((state) => state.current);
  const queue = usePlayerStore((state) => state.queue);
  const currentQueueIndex = usePlayerStore((state) => state.currentQueueIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const volume = usePlayerStore((state) => state.volume);
  const autoPlayNext = usePlayerStore((state) => state.autoPlayNext);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const requestSeek = usePlayerStore((state) => state.requestSeek);
  const playNextInQueue = usePlayerStore((state) => state.playNextInQueue);
  const playPrevInQueue = usePlayerStore((state) => state.playPrevInQueue);

  const [hoverSeconds, setHoverSeconds] = useState<number | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");

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

  const percent = progress.durationSeconds > 0 ? (progress.currentSeconds / progress.durationSeconds) * 100 : 0;
  const nextEpisode = currentQueueIndex >= 0 ? queue[currentQueueIndex + 1] ?? null : null;
  const prevEpisode = currentQueueIndex > 0 ? queue[currentQueueIndex - 1] ?? null : null;
  const showNextUp = featureFlags.continuousPlay && autoPlayNext && Boolean(nextEpisode) && percent >= 85;
  const currentTimeLabel = formatTimeSmart(progress.currentSeconds, progress.durationSeconds);
  const durationLabel = formatTimeSmart(progress.durationSeconds, progress.durationSeconds);

  function seek(delta: number) {
    requestSeek(progress.currentSeconds + delta);
  }

  const hoverPercent =
    hoverSeconds === null || !progress.durationSeconds ? null : Math.max(0, Math.min(100, (hoverSeconds / progress.durationSeconds) * 100));

  function getSeekFromPointer(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!progress.durationSeconds || rect.width <= 0) return 0;
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    return Math.floor(ratio * progress.durationSeconds);
  }

  return (
    <>
      {/* Mini player — Stitch floating pill */}
      <aside className="fixed inset-x-3 bottom-[4.7rem] z-40 overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)] p-3 shadow-[0_20px_45px_rgba(120,53,15,0.1)] backdrop-blur-[12px] transition-all duration-300 md:inset-x-0 md:bottom-6 md:left-1/2 md:max-w-md md:-translate-x-1/2 md:overflow-visible md:rounded-xl md:border md:px-4 md:py-3 soft-shadow">
        {/* Desktop controls */}
        <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {current.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.coverUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 size-full object-cover ${isPlaying ? "animate-[spin_12s_linear_infinite]" : ""}`}
                />
              ) : null}
            </div>
            <Link href={`/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`} className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{current.title}</p>
              <p className="truncate text-xs text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>{current.seriesTitle}</p>
              {showNextUp && nextEpisode ? <p className="mt-1 truncate text-[11px] text-accent" style={{ fontFamily: "var(--font-label)" }}>Sắp phát tiếp: {nextEpisode.title}</p> : null}
            </Link>
          </div>

          <div className="flex min-w-[340px] flex-col items-center">
            <div className="flex items-center gap-1">
              <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => seek(-30)} aria-label="Lùi 30 giây">
                <span className="text-[10px] font-semibold tabular-nums">-30</span>
              </Button>
              <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => seek(-10)} aria-label="Lùi 10 giây">
                <span className="text-[10px] font-semibold tabular-nums">-10</span>
              </Button>
              <Button type="button" variant="secondary" size="icon" className="h-9 w-9 rounded-full" onClick={() => playPrevInQueue()} disabled={!prevEpisode} aria-label="Tập trước">
                <SkipBack aria-hidden="true" />
              </Button>
              <Button type="button" variant="secondary" size="icon" className="h-9 w-9 rounded-full" onClick={togglePlay} aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
                {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" className="translate-x-[1px]" />}
              </Button>
              <Button type="button" variant="secondary" size="icon" className="h-9 w-9 rounded-full" onClick={() => playNextInQueue()} disabled={!nextEpisode} aria-label="Tập tiếp theo">
                <SkipForward aria-hidden="true" />
              </Button>
              <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => seek(10)} aria-label="Tua 10 giây">
                <span className="text-[10px] font-semibold tabular-nums">+10</span>
              </Button>
              <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => seek(30)} aria-label="Tua 30 giây">
                <span className="text-[10px] font-semibold tabular-nums">+30</span>
              </Button>
            </div>
            <div className="mt-2 w-full">
              <div
                className="relative h-7 cursor-pointer overflow-hidden rounded-md bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] px-1 transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)]"
                onMouseMove={(event) => setHoverSeconds(getSeekFromPointer(event))}
                onMouseLeave={() => setHoverSeconds(null)}
                onClick={(event) => requestSeek(getSeekFromPointer(event))}
              >
                <div className="absolute inset-y-1 left-1 rounded bg-primary transition-all duration-100" style={{ width: `calc(${Math.max(0, Math.min(100, percent))}% - 2px)` }} />
                {hoverPercent !== null ? (
                  <>
                    <div className="absolute inset-y-0 w-px bg-primary/90" style={{ left: `calc(${hoverPercent}% - 1px)` }} />
                    <div className="absolute -top-7 rounded bg-[color-mix(in_srgb,var(--secondary)_90%,var(--background))] px-1.5 py-0.5 text-[10px] text-secondary-foreground shadow-md" style={{ left: `calc(${hoverPercent}% - 22px)` }}>
                      {formatSeconds(hoverSeconds ?? 0)}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center justify-end gap-3">
            <span className="text-xs tabular-nums text-muted-foreground">{currentTimeLabel} / {durationLabel}</span>
            <label className="flex items-center gap-2 text-muted-foreground">
              <Volume2 className="size-4" aria-hidden="true" />
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
            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]" onClick={() => setNotesOpen((v) => !v)}>
              Notes {notesOpen ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden">
          <div className="mb-2">
            <div
              className="relative h-10 cursor-pointer overflow-hidden rounded-md bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] px-1 transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)]"
              onTouchMove={(event) => {
                const touch = event.touches[0];
                const rect = (event.target as HTMLElement).closest("[data-seek-bar]")?.getBoundingClientRect();
                if (!rect || !progress.durationSeconds) return;
                const ratio = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
                setHoverSeconds(Math.floor(ratio * progress.durationSeconds));
              }}
              onTouchEnd={() => {
                if (hoverSeconds !== null) requestSeek(hoverSeconds);
                setHoverSeconds(null);
              }}
              onMouseMove={(event) => setHoverSeconds(getSeekFromPointer(event))}
              onMouseLeave={() => setHoverSeconds(null)}
              onClick={(event) => requestSeek(getSeekFromPointer(event))}
              data-seek-bar
            >
              <div
                className="absolute inset-y-1 left-1 rounded bg-primary transition-all duration-100"
                style={{ width: `calc(${Math.max(0, Math.min(100, percent))}% - 2px)` }}
              />
              {hoverPercent !== null ? (
                <div
                  className="absolute inset-y-0 w-px bg-primary/90"
                  style={{ left: `calc(${hoverPercent}% - 1px)` }}
                />
              ) : null}
            </div>
          </div>
          <div className="mb-2 text-center">
            <span className="text-xs tabular-nums text-muted-foreground">{currentTimeLabel} / {durationLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {current.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.coverUrl} alt="" loading="lazy" decoding="async" className={`absolute inset-0 size-full object-cover ${isPlaying ? "animate-[spin_12s_linear_infinite]" : ""}`} />
              ) : null}
            </div>
            <Link href={`/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`} className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{current.title}</p>
              <p className="truncate text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>{current.seriesTitle}</p>
            </Link>
            <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => playPrevInQueue()} disabled={!prevEpisode} aria-label="Tập trước">
              <SkipBack aria-hidden="true" className="size-3.5" />
            </Button>
            <Button type="button" variant="secondary" size="icon" className="h-7 w-7 rounded-full" onClick={() => seek(-10)} aria-label="Lùi 10 giây">
              <span className="text-[10px] font-semibold">-10</span>
            </Button>
            <Button type="button" size="icon" className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:brightness-90" onClick={togglePlay} aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
              {isPlaying ? <Pause aria-hidden="true" className="size-5" /> : <Play aria-hidden="true" className="size-5" />}
            </Button>
            <Button type="button" variant="secondary" size="icon" className="h-7 w-7 rounded-full" onClick={() => seek(10)} aria-label="Tua 10 giây">
              <span className="text-[10px] font-semibold">+10</span>
            </Button>
            <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => playNextInQueue()} disabled={!nextEpisode} aria-label="Tập tiếp theo">
              <SkipForward aria-hidden="true" className="size-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Notes panel */}
      <section className={`fixed inset-x-0 bottom-[72px] z-30 hidden border-t border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_98%,transparent)] backdrop-blur-xl px-6 pb-5 pt-4 transition-all duration-300 md:block ${notesOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"}`}>
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-semibold">Lyrics preview</p>
            <div className="mt-2 rounded-lg border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-muted/70 p-3 text-sm text-muted-foreground">
              <p>{formatSeconds(progress.currentSeconds)} — [Chưa có lyrics đồng bộ cho tập này]</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Quick notes</p>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú nhanh khi đang nghe..." className="mt-2 min-h-24" />
          </div>
        </div>
      </section>
    </>
  );
}
