import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Headphones, Star } from "lucide-react";
import { CoverImage } from "@/components/common/cover-image";
import { SeriesActions } from "@/components/series/series-actions";
import { SeriesDetailTabs } from "@/components/series/series-detail-tabs";
import { StoryShelf } from "@/components/series/story-shelf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { safeAuth } from "@/lib/auth";
import type { Session } from "next-auth";
import { db } from "@/lib/db";
import { formatCount, formatDuration, formatStatus } from "@/lib/format";
import { getHomeShelves, getSeriesBySlug } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let series: Awaited<ReturnType<typeof getSeriesBySlug>> = null;
  let session: Session | null = null;

  try {
    session = await safeAuth();
    series = await getSeriesBySlug(slug);
  } catch (error) {
    console.error("[SeriesDetailPage] Fallback to notFound due to data source error", error);
  }

  if (!series) notFound();

  let related: Awaited<ReturnType<typeof getHomeShelves>> = {
    latest: [],
    popular: [],
    recommended: [],
    latestEpisodes: [],
    categories: [],
    trending24h: [],
    trending7d: [],
    rising: [],
    recommendationMeta: {
      personalized: false,
      enabled: false
    }
  };

  try {
    related = await getHomeShelves(session?.user?.id);
  } catch (error) {
    console.error("[SeriesDetailPage] Fallback related shelves due to data source error", error);
  }

  let resumeProgress: {
    currentSeconds: number;
    episode: { episodeNumber: number; title: string; durationSeconds: number | null };
  } | null = null;

  if (session?.user) {
    try {
      resumeProgress = await db.listenProgress.findFirst({
        where: {
          userId: session.user.id,
          currentSeconds: { gt: 0 },
          episode: {
            seriesId: series.id
          }
        },
        orderBy: { updatedAt: "desc" },
        select: {
          currentSeconds: true,
          episode: {
            select: {
              episodeNumber: true,
              title: true,
              durationSeconds: true
            }
          }
        }
      });
    } catch (error) {
      console.error("[SeriesDetailPage] Fallback resume progress due to data source error", error);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0">
          <CoverImage src={series.coverUrl} alt={series.title} priority sizes="100vw" className="absolute inset-0 size-full object-cover opacity-25" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-6">
          <nav className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/">Trang chủ</Link>
            <ChevronRight aria-hidden="true" className="size-4" />
            <Link href="/truyen">Kho truyện</Link>
            <ChevronRight aria-hidden="true" className="size-4" />
            <span className="truncate text-foreground">{series.title}</span>
          </nav>

          <div className="grid gap-8 md:grid-cols-[260px_1fr]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-secondary shadow-2xl shadow-black/35">
              <CoverImage src={series.coverUrl} alt={series.title} priority sizes="(max-width: 768px) 90vw, 260px" className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <p className="absolute inset-x-0 bottom-0 p-4 text-xl font-black text-white">{series.title}</p>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap gap-2">
                <Badge variant={series.status === "COMPLETED" ? "accent" : "secondary"}>{formatStatus(series.status)}</Badge>
                {series.categories.map(({ category }) => <Badge key={category.id} variant="outline">{category.name}</Badge>)}
              </div>
              <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">{series.title}</h1>
              <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{series.description}</p>

              <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="glass-panel rounded-lg p-4">
                  <dt className="text-sm text-muted-foreground">Lượt nghe</dt>
                  <dd className="mt-1 flex items-center gap-2 text-xl font-black"><Headphones aria-hidden="true" /> {formatCount(series.listenCount)}</dd>
                </div>
                <div className="glass-panel rounded-lg p-4">
                  <dt className="text-sm text-muted-foreground">Số tập</dt>
                  <dd className="mt-1 text-xl font-black">{series.episodeCount}</dd>
                </div>
                <div className="glass-panel rounded-lg p-4">
                  <dt className="text-sm text-muted-foreground">Đánh giá</dt>
                  <dd className="mt-1 flex items-center gap-2 text-xl font-black"><Star aria-hidden="true" className="text-accent" /> {series.averageRating.toFixed(1)}</dd>
                </div>
                <div className="glass-panel rounded-lg p-4">
                  <dt className="text-sm text-muted-foreground">Sản xuất</dt>
                  <dd className="mt-1 truncate text-xl font-black">{series.producer}</dd>
                </div>
              </dl>

              {resumeProgress ? (
                <div className="glass-panel mt-6 rounded-lg border-accent/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Nghe tiếp</p>
                  <p className="mt-2 text-lg font-black">{resumeProgress.episode.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bạn đã nghe {formatDuration(resumeProgress.currentSeconds)}
                    {resumeProgress.episode.durationSeconds ? ` / ${formatDuration(resumeProgress.episode.durationSeconds)}` : ""}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href={`/truyen/${series.slug}/tap/${resumeProgress.episode.episodeNumber}`}>Tiếp tục nghe</Link>
                  </Button>
                </div>
              ) : null}

              <SeriesActions seriesId={series.id} slug={series.slug} firstEpisodeNumber={series.episodes[0]?.episodeNumber} title={series.title} />
            </div>
          </div>
        </div>
      </section>

      <SeriesDetailTabs
        slug={series.slug}
        seriesId={series.id}
        coverUrl={series.coverUrl}
        episodes={series.episodes}
        reviews={series.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          content: review.content,
          userName: review.user.name ?? review.user.email,
          userImage: review.user.image,
          isVip: review.user.isVip
        }))}
      />

      <StoryShelf title="Truyện liên quan" items={related.recommended.filter((item) => item.id !== series.id).slice(0, 6)} />
    </>
  );
}
