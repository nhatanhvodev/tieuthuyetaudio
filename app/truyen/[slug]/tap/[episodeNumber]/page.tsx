import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";
import { AudioPlayer } from "@/components/player/audio-player";
import { CoverImage } from "@/components/common/cover-image";
import { EpisodeList } from "@/components/series/episode-list";
import { ContextualUpsell } from "@/components/vip/contextual-upsell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
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
  const session = await auth();
  const episode = await getSeriesEpisode(slug, activeEpisodeNumber);
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
  const initialBookmarks: BookmarkTimelineItem[] = canManageBookmarks
    ? (
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
      }))
    : [];

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

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/">Trang chu</Link>
        <ChevronRight aria-hidden="true" className="size-4" />
        <Link href={`/truyen/${episode.series.slug}`}>{episode.series.title}</Link>
        <ChevronRight aria-hidden="true" className="size-4" />
        <span className="truncate text-foreground">{episode.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border bg-card/90 p-4 md:p-6">
          <div className="mb-5 flex items-start gap-4">
            <div className="relative hidden aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-md bg-secondary sm:block">
              <CoverImage src={episode.series.coverUrl} alt={episode.series.title} sizes="112px" className="absolute inset-0 size-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">Dang phat</Badge>
                {episode.isPremium ? <Badge variant="outline">Tap premium</Badge> : null}
              </div>
              <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">{episode.title}</h1>
              <p className="mt-2 text-muted-foreground">{episode.series.title}</p>
            </div>
          </div>

          {isLocked ? (
            <div className="rounded-xl border border-accent/40 bg-gradient-to-br from-accent/10 via-card to-card p-6">
              <div className="flex items-center gap-2 text-accent">
                <Lock aria-hidden="true" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">Tap premium</span>
              </div>
              <h2 className="mt-4 text-2xl font-black">Mo VIP de nghe tron ven tap nay</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Day la tap premium trong mo hinh soft paywall. Ban van xem duoc metadata, danh sach tap va luong cap nhat, nhung playback day du chi mo cho tai khoan VIP hoac admin.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/vip">Xem quyen loi VIP</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={`/truyen/${episode.series.slug}`}>Quay lai chi tiet truyen</Link>
                </Button>
              </div>
              <div className="mt-5">
                <ContextualUpsell
                  compact
                  title="Nghe lien mach voi VIP"
                  description="Mo khoa cac tap premium, bookmark ghi chu va theo doi nhung bo truyen dai tap de dang hon."
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
            <AudioPlayer
              episode={currentEpisodePayload}
              queue={queue}
              canManageBookmarks={canManageBookmarks}
              initialBookmarks={initialBookmarks}
            />
          )}
        </div>

        <aside className="rounded-lg border bg-card/90 p-4">
          <h2 className="text-xl font-black">Cac tap khac</h2>
          {showUpsell ? (
            <div className="mt-4">
              <ContextualUpsell
                compact
                title={episode.isPremium ? "Tap premium trong lo trinh VIP" : "Nghe khong gian doan voi VIP"}
                description="Mo VIP de nghe lien tuc, uu tien cap nhat nhanh va theo doi truyen dai tap de dang hon."
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
  );
}
