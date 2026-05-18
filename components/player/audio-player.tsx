"use client";

import { useEffect, useState } from "react";
import { BookmarkPlus, Pause, Play, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { BookmarkList } from "@/components/player/bookmark-list";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildPlayerEventPayload, emitAnalyticsPayload } from "@/lib/analytics/events";
import type { BookmarkTimelineItem } from "@/lib/bookmarks/validators";
import { featureFlags } from "@/lib/features";
import { formatSeconds } from "@/lib/format";
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
  const nextEpisode = currentQueueIndex >= 0 ? queueState[currentQueueIndex + 1] ?? null : null;

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
            setBookmarkStatus(payload?.error ?? "Khong tai duoc moc nghe.");
          }
          return;
        }

        if (!cancelled) {
          setBookmarks(sortBookmarks((payload?.bookmarks ?? []) as BookmarkTimelineItem[]));
        }
      } catch {
        if (!cancelled) setBookmarkStatus("Khong tai duoc moc nghe.");
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

  function onSlider(value: string) {
    requestSeek(Number(value));
  }

  function sleepTimerSummary() {
    if (sleepTimer.mode === "end_of_episode") return "Hen gio: den het tap";
    if (sleepTimer.mode === "minutes" && sleepTimer.expiresAt) {
      const remaining = Math.max(0, Math.ceil((sleepTimer.expiresAt - Date.now()) / 60000));
      return `Hen gio: ${remaining} phut`;
    }
    return "Hen gio: tat";
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
        setBookmarkStatus(payload?.error ?? "Khong luu duoc moc nghe.");
        return;
      }

      const nextBookmark = payload?.bookmark as BookmarkTimelineItem;
      setBookmarks((currentItems) => sortBookmarks([...currentItems, nextBookmark]));
      setBookmarkNote("");
      setBookmarkStatus(`Da luu moc tai ${formatSeconds(nextBookmark.second)}.`);
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
      setBookmarkStatus("Khong luu duoc moc nghe.");
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
        setBookmarkStatus(payload?.error ?? "Khong cap nhat duoc ghi chu.");
        return;
      }

      const updatedBookmark = payload?.bookmark as BookmarkTimelineItem;
      setBookmarks((currentItems) => sortBookmarks(currentItems.map((item) => (item.id === bookmarkId ? updatedBookmark : item))));
      setBookmarkStatus("Da cap nhat ghi chu.");
    } catch {
      setBookmarks(previousBookmarks);
      setBookmarkStatus("Khong cap nhat duoc ghi chu.");
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
        setBookmarkStatus(payload?.error ?? "Khong xoa duoc moc nghe.");
        return;
      }

      setBookmarkStatus("Da xoa moc nghe.");
    } catch {
      setBookmarks(previousBookmarks);
      setBookmarkStatus("Khong xoa duoc moc nghe.");
    } finally {
      setDeletingBookmarkId(null);
    }
  }

  return (
    <section className="rounded-lg border bg-card p-4 shadow-2xl shadow-black/20 md:p-6">
      <div className="grid gap-5 md:grid-cols-[180px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
          {activeEpisode.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeEpisode.coverUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="text-sm text-muted-foreground">{activeEpisode.seriesTitle}</p>
          <p className="mt-1 text-2xl font-black md:text-4xl">{activeEpisode.title}</p>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>{formatSeconds(progress.currentSeconds)}</span>
              <span>{formatSeconds(progress.durationSeconds)}</span>
            </div>
            <input
              aria-label="Tien trinh nghe"
              type="range"
              min={0}
              max={progress.durationSeconds || 0}
              value={progress.currentSeconds}
              onChange={(event) => onSlider(event.target.value)}
              className="w-full accent-amber-400"
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {formatSeconds(progress.currentSeconds)} / {formatSeconds(progress.durationSeconds)}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" size="icon" onClick={() => seek(-10)} aria-label="Lui 10 giay">
              <RotateCcw aria-hidden="true" />
            </Button>
            <Button type="button" size="lg" onClick={togglePlay}>
              {isPlaying ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
              {isPlaying ? "Tam dung" : "Phat"}
            </Button>
            <Button type="button" variant="secondary" size="icon" onClick={() => seek(10)} aria-label="Tien 10 giay">
              <RotateCw aria-hidden="true" />
            </Button>
            <select
              aria-label="Toc do phat"
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="h-10 rounded-md border bg-input px-3 text-sm"
            >
              {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <option key={speed} value={speed}>{speed}x</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 aria-hidden="true" />
              <select
                aria-label="Am luong"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="h-10 rounded-md border bg-input px-3 text-sm"
              >
                <option value={0.25}>25%</option>
                <option value={0.5}>50%</option>
                <option value={0.75}>75%</option>
                <option value={1}>100%</option>
              </select>
            </label>
          </div>

          {featureFlags.continuousPlay ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  aria-label="Auto-play"
                  type="checkbox"
                  checked={autoPlayNext}
                  onChange={(event) => setAutoPlayNext(event.target.checked)}
                />
                Auto-play tap tiep theo
              </label>
              <Button type="button" variant="outline" size="sm" onClick={() => playNextInQueue()} disabled={!nextEpisode}>
                Play next
              </Button>
              {nextEpisode ? <p className="text-xs text-muted-foreground">Tiep theo: {nextEpisode.title}</p> : null}
            </div>
          ) : null}

          {featureFlags.sleepTimer ? (
            <div className="mt-4 rounded-md border border-dashed p-3">
              <p className="text-xs text-muted-foreground">{sleepTimerSummary()}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[10, 20, 30, 45].map((minutes) => (
                  <Button key={minutes} type="button" variant="outline" size="sm" onClick={() => startSleepTimerMinutes(minutes)}>
                    {minutes} phut
                  </Button>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={startSleepTimerEndOfEpisode}>
                  Den het tap
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={cancelSleepTimer}>
                  Huy hen gio
                </Button>
              </div>
            </div>
          ) : null}

          {featureFlags.bookmarks ? (
            <div className="mt-4 rounded-md border border-dashed p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Moc nghe va ghi chu</p>
                  <p className="text-xs text-muted-foreground">Luu lai doan dang nghe de quay lai nhanh hon.</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={createBookmark}
                  disabled={!canManageBookmarks || isSavingBookmark}
                >
                  <BookmarkPlus aria-hidden="true" />
                  Luu tai {formatSeconds(progress.currentSeconds)}
                </Button>
              </div>

              {canManageBookmarks ? (
                <>
                  <label className="mt-3 block text-sm font-medium" htmlFor="bookmark-note">
                    Ghi chu tuy chon
                  </label>
                  <Textarea
                    id="bookmark-note"
                    value={bookmarkNote}
                    onChange={(event) => setBookmarkNote(event.target.value)}
                    placeholder="Vi du: bat dau twist, gioi thieu nhan vat, can nghe lai"
                    maxLength={500}
                    className="mt-2 min-h-20"
                  />

                  {isLoadingBookmarks ? <p className="mt-3 text-sm text-muted-foreground">Dang tai moc nghe...</p> : null}
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
                <p className="mt-3 text-sm text-muted-foreground">Dang nhap de luu moc nghe va dong bo ghi chu giua cac lan nghe.</p>
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
