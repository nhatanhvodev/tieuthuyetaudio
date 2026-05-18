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
  const [series, categories] = await Promise.all([getSeriesList(filters), getCategories()]);
  const activeFilterBadges = [
    filters.minEpisodes !== undefined ? `Tap tu ${filters.minEpisodes}` : null,
    filters.maxEpisodes !== undefined ? `Tap den ${filters.maxEpisodes}` : null,
    filters.minRating !== undefined ? `Diem tu ${filters.minRating}` : null,
    filters.hasAudio === true ? "Co audio" : null,
    filters.sortByCompletion === "completed-first" ? "Uu tien hoan thanh" : null,
    filters.sortByCompletion === "ongoing-first" ? "Uu tien dang cap nhat" : null
  ].filter((item): item is string => Boolean(item));

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-lg border bg-card/80 p-5 md:p-7">
        <Badge variant="accent">Thu vien audio</Badge>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">Kho truyen</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Tim truyen theo ten, the loai, trang thai va muc do pho bien. Giao dien duoc toi uu de luot nhanh tren dien thoai.
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
        <Link href="/truyen" className="inline-flex h-9 shrink-0 items-center rounded-md border bg-secondary px-3 text-sm font-semibold">Tat ca</Link>
        {categories.map((category) => (
          <Link key={category.id} href={`/truyen?category=${category.slug}`} className="inline-flex h-9 shrink-0 items-center rounded-md border bg-card px-3 text-sm text-muted-foreground hover:border-accent hover:text-foreground">
            {category.name} ({category._count.series})
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-black">Tim thay {series.length} bo truyen</h2>
        <p className="text-sm text-muted-foreground">Sap xep: {filters.sort === "popular" ? "nghe nhieu" : filters.sort === "rating" ? "danh gia cao" : "moi nhat"}</p>
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
          <EmptyState title="Chua co truyen phu hop" description="Thu doi bo loc hoac tu khoa khac." />
        </div>
      )}
    </section>
  );
}
