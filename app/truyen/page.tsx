import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { SeriesFilters } from "@/components/series/series-filters";
import { StoryCard } from "@/components/series/story-card";
import { Badge } from "@/components/ui/badge";
import { seriesFilterSchema } from "@/lib/series/validators";
import { getCategories, getSeriesList } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function SeriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const parsedFilters = seriesFilterSchema.safeParse({
    q: typeof params.q === "string" ? params.q : undefined,
    category: typeof params.category === "string" ? params.category : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    sort: typeof params.sort === "string" ? params.sort : undefined,
    minEpisodes: typeof params.minEpisodes === "string" ? params.minEpisodes : undefined,
    maxEpisodes: typeof params.maxEpisodes === "string" ? params.maxEpisodes : undefined,
    minRating: typeof params.minRating === "string" ? params.minRating : undefined,
    hasAudio: typeof params.hasAudio === "string" ? params.hasAudio : undefined,
    sortByCompletion: typeof params.sortByCompletion === "string" ? params.sortByCompletion : undefined
  });
  const filters = parsedFilters.success ? parsedFilters.data : { sort: "newest" as const };

  let series: Awaited<ReturnType<typeof getSeriesList>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [series, categories] = await Promise.all([getSeriesList(filters), getCategories()]);
  } catch (error) {
    console.error("[SeriesPage] Fallback to empty data due to data source error", error);
  }
  const activeFilterBadges = [
    filters.minEpisodes !== undefined ? `Tập từ ${filters.minEpisodes}` : null,
    filters.maxEpisodes !== undefined ? `Tập đến ${filters.maxEpisodes}` : null,
    filters.minRating !== undefined ? `Điểm từ ${filters.minRating}` : null,
    filters.hasAudio === true ? "Có audio" : null,
    filters.sortByCompletion === "completed-first" ? "Ưu tiên hoàn thành" : null,
    filters.sortByCompletion === "ongoing-first" ? "Ưu tiên đang cập nhật" : null
  ].filter((item): item is string => Boolean(item));

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="glass-panel rounded-lg p-5 md:p-7">
        <Badge variant="accent">Thư viện audio</Badge>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">Kho truyện</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Tìm truyện theo tên, thể loại, trạng thái và mức độ phổ biến. Giao diện được tối ưu để lướt nhanh trên điện thoại.
        </p>
        <div className="mt-6">
          <SeriesFilters
            q={filters.q}
            category={filters.category}
            status={filters.status}
            sort={filters.sort}
            minEpisodes={filters.minEpisodes?.toString()}
            maxEpisodes={filters.maxEpisodes?.toString()}
            minRating={filters.minRating?.toString()}
            hasAudio={filters.hasAudio === undefined ? "" : filters.hasAudio ? "true" : "false"}
            sortByCompletion={filters.sortByCompletion}
          />
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <Link href="/truyen" className="inline-flex h-9 shrink-0 items-center rounded-md border bg-secondary px-3 text-sm font-semibold">Tất cả</Link>
        {categories.map((category) => (
          <Link key={category.id} href={`/truyen?category=${category.slug}`} className="inline-flex h-9 shrink-0 items-center rounded-md border bg-card px-3 text-sm text-muted-foreground hover:border-accent hover:text-foreground">
            {category.name} ({category._count.series})
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-black">Tìm thấy {series.length} bộ truyện</h2>
        <p className="text-sm text-muted-foreground">Sắp xếp: {filters.sort === "popular" ? "nghe nhiều" : filters.sort === "rating" ? "đánh giá cao" : "mới nhất"}</p>
      </div>
      {activeFilterBadges.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilterBadges.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      ) : null}

      {series.length ? (
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {series.map((item) => <StoryCard key={item.id} series={item} />)}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState title="Chưa có truyện phù hợp" description="Thử đổi bộ lọc hoặc từ khóa khác." />
        </div>
      )}
    </section>
  );
}
