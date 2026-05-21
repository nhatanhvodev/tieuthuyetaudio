import Link from "next/link";
import { BookOpen, Crown, Headphones } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { SearchBox } from "@/components/search/search-box";
import { ContinueListeningShelf } from "@/components/series/continue-listening-shelf";
import { LatestEpisodeList } from "@/components/series/latest-episode-list";
import { StoryShelf } from "@/components/series/story-shelf";
import { Button } from "@/components/ui/button";
import { safeAuth } from "@/lib/auth";
import { getContinueListeningByUser, getHomeShelves } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await safeAuth();
  const shelves = await getHomeShelves(session?.user?.id);

  let continueListening: Awaited<ReturnType<typeof getContinueListeningByUser>> = [];
  if (session?.user) {
    try {
      continueListening = await getContinueListeningByUser(session.user.id, 6);
    } catch (error) {
      console.error("[HomePage] Fallback continue listening due to data source error", error);
    }
  }

  return (
    <>
      {/* Hero — centered, no background image */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
        <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
          Tiểu thuyết Audio
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-base leading-7 text-muted-foreground md:text-lg">
          Website nghe truyện audio tối ưu cho mobile, có player toàn cục, lưu tiến trình nghe và tùy chọn cài như app trên điện thoại.
        </p>
        <div className="mt-8 max-w-lg mx-auto">
          <SearchBox />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/truyen">
              <BookOpen data-icon="inline-start" />
              Khám phá ngay
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/vip">
              <Crown data-icon="inline-start" />
              Đăng ký VIP
            </Link>
          </Button>
        </div>
      </section>

      {/* Tiếp tục nghe */}
      {session?.user ? (
        <section className="mx-auto max-w-7xl px-4" style={{ marginBottom: "var(--spacing-section-gap)" }}>
          <ContinueListeningShelf items={continueListening} title="Tiếp tục nghe" href="/tai-khoan" />
        </section>
      ) : null}

      {/* Dành riêng cho bạn — horizontal scroll */}
      <section className="mx-auto max-w-7xl px-4" style={{ marginBottom: "var(--spacing-section-gap)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>Dành riêng cho bạn</h2>
          <Link href="/truyen?sort=rating" className="text-sm font-semibold text-accent hover:underline">Xem tất cả &rarr;</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
          {shelves.recommended.slice(0, 10).map((series) => (
            <Link
              key={series.id}
              href={`/truyen/${series.slug}`}
              className="w-[140px] shrink-0 flex flex-col gap-3 snap-start group"
            >
              <div className="w-full h-[200px] rounded-lg overflow-hidden bg-secondary relative shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
                {series.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={series.coverUrl} alt={series.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : null}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-[32px] drop-shadow-md">▶</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground line-clamp-2">{series.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{series.producer ?? "Giọng đọc"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Grid shelves */}
      <StoryShelf title="Trending 24h" href="/truyen?sort=popular" items={shelves.trending24h} />

      <section className="mx-auto max-w-7xl px-4" style={{ marginBottom: "var(--spacing-section-gap)" }}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>Tập mới cập nhật</h2>
          <Link href="/truyen?sort=newest" className="text-sm font-semibold text-accent hover:underline">Xem thư viện &rarr;</Link>
        </div>
        <LatestEpisodeList episodes={shelves.latestEpisodes} />
      </section>

      <StoryShelf title="Trending 7 ngày" href="/truyen?sort=popular" items={shelves.trending7d} />
      <StoryShelf title="Rising" href="/truyen?sort=newest" items={shelves.rising} />
      <StoryShelf title="Truyện mới lên kệ" href="/truyen?sort=newest" items={shelves.latest} />
      <StoryShelf
        title={shelves.recommendationMeta.personalized ? "Dành cho bạn" : "Có thể bạn sẽ thích"}
        href="/truyen?sort=rating"
        items={shelves.recommended}
      />

      {/* PWA promo */}
      <section className="mx-auto max-w-7xl px-4" style={{ marginBottom: "var(--spacing-section-gap)" }}>
        <div className="rounded-xl border border-[color-mix(in_oklch,var(--foreground)_6%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_15%,var(--background))] p-6 text-center">
          <Headphones className="mx-auto size-8 text-accent" />
          <h2 className="mt-3 text-lg font-bold" style={{ fontFamily: "var(--font-headline)" }}>Nghe tiếp trên mobile</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Cài website như ứng dụng để mở nhanh từ màn hình chính, giữ player và tiếp tục nghe bộ truyện đang theo dõi.
          </p>
          <div className="mt-4">
            <InstallAppButton />
          </div>
        </div>
      </section>
    </>
  );
}
