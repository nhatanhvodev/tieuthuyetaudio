import { notFound } from "next/navigation";
import { EpisodeList } from "@/components/series/episode-list";
import { StoryShelf } from "@/components/series/story-shelf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHomeShelves, getSeriesBySlug } from "@/lib/series/queries";
import { formatCount, formatStatus } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) notFound();
  const related = await getHomeShelves();

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[280px_1fr]">
        <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-amber-400 via-teal-400 to-violet-500 p-5 shadow-2xl shadow-black/20">
          <p className="text-2xl font-black text-slate-950">{series.title}</p>
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={series.status === "COMPLETED" ? "accent" : "secondary"}>{formatStatus(series.status)}</Badge>
            {series.categories.map(({ category }) => <Badge key={category.id} variant="outline">{category.name}</Badge>)}
          </div>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">{series.title}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{series.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-card p-4"><dt className="text-sm text-muted-foreground">Luot nghe</dt><dd className="text-xl font-black">{formatCount(series.listenCount)}</dd></div>
            <div className="rounded-lg border bg-card p-4"><dt className="text-sm text-muted-foreground">So tap</dt><dd className="text-xl font-black">{series.episodeCount}</dd></div>
            <div className="rounded-lg border bg-card p-4"><dt className="text-sm text-muted-foreground">Rating</dt><dd className="text-xl font-black">{series.averageRating.toFixed(1)}</dd></div>
            <div className="rounded-lg border bg-card p-4"><dt className="text-sm text-muted-foreground">San xuat</dt><dd className="truncate text-xl font-black">{series.producer}</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><a href={`/truyen/${series.slug}/tap/${series.episodes[0]?.episodeNumber ?? 1}`}>Nghe thu</a></Button>
            <Button variant="secondary">Theo doi</Button>
            <Button variant="outline">Chia se</Button>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 text-2xl font-black">Danh sach tap</h2>
        <EpisodeList slug={series.slug} episodes={series.episodes} />
      </section>
      <StoryShelf title="Truyen lien quan" items={related.recommended.filter((item) => item.id !== series.id).slice(0, 6)} />
    </>
  );
}
