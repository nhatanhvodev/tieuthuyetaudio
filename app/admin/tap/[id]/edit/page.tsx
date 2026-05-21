import Link from "next/link";
import { notFound } from "next/navigation";
import { EpisodeDeleteButton } from "@/components/admin/episode-delete-button";
import { EpisodeForm } from "@/components/admin/episode-form";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [series, episode] = await Promise.all([
    db.series.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.episode.findUnique({ where: { id } })
  ]);

  if (!episode) notFound();

  return (
    <section className="space-y-4">
      <div className="admin-panel flex flex-wrap items-start justify-between gap-3 rounded-2xl p-5">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Sửa tập</h2>
          <p className="admin-subtle mt-1 text-sm">Cập nhật thông tin tập và liên kết audio.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary"><Link href="/admin/tap">Quay lại</Link></Button>
          <EpisodeDeleteButton id={episode.id} title={episode.title} redirectTo="/admin/tap" />
        </div>
      </div>
      <EpisodeForm
        series={series}
        value={{
          id: episode.id,
          seriesId: episode.seriesId,
          episodeNumber: episode.episodeNumber,
          title: episode.title,
          durationSeconds: episode.durationSeconds,
          isPremium: episode.isPremium,
          audioUrl: episode.audioUrl
        }}
      />
    </section>
  );
}
