import { notFound } from "next/navigation";
import { AudioPlayer } from "@/components/player/audio-player";
import { EpisodeList } from "@/components/series/episode-list";
import { getSeriesEpisode } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function EpisodePage({ params }: { params: Promise<{ slug: string; episodeNumber: string }> }) {
  const { slug, episodeNumber } = await params;
  const episode = await getSeriesEpisode(slug, Number(episodeNumber));
  if (!episode?.audioUrl) notFound();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <AudioPlayer
        episode={{
          episodeId: episode.id,
          seriesSlug: episode.series.slug,
          episodeNumber: episode.episodeNumber,
          title: episode.title,
          seriesTitle: episode.series.title,
          audioUrl: episode.audioUrl,
          coverUrl: episode.series.coverUrl
        }}
      />
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-black">Cac tap khac</h2>
        <EpisodeList slug={episode.series.slug} episodes={episode.series.episodes} />
      </div>
    </section>
  );
}
