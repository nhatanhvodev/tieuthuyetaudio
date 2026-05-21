import { notFound } from "next/navigation";
import { StoryCard } from "@/components/series/story-card";
import { getCategoryWithSeries } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let category: Awaited<ReturnType<typeof getCategoryWithSeries>> = null;

  try {
    category = await getCategoryWithSeries(slug);
  } catch (error) {
    console.error("[CategoryPage] Fallback to notFound due to data source error", error);
  }

  if (!category) notFound();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="glass-panel rounded-lg p-5 md:p-6">
        <h1 className="text-4xl font-black">{category.name}</h1>
        <p className="mt-3 text-muted-foreground">Có {category.series.length} bộ truyện trong thể loại này.</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {category.series.map(({ series }) => <StoryCard key={series.id} series={series} />)}
      </div>
    </section>
  );
}
