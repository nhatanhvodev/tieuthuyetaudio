import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AudioPlayer } from "@/components/player/audio-player";
import { EpisodeList } from "@/components/series/episode-list";
import { ContextualUpsell } from "@/components/vip/contextual-upsell";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import type { BookmarkTimelineItem } from "@/lib/bookmarks/validators";
import { db } from "@/lib/db";
import { isFeatureEnabled } from "@/lib/features";
import type { PlayerEpisode } from "@/stores/player-store";
import { getSeriesEpisode } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function EpisodePage({ params }: { params: Promise<{ slug: string; episodeNumber: string }> }) {
  const { slug, episodeNumber } = await params;
  const activeEpisodeNumber = Number(episodeNumber);
  const session = await auth();
  const episode = await getSeriesEpisode(slug, activeEpisodeNumber);
  if (!episode?.audioUrl) notFound();
  const showUpsell = isFeatureEnabled("paywall") && !session?.user?.isVip;
  const canManageBookmarks = isFeatureEnabled("bookmarks") && Boolean(session?.user);
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
              {episode.series.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={episode.series.coverUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <Badge variant="accent">Dang phat</Badge>
              <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">{episode.title}</h1>
              <p className="mt-2 text-muted-foreground">{episode.series.title}</p>
            </div>
          </div>
          <AudioPlayer
            episode={currentEpisodePayload}
            queue={queue}
            canManageBookmarks={canManageBookmarks}
            initialBookmarks={initialBookmarks}
          />
        </div>

        <aside className="rounded-lg border bg-card/90 p-4">
          <h2 className="text-xl font-black">Cac tap khac</h2>
          {showUpsell ? (
            <div className="mt-4">
              <ContextualUpsell
                compact
                title="Nghe khong gian doan voi VIP"
                description="Mo VIP de nghe lien tuc, uu tien cap nhat nhanh va theo doi truyen dai tap de dang hon."
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
