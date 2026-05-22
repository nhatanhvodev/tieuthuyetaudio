import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { AudioPlayer } from "@/components/player/audio-player";
import { EpisodeSwipeWrapper } from "@/components/player/episode-swipe-wrapper";
import { EpisodeList } from "@/components/series/episode-list";
import { ContextualUpsell } from "@/components/vip/contextual-upsell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { safeAuth } from "@/lib/auth";
import type { BookmarkTimelineItem } from "@/lib/bookmarks/validators";
import { db } from "@/lib/db";
import { isFeatureEnabled } from "@/lib/features";
import { getEpisodeAccessState } from "@/lib/premium";
import type { PlayerEpisode } from "@/stores/player-store";
import { getSeriesEpisode } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function EpisodePage({ params }: { params: Promise<{ slug: string; episodeNumber: string }> }) {
  const { slug, episodeNumber } = await params;
  const activeEpisodeNumber = Number(episodeNumber);

  let session: Awaited<ReturnType<typeof safeAuth>> = null;
  let episode: Awaited<ReturnType<typeof getSeriesEpisode>> = null;

  try {
    session = await safeAuth();
    episode = await getSeriesEpisode(slug, activeEpisodeNumber);
  } catch (error) {
    console.error("[EpisodePage] Fallback to notFound due to data source error", error);
  }

  if (!episode?.audioUrl) notFound();

  const paywallEnabled = isFeatureEnabled("paywall");
  const accessState = getEpisodeAccessState({
    featureEnabled: paywallEnabled,
    isPremiumEpisode: episode.isPremium,
    isVip: Boolean(session?.user?.isVip),
    role: session?.user?.role ?? "USER"
  });
  const isLocked = accessState === "locked";
  const showUpsell = paywallEnabled && (!session?.user?.isVip || episode.isPremium);
  const canManageBookmarks = isFeatureEnabled("bookmarks") && Boolean(session?.user) && !isLocked;

  let initialBookmarks: BookmarkTimelineItem[] = [];

  if (canManageBookmarks) {
    try {
      initialBookmarks = (
        await db.bookmark.findMany({
          where: {
            userId: session!.user.id,
            episodeId: episode.id
          },
          orderBy: [{ second: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            second: true,
            note: true,
            createdAt: true
          }
        })
      ).map((bookmark) => ({
        id: bookmark.id,
        second: bookmark.second,
        note: bookmark.note,
        createdAt: bookmark.createdAt.toISOString()
      }));
    } catch (error) {
      console.error("[EpisodePage] Fallback bookmarks due to data source error", error);
    }
  }

  const queue: PlayerEpisode[] = episode.series.episodes
    .filter((item) => Boolean(item.audioUrl))
    .map((item) => ({
      episodeId: item.id,
      seriesSlug: episode.series.slug,
      episodeNumber: item.episodeNumber,
      title: item.title,
      seriesTitle: episode.series.title,
      audioUrl: item.audioUrl!,
      coverUrl: episode.series.coverUrl
    }));

  const currentEpisodePayload: PlayerEpisode = {
    episodeId: episode.id,
    seriesSlug: episode.series.slug,
    episodeNumber: episode.episodeNumber,
    title: episode.title,
    seriesTitle: episode.series.title,
    audioUrl: episode.audioUrl,
    coverUrl: episode.series.coverUrl
  };

  const currentQueueIndex = queue.findIndex(
    (item) => item.episodeNumber === activeEpisodeNumber
  );
  const prevEpisode = currentQueueIndex > 0 ? queue[currentQueueIndex - 1] : null;
  const nextEpisode =
    currentQueueIndex >= 0 && currentQueueIndex < queue.length - 1
      ? queue[currentQueueIndex + 1]
      : null;
  const episodePosition = `${activeEpisodeNumber} / ${episode.series.episodes.length}`;

  return (
    <EpisodeSwipeWrapper
      prevHref={prevEpisode ? `/truyen/${episode.series.slug}/tap/${prevEpisode.episodeNumber}` : undefined}
      nextHref={nextEpisode ? `/truyen/${episode.series.slug}/tap/${nextEpisode.episodeNumber}` : undefined}
    >
    <section className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/">Trang chủ</Link>
        <ChevronRight aria-hidden="true" className="size-4" />
        <Link href={`/truyen/${episode.series.slug}`}>{episode.series.title}</Link>
        <ChevronRight aria-hidden="true" className="size-4" />
        <span className="truncate text-foreground">{episode.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="glass-panel rounded-lg p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="accent">Đang phát</Badge>
            {episode.isPremium ? <Badge variant="outline">Tập premium</Badge> : null}
          </div>

          {isLocked ? (
            <div className="rounded-xl border border-accent/40 bg-gradient-to-br from-accent/10 via-card to-card p-6">
              <div className="flex items-center gap-2 text-accent">
                <Lock aria-hidden="true" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">Tập premium</span>
              </div>
              <h2 className="mt-4 text-2xl font-black">Mở VIP để nghe trọn vẹn tập này</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Đây là tập premium trong mô hình soft paywall. Bạn vẫn xem được metadata, danh sách tập và luồng cập nhật, nhưng playback đầy đủ chỉ mở cho tài khoản VIP hoặc admin.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/vip">Xem quyền lợi VIP</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={`/truyen/${episode.series.slug}`}>Quay lại chi tiết truyện</Link>
                </Button>
              </div>
              <div className="mt-5">
                <ContextualUpsell
                  compact
                  title="Nghe liền mạch với VIP"
                  description="Mở khóa các tập premium, bookmark ghi chú và theo dõi những bộ truyện dài tập dễ dàng hơn."
                  tracking={{
                    episodeId: episode.id,
                    seriesId: episode.seriesId,
                    seriesSlug: episode.series.slug,
                    episodeNumber: episode.episodeNumber
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AudioPlayer
                episode={currentEpisodePayload}
                queue={queue}
                canManageBookmarks={canManageBookmarks}
                initialBookmarks={initialBookmarks}
              />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {prevEpisode ? (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/truyen/${episode.series.slug}/tap/${prevEpisode.episodeNumber}`}
                      >
                        <ChevronLeft className="mr-1 size-4" />
                        Tập trước
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="mr-1 size-4" />
                      Tập trước
                    </Button>
                  )}
                  {nextEpisode ? (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/truyen/${episode.series.slug}/tap/${nextEpisode.episodeNumber}`}
                      >
                        Tập tiếp theo
                        <ChevronRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Tập tiếp theo
                      <ChevronRight className="ml-1 size-4" />
                    </Button>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  Tập {episodePosition}
                </span>
              </div>
            </div>
          )}
        </div>

        <aside className="glass-panel rounded-lg p-4">
          <h2 className="text-xl font-black">Các tập khác</h2>
          {showUpsell ? (
            <div className="mt-4">
              <ContextualUpsell
                compact
                title={episode.isPremium ? "Tập premium trong lộ trình VIP" : "Nghe không gián đoạn với VIP"}
                description="Mở VIP để nghe liên tục, ưu tiên cập nhật nhanh và theo dõi truyện dài tập dễ dàng hơn."
                tracking={{
                  episodeId: episode.id,
                  seriesId: episode.seriesId,
                  seriesSlug: episode.series.slug,
                  episodeNumber: episode.episodeNumber
                }}
              />
            </div>
          ) : null}
          <div className="mt-4">
            <EpisodeList
              slug={episode.series.slug}
              episodes={episode.series.episodes}
              coverUrl={episode.series.coverUrl}
              currentEpisodeNumber={activeEpisodeNumber}
            />
          </div>
        </aside>
      </div>
    </section>
    </EpisodeSwipeWrapper>
  );
}
