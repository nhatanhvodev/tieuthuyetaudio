"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { BookmarkPlus, Pause, Play, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { BookmarkList } from "@/components/player/bookmark-list";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildPlayerEventPayload, emitAnalyticsPayload } from "@/lib/analytics/events";
import type { BookmarkTimelineItem } from "@/lib/bookmarks/validators";
import { featureFlags } from "@/lib/features";
import { formatTimeCompact, formatTimeSmart } from "@/lib/format";
import { usePlayerStore, type PlayerEpisode } from "@/stores/player-store";

function sortBookmarks(bookmarks: BookmarkTimelineItem[]) {
  return [...bookmarks].sort((left, right) => {
    if (left.second !== right.second) return left.second - right.second;
    return left.createdAt.localeCompare(right.createdAt);
  });
}

export function AudioPlayer({
  episode,
  queue,
  canManageBookmarks = false,
  initialBookmarks = []
}: {
  episode: PlayerEpisode;
  queue?: PlayerEpisode[];
  canManageBookmarks?: boolean;
  initialBookmarks?: BookmarkTimelineItem[];
}) {
  const current = usePlayerStore((state) => state.current);
  const queueState = usePlayerStore((state) => state.queue);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const rate = usePlayerStore((state) => state.rate);
  const volume = usePlayerStore((state) => state.volume);
  const progress = usePlayerStore((state) => state.progress);
  const autoPlayNext = usePlayerStore((state) => state.autoPlayNext);
  const currentQueueIndex = usePlayerStore((state) => state.currentQueueIndex);
  const sleepTimer = usePlayerStore((state) => state.sleepTimer);
  const loadEpisode = usePlayerStore((state) => state.loadEpisode);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const requestSeek = usePlayerStore((state) => state.requestSeek);
  const setRate = usePlayerStore((state) => state.setRate);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setAutoPlayNext = usePlayerStore((state) => state.setAutoPlayNext);
  const playNextInQueue = usePlayerStore((state) => state.playNextInQueue);
  const startSleepTimerMinutes = usePlayerStore((state) => state.startSleepTimerMinutes);
  const startSleepTimerEndOfEpisode = usePlayerStore((state) => state.startSleepTimerEndOfEpisode);
  const cancelSleepTimer = usePlayerStore((state) => state.cancelSleepTimer);
  const [bookmarks, setBookmarks] = useState(() => sortBookmarks(initialBookmarks));
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [bookmarkStatus, setBookmarkStatus] = useState("");
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [isSavingBookmark, setIsSavingBookmark] = useState(false);
  const [savingBookmarkId, setSavingBookmarkId] = useState<string | null>(null);
  const [deletingBookmarkId, setDeletingBookmarkId] = useState<string | null>(null);

  useEffect(() => {
    const nextQueue = queue?.length ? queue : [episode];
    const queueIndex = Math.max(0, nextQueue.findIndex((item) => item.episodeId === episode.episodeId));
    loadEpisode(episode, { queue: nextQueue, queueIndex });
  }, [episode, queue, loadEpisode]);

  const activeEpisode = current ?? episode;
  const resolvedQueue = queueState.length ? queueState : queue?.length ? queue : [episode];
  const resolvedQueueIndex =
    currentQueueIndex >= 0
      ? currentQueueIndex
      : resolvedQueue.findIndex((item) => item.episodeId === activeEpisode.episodeId);
  const nextEpisode = resolvedQueueIndex >= 0 ? resolvedQueue[resolvedQueueIndex + 1] ?? null : null;
  const progressPercent = progress.durationSeconds > 0 ? Math.max(0, Math.min(100, (progress.currentSeconds / progress.durationSeconds) * 100)) : 0;

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
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
  }, [requestSeek, togglePlay]);

  useEffect(() => {
    setBookmarks(sortBookmarks(initialBookmarks));
  }, [initialBookmarks]);

  useEffect(() => {
    if (!featureFlags.bookmarks || !canManageBookmarks) {
      setBookmarks([]);
      return;
    }

    let cancelled = false;

    async function loadBookmarksForEpisode() {
      setIsLoadingBookmarks(true);
      setBookmarkStatus("");

      try {
        const response = await fetch(`/api/bookmarks?episodeId=${encodeURIComponent(activeEpisode.episodeId)}`, {
          cache: "no-store"
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          if (!cancelled) {
            setBookmarkStatus(payload?.error ?? "Không tải được mốc nghe.");
          }
          return;
        }

        if (!cancelled) {
          setBookmarks(sortBookmarks((payload?.bookmarks ?? []) as BookmarkTimelineItem[]));
        }
      } catch {
        if (!cancelled) setBookmarkStatus("Không tải được mốc nghe.");
      } finally {
        if (!cancelled) setIsLoadingBookmarks(false);
      }
    }

    void loadBookmarksForEpisode();

    return () => {
      cancelled = true;
    };
  }, [activeEpisode.episodeId, canManageBookmarks]);

  function seek(delta: number) {
    requestSeek(progress.currentSeconds + delta);
  }

  function sleepTimerSummary() {
    if (sleepTimer.mode === "end_of_episode") return "Hẹn giờ: đến hết tập";
    if (sleepTimer.mode === "minutes" && sleepTimer.expiresAt) {
      const remaining = Math.max(0, Math.ceil((sleepTimer.expiresAt - Date.now()) / 60000));
      return `Hẹn giờ: ${remaining} phút`;
    }
    return "Hẹn giờ: tắt";
  }

  async function createBookmark() {
    if (!featureFlags.bookmarks || !canManageBookmarks) return;

    setIsSavingBookmark(true);
    setBookmarkStatus("");

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          episodeId: activeEpisode.episodeId,
          second: progress.currentSeconds,
          note: bookmarkNote
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setBookmarkStatus(payload?.error ?? "Không lưu được mốc nghe.");
        return;
      }

      const nextBookmark = payload?.bookmark as BookmarkTimelineItem;
      setBookmarks((currentItems) => sortBookmarks([...currentItems, nextBookmark]));
      setBookmarkNote("");
      setBookmarkStatus(`Đã lưu mốc tại ${formatTimeSmart(nextBookmark.second)}.`);
      emitAnalyticsPayload(
        buildPlayerEventPayload({
          eventName: "bookmark_create",
          episodeId: activeEpisode.episodeId,
          seriesSlug: activeEpisode.seriesSlug,
          episodeNumber: activeEpisode.episodeNumber,
          currentSeconds: nextBookmark.second,
          durationSeconds: progress.durationSeconds,
          completed: false
        })
      );
    } catch {
      setBookmarkStatus("Không lưu được mốc nghe.");
    } finally {
      setIsSavingBookmark(false);
    }
  }

  async function updateBookmark(bookmarkId: string, note: string) {
    const previousBookmarks = bookmarks;
    const normalizedNote = note.trim();
    setSavingBookmarkId(bookmarkId);
    setBookmarkStatus("");
    setBookmarks((currentItems) =>
      currentItems.map((item) =>
        item.id === bookmarkId
          ? {
              ...item,
              note: normalizedNote.length ? normalizedNote : null
            }
          : item
      )
    );

    try {
      const response = await fetch("/api/bookmarks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bookmarkId, note })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setBookmarks(previousBookmarks);
        setBookmarkStatus(payload?.error ?? "Không cập nhật được ghi chú.");
        return;
      }

      const updatedBookmark = payload?.bookmark as BookmarkTimelineItem;
      setBookmarks((currentItems) => sortBookmarks(currentItems.map((item) => (item.id === bookmarkId ? updatedBookmark : item))));
      setBookmarkStatus("Đã cập nhật ghi chú.");
    } catch {
      setBookmarks(previousBookmarks);
      setBookmarkStatus("Không cập nhật được ghi chú.");
    } finally {
      setSavingBookmarkId(null);
    }
  }

  async function deleteBookmark(bookmarkId: string) {
    const previousBookmarks = bookmarks;
    setDeletingBookmarkId(bookmarkId);
    setBookmarkStatus("");
    setBookmarks((currentItems) => currentItems.filter((item) => item.id !== bookmarkId));

    try {
      const response = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bookmarkId })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setBookmarks(previousBookmarks);
        setBookmarkStatus(payload?.error ?? "Không xóa được mốc nghe.");
        return;
      }

      setBookmarkStatus("Đã xóa mốc nghe.");
    } catch {
      setBookmarks(previousBookmarks);
      setBookmarkStatus("Không xóa được mốc nghe.");
    } finally {
      setDeletingBookmarkId(null);
    }
  }

  const currentTimeLabel = formatTimeSmart(progress.currentSeconds, progress.durationSeconds);
  const durationLabel = formatTimeSmart(progress.durationSeconds, progress.durationSeconds);
  const shouldShowHours = progress.durationSeconds >= 3600;

  return (
    <section className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)] p-4 shadow-[0_24px_60px_rgba(120,53,15,0.08)] md:p-6">
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
          {activeEpisode.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeEpisode.coverUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 size-full object-cover transition-transform duration-500 ${isPlaying ? "animate-[spin_16s_linear_infinite]" : ""}`}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="text-sm text-muted-foreground">{activeEpisode.seriesTitle}</p>
          <p className="mt-1 text-2xl font-black md:text-3xl">{activeEpisode.title}</p>

          {/* Progress bar area */}
          <div className="mt-6 space-y-1.5">
            <input
              aria-label="Tiến trình nghe"
              type="range"
              min={0}
              max={progress.durationSeconds || 0}
              value={progress.currentSeconds}
              onChange={(event) => requestSeek(Number(event.target.value))}
              className="h-1.5 w-full cursor-pointer accent-primary rounded-full"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs tabular-nums text-muted-foreground">{currentTimeLabel}</span>
              <span className="text-xs tabular-nums text-muted-foreground">-{formatTimeSmart(Math.max(0, progress.durationSeconds - progress.currentSeconds), progress.durationSeconds)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full transition-all duration-200"
              onClick={() => seek(-10)}
              aria-label="Lùi 10 giây"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              <span className="sr-only">-10s</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full transition-all duration-200"
              onClick={() => seek(-30)}
              aria-label="Lùi 30 giây"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              <span className="text-[9px] font-bold">30</span>
            </Button>
            <Button
              type="button"
              size="icon"
              className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:brightness-90 hover:shadow-xl motion-reduce:hover:scale-100"
              onClick={togglePlay}
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? <Pause className="size-6" /> : <Play className="size-6 translate-x-[1px]" />}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full transition-all duration-200"
              onClick={() => seek(30)}
              aria-label="Tiến 30 giây"
            >
              <RotateCw aria-hidden="true" className="size-4" />
              <span className="text-[9px] font-bold">30</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full transition-all duration-200"
              onClick={() => seek(10)}
              aria-label="Tiến 10 giây"
            >
              <RotateCw aria-hidden="true" className="size-4" />
              <span className="sr-only">+10s</span>
            </Button>
            <select
              aria-label="Tốc độ phát"
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="select select-bordered h-10 rounded-full border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] bg-secondary px-3 text-sm text-foreground"
            >
              {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <option key={speed} value={speed}>{speed}x</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 aria-hidden="true" className="size-4" />
              <select
                aria-label="Âm lượng"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="select select-bordered h-10 rounded-full border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] bg-secondary px-3 text-sm text-foreground"
              >
                <option value={0.25}>25%</option>
                <option value={0.5}>50%</option>
                <option value={0.75}>75%</option>
                <option value={1}>100%</option>
              </select>
            </label>
          </div>

          {featureFlags.continuousPlay ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[color-mix(in_oklch,var(--foreground)_6%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_20%,var(--background))] p-3">
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  aria-label="Auto-play"
                  type="checkbox"
                  checked={autoPlayNext}
                  onChange={(event) => setAutoPlayNext(event.target.checked)}
                />
                Auto-play tập tiếp theo
              </label>
              <Button type="button" variant="outline" size="sm" className="text-foreground" onClick={() => playNextInQueue()} disabled={!nextEpisode}>
                Play next
              </Button>
              {nextEpisode ? <p className="text-xs text-muted-foreground">Tiếp theo: {nextEpisode.title}</p> : null}
            </div>
          ) : null}

          {featureFlags.sleepTimer ? (
            <div className="mt-4 rounded-xl border border-[color-mix(in_oklch,var(--foreground)_6%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_20%,var(--background))] p-3">
              <p className="text-xs text-muted-foreground">{sleepTimerSummary()}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[10, 20, 30, 45].map((minutes) => (
                  <Button key={minutes} type="button" variant="outline" size="sm" className="text-foreground" onClick={() => startSleepTimerMinutes(minutes)}>
                    {minutes} phút
                  </Button>
                ))}
                <Button type="button" variant="outline" size="sm" className="text-foreground" onClick={startSleepTimerEndOfEpisode}>
                  Đến hết tập
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:bg-secondary" onClick={cancelSleepTimer}>
                  Hủy hẹn giờ
                </Button>
              </div>
            </div>
          ) : null}

          {featureFlags.bookmarks ? (
            <div className="mt-4 rounded-xl border border-[color-mix(in_oklch,var(--foreground)_6%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_20%,var(--background))] p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Mốc nghe và ghi chú</p>
                  <p className="text-xs text-muted-foreground">Lưu lại đoạn đang nghe để quay lại nhanh hơn.</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={createBookmark}
                  disabled={!canManageBookmarks || isSavingBookmark}
                >
                  <BookmarkPlus aria-hidden="true" />
                  Lưu tại {currentTimeLabel}
                </Button>
              </div>

              {canManageBookmarks ? (
                <>
                  <label className="mt-3 block text-sm font-medium" htmlFor="bookmark-note">
                    Ghi chú tùy chọn
                  </label>
                  <Textarea
                    id="bookmark-note"
                    value={bookmarkNote}
                    onChange={(event) => setBookmarkNote(event.target.value)}
                    placeholder="Ví dụ: bắt đầu twist, giới thiệu nhân vật, cần nghe lại"
                    maxLength={500}
                    className="mt-2 min-h-20"
                  />

                  {isLoadingBookmarks ? <p className="mt-3 text-sm text-muted-foreground">Đang tải mốc nghe...</p> : null}
                  <BookmarkList
                    bookmarks={bookmarks}
                    currentSeconds={progress.currentSeconds}
                    deletingBookmarkId={deletingBookmarkId}
                    savingBookmarkId={savingBookmarkId}
                    onDelete={deleteBookmark}
                    onJump={(second) => requestSeek(second)}
                    onUpdate={updateBookmark}
                  />
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Đăng nhập để lưu mốc nghe và đồng bộ ghi chú giữa các lần nghe.</p>
              )}

              <p aria-live="polite" className="mt-3 min-h-5 text-xs text-muted-foreground">
                {bookmarkStatus}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
