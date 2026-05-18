import { EmptyState } from "@/components/common/empty-state";
import { SearchBox } from "@/components/search/search-box";
import { StoryCard } from "@/components/series/story-card";
import { getSeriesList } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const results = q ? await getSeriesList({ q, sort: "newest" }) : [];
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">Tìm kiếm</h1>
      <div className="mt-6 max-w-2xl"><SearchBox defaultValue={q} /></div>
      {results.length ? (
        <>
          <p className="mt-6 text-sm text-muted-foreground">Tìm thấy {results.length} bộ truyện phù hợp.</p>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {results.map((series) => <StoryCard key={series.id} series={series} />)}
          </div>
        </>
      ) : (
        <div className="mt-8"><EmptyState title="Nhập từ khóa để tìm truyện" description="Tìm theo tên truyện, nhà sản xuất hoặc mô tả demo." /></div>
      )}
    </section>
  );
}
