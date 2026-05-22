"use client";

import { useEffect, useState } from "react";
import {
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  Clock3,
  ListMusic,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  SkipBack,
  SkipForward,
  Volume2
} from "lucide-react";
import { BookmarkList } from "@/components/player/bookmark-list";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildPlayerEventPayload, emitAnalyticsPayload } from "@/lib/analytics/events";
import type { BookmarkTimelineItem } from "@/lib/bookmarks/validators";
import { featureFlags } from "@/lib/features";
import { formatTimeSmart } from "@/lib/format";
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
  const setQueue = usePlayerStore((state) => state.setQueue);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const requestSeek = usePlayerStore((state) => state.requestSeek);
  const setRate = usePlayerStore((state) => state.setRate);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setAutoPlayNext = usePlayerStore((state) => state.setAutoPlayNext);
  const playNextInQueue = usePlayerStore((state) => state.playNextInQueue);
  const playPrevInQueue = usePlayerStore((state) => state.playPrevInQueue);
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
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    const nextQueue = queue?.length ? queue : [episode];
    const queueIndex = Math.max(0, nextQueue.findIndex((item) => item.episodeId === episode.episodeId));

    if (current?.episodeId === episode.episodeId) {
      setQueue(nextQueue, episode.episodeId);
      return;
    }

    loadEpisode(episode, { queue: nextQueue, queueIndex });
  }, [episode, queue, loadEpisode, setQueue, current?.episodeId]);

  const activeEpisode = current ?? episode;
  const resolvedQueue = queueState.length ? queueState : queue?.length ? queue : [episode];
  const resolvedQueueIndex =
    currentQueueIndex >= 0
      ? currentQueueIndex
      : resolvedQueue.findIndex((item) => item.episodeId === activeEpisode.episodeId);
  const prevEpisode = resolvedQueueIndex > 0 ? resolvedQueue[resolvedQueueIndex - 1] ?? null : null;
  const nextEpisode = resolvedQueueIndex >= 0 ? resolvedQueue[resolvedQueueIndex + 1] ?? null : null;
  const progressPercent =
    progress.durationSeconds > 0 ? Math.max(0, Math.min(100, (progress.currentSeconds / progress.durationSeconds) * 100)) : 0;

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
  const remainingLabel = formatTimeSmart(Math.max(0, progress.durationSeconds - progress.currentSeconds), progress.durationSeconds);
  const hasDuration = progress.durationSeconds > 0;
  const currentTimeDisplay = hasDuration ? currentTimeLabel : "Đang tải...";
  const durationDisplay = hasDuration ? durationLabel : "Đang tải...";
  const remainingDisplay = hasDuration ? remainingLabel : "Đang tải...";

  return (
    <section className="relative overflow-hidden rounded-[1.6rem] border border-[var(--player-border)] bg-[radial-gradient(circle_at_0%_0%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_34%),radial-gradient(circle_at_100%_100%,color-mix(in_srgb,var(--primary)_16%,transparent),transparent_40%),var(--player-shell)] p-4 shadow-[0_26px_55px_rgba(120,53,15,0.11)] md:p-6">
      <div className="relative grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--player-border)] bg-[var(--player-panel)] p-3">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary/20">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          </div>
          <div className="mt-3 grid gap-2 text-xs">
            <div className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 font-semibold text-primary">
              Đang phát
            </div>
            <p className="text-muted-foreground">Còn lại: {remainingDisplay}</p>
            <p className="text-muted-foreground">Thời lượng: {durationDisplay}</p>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{activeEpisode.seriesTitle}</p>
          <h2 className="mt-1 text-2xl font-black leading-tight md:text-3xl">{activeEpisode.title}</h2>

          <div className="mt-5 rounded-2xl border border-[var(--player-border)] bg-[var(--player-panel)] px-3 py-3 md:px-4">
            <input
              aria-label="Tiến trình nghe"
              type="range"
              min={0}
              max={hasDuration ? progress.durationSeconds : 1}
              value={progress.currentSeconds}
              onChange={(event) => requestSeek(Number(event.target.value))}
              disabled={!hasDuration}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-muted-foreground">
              <span>{currentTimeDisplay}</span>
              <span>{hasDuration ? `${Math.round(progressPercent)}%` : "..."}</span>
              <span>{durationDisplay}</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--player-border)] bg-[var(--player-panel)] p-3 md:p-4">
            <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3.5">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => playPrevInQueue()}
                disabled={!prevEpisode}
                aria-label="Tập trước"
              >
                <SkipBack aria-hidden="true" className="size-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => seek(-10)}
                aria-label="Lùi 10 giây"
                disabled={!hasDuration}
              >
                <RotateCcw aria-hidden="true" className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(120,53,15,0.28)] transition hover:scale-105 hover:brightness-95 focus-visible:ring-2 focus-visible:ring-primary/50 motion-reduce:hover:scale-100"
                onClick={togglePlay}
                aria-label={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? <Pause className="size-6" /> : <Play className="size-6 translate-x-[1px]" />}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => seek(10)}
                aria-label="Tiến 10 giây"
                disabled={!hasDuration}
              >
                <RotateCw aria-hidden="true" className="size-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => playNextInQueue()}
                disabled={!nextEpisode}
                aria-label="Tập tiếp theo"
              >
                <SkipForward aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5 text-xs text-muted-foreground">
              <Button type="button" variant="ghost" size="sm" className="h-8 rounded-full px-3" onClick={() => seek(-30)} disabled={!hasDuration}>
                <RotateCcw aria-hidden="true" className="size-3.5" /> 30s
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-8 rounded-full px-3" onClick={() => seek(30)} disabled={!hasDuration}>
                <RotateCw aria-hidden="true" className="size-3.5" /> 30s
              </Button>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">{rate}x</span>
              <span className="rounded-full bg-secondary/20 px-2.5 py-1">Âm lượng {Math.round(volume * 100)}%</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--player-border)] bg-[var(--player-panel-soft)]">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]"
              onClick={() => setAdvancedOpen((value) => !value)}
              aria-expanded={advancedOpen}
            >
              <div className="flex items-start gap-2.5">
                <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                  <SlidersHorizontal className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Tùy chỉnh nâng cao</p>
                  <p className="text-xs text-muted-foreground">Tốc độ, âm lượng, auto-play, hẹn giờ, bookmark</p>
                </div>
              </div>
              {advancedOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
            </button>

            <div
              className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                advancedOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="grid gap-3 border-t border-[var(--player-border)] px-4 py-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1 text-sm">
                    <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <ListMusic className="size-3.5" />
                      Tốc độ
                    </span>
                    <select
                      aria-label="Tốc độ phát"
                      value={rate}
                      onChange={(event) => setRate(Number(event.target.value))}
                      className="h-11 rounded-xl border border-[var(--player-border)] bg-[var(--player-panel)] px-3"
                    >
                      {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                        <option key={speed} value={speed}>{speed}x</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1 text-sm">
                    <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Volume2 className="size-3.5" />
                      Âm lượng
                    </span>
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--player-border)] bg-[var(--player-panel)] px-3 py-2">
                      <Volume2 aria-hidden="true" className="size-4 text-muted-foreground" />
                      <input
                        aria-label="Âm lượng"
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(event) => setVolume(Number(event.target.value))}
                        className="h-2 w-full cursor-pointer accent-primary"
                      />
                    </div>
                  </label>
                </div>

                {featureFlags.continuousPlay ? (
                  <div className="rounded-xl border border-[var(--player-border)] bg-[var(--player-panel)] p-3">
                    <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        aria-label="Auto-play"
                        type="checkbox"
                        checked={autoPlayNext}
                        onChange={(event) => setAutoPlayNext(event.target.checked)}
                      />
                      Auto-play tập tiếp theo
                    </label>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Button type="button" variant="outline" size="sm" className="text-foreground" onClick={() => playNextInQueue()} disabled={!nextEpisode}>
                        Play next
                      </Button>
                      {nextEpisode ? <p className="text-xs text-muted-foreground">Tiếp theo: {nextEpisode.title}</p> : null}
                    </div>
                  </div>
                ) : null}

                {featureFlags.sleepTimer ? (
                  <div className="rounded-xl border border-[var(--player-border)] bg-[var(--player-panel)] p-3">
                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      {sleepTimerSummary()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[10, 20, 30, 45].map((minutes) => (
                        <Button key={minutes} type="button" variant="outline" size="sm" className="text-foreground" onClick={() => startSleepTimerMinutes(minutes)}>
                          {minutes} phút
                        </Button>
                      ))}
                      <Button type="button" variant="outline" size="sm" className="text-foreground" onClick={startSleepTimerEndOfEpisode}>
                        Đến hết tập
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:bg-secondary/20" onClick={cancelSleepTimer}>
                        Hủy hẹn giờ
                      </Button>
                    </div>
                  </div>
                ) : null}

                {featureFlags.bookmarks ? (
                  <div className="rounded-xl border border-[var(--player-border)] bg-[var(--player-panel)] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Mốc nghe và ghi chú</p>
                        <p className="text-xs text-muted-foreground">Lưu lại đoạn đang nghe để quay lại nhanh hơn.</p>
                      </div>
                      <Button type="button" size="sm" onClick={createBookmark} disabled={!canManageBookmarks || isSavingBookmark}>
                        <BookmarkPlus aria-hidden="true" className="size-4" />
                        Lưu tại {currentTimeDisplay}
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
                          placeholder="Ví dụ: đoạn quan trọng cần nghe lại"
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
                      <p className="mt-3 text-sm text-muted-foreground">Đăng nhập để lưu mốc nghe và đồng bộ giữa các thiết bị.</p>
                    )}

                    <p aria-live="polite" className="mt-3 min-h-5 text-xs text-muted-foreground">
                      {bookmarkStatus}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
