import Link from "next/link";
import { StoryCard, StoryCardSkeleton } from "@/components/series/story-card";
import type { SeriesWithRelations } from "@/lib/series/queries";

export function StoryShelf({
  title,
  href,
  items,
  loading
}: {
  title: string;
  href?: string;
  items: SeriesWithRelations[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black">{title}</h2>
        </div>
        <div className="grid grid-flow-col auto-cols-[70%] gap-4 overflow-x-auto pb-2 sm:auto-cols-[40%] md:grid-flow-row md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StoryCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black">{title}</h2>
        {href ? <Link href={href} className="text-sm font-semibold text-accent">Xem tat ca</Link> : null}
      </div>
      <div className="grid grid-flow-col auto-cols-[70%] gap-4 overflow-x-auto pb-2 sm:auto-cols-[40%] md:grid-flow-row md:grid-cols-4 lg:grid-cols-6">
        {items.map((series) => (
          <StoryCard key={series.id} series={series} />
        ))}
      </div>
    </section>
  );
}
