"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { featureFlags } from "@/lib/features";
import { formatSeconds } from "@/lib/format";
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
  const waveformPercent = `${Math.max(0, Math.min(100, percent))}%`;
  const progressText = `${Math.round(percent)}% đã nghe`;

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
      <aside className="fixed inset-x-3 bottom-[4.7rem] z-40 overflow-hidden rounded-2xl border border-white/10 bg-[#121212]/95 p-3 text-white shadow-[0_20px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 md:inset-x-0 md:bottom-0 md:rounded-none md:border-x-0 md:border-b-0 md:px-6 md:py-3">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-fuchsia-500/10" />

        <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
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
              <p className="truncate text-sm font-semibold text-white">{current.title}</p>
              <p className="truncate text-xs text-zinc-300">{current.seriesTitle}</p>
              {showNextUp && nextEpisode ? <p className="mt-1 truncate text-[11px] text-emerald-400">Sắp phát tiếp: {nextEpisode.title}</p> : null}
            </Link>
          </div>

          <div className="flex min-w-[380px] flex-col items-center">
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="icon" className="h-9 w-9 rounded-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700" onClick={() => playPrevInQueue()} disabled={!prevEpisode} aria-label="Tập trước">
                <SkipBack aria-hidden="true" />
              </Button>
              <Button type="button" variant="secondary" size="icon" className="h-9 w-9 rounded-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700" onClick={togglePlay} aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
                {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" className="translate-x-[1px]" />}
              </Button>
              <Button type="button" variant="secondary" size="icon" className="h-9 w-9 rounded-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700" onClick={() => playNextInQueue()} disabled={!nextEpisode} aria-label="Tập tiếp theo">
                <SkipForward aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-2 w-full">
              <div
                className="relative h-7 cursor-pointer overflow-hidden rounded-md bg-zinc-900/80 px-1 transition-all duration-200 hover:bg-zinc-800/80"
                onMouseMove={(event) => setHoverSeconds(getSeekFromPointer(event))}
                onMouseLeave={() => setHoverSeconds(null)}
                onClick={(event) => requestSeek(getSeekFromPointer(event))}
              >
                <div className="absolute inset-y-1 left-1 right-1 rounded opacity-30 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_2px,transparent_2px,transparent_6px)]" />
                <div className="absolute inset-y-1 left-1 rounded bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] transition-all duration-100" style={{ width: `calc(${waveformPercent} - 2px)` }} />
                {hoverPercent !== null ? (
                  <>
                    <div className="absolute inset-y-0 w-px bg-emerald-300/90 shadow-[0_0_4px_rgba(52,211,153,0.5)]" style={{ left: `calc(${hoverPercent}% - 1px)` }} />
                    <div className="absolute -top-7 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-100 shadow-md" style={{ left: `calc(${hoverPercent}% - 22px)` }}>
                      {formatSeconds(hoverSeconds ?? 0)}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center justify-end gap-3">
            <span className="text-[11px] text-zinc-300">{progressText}</span>
            <label className="flex items-center gap-2 text-zinc-300">
              <Volume2 className="size-4" aria-hidden="true" />
              <input
                aria-label="Âm lượng mini player"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="h-1.5 w-24 cursor-pointer accent-emerald-400"
              />
            </label>
            <Button type="button" variant="ghost" size="sm" className="text-zinc-300 hover:bg-zinc-800" onClick={() => setNotesOpen((v) => !v)}>
              Notes {notesOpen ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            </Button>
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
              {current.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.coverUrl} alt="" loading="lazy" decoding="async" className={`absolute inset-0 size-full object-cover ${isPlaying ? "animate-[spin_12s_linear_infinite]" : ""}`} />
              ) : null}
            </div>
            <Link href={`/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`} className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{current.title}</p>
              <p className="truncate text-xs text-zinc-300">{current.seriesTitle}</p>
            </Link>
            <Button type="button" size="icon" className="h-10 w-10 rounded-full bg-white text-black hover:bg-zinc-200" onClick={togglePlay} aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
              {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </aside>

      <section className={`fixed inset-x-0 bottom-[72px] z-30 hidden border-t border-white/10 bg-[#0f0f0f]/98 px-6 pb-5 pt-4 text-white backdrop-blur-xl transition-all duration-300 md:block ${notesOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"}`}>
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-semibold">Lyrics preview</p>
            <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-300">
              <p>{formatSeconds(progress.currentSeconds)} — [Chưa có lyrics đồng bộ cho tập này]</p>
              <p className="mt-1 text-zinc-500">Bạn có thể thay bằng lyric thật từ backend sau.</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Quick notes</p>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú nhanh khi đang nghe..." className="mt-2 min-h-24 border-zinc-800 bg-zinc-900 text-zinc-100" />
          </div>
        </div>
      </section>
    </>
  );
}
