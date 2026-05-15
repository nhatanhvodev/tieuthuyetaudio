import { EmptyState } from "@/components/common/empty-state";
import { SeriesFilters } from "@/components/series/series-filters";
import { StoryCard } from "@/components/series/story-card";
import { seriesFilterSchema } from "@/lib/series/validators";
import { getSeriesList } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function SeriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters = seriesFilterSchema.parse({
    q: typeof params.q === "string" ? params.q : undefined,
    category: typeof params.category === "string" ? params.category : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    sort: typeof params.sort === "string" ? params.sort : undefined
  });
  const series = await getSeriesList(filters);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">Thu vien truyen</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Loc theo the loai, trang thai va sap xep de tim cau chuyen phu hop.</p>
      <div className="mt-6">
        <SeriesFilters q={filters.q} category={filters.category} status={filters.status} sort={filters.sort} />
      </div>
      {series.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
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
