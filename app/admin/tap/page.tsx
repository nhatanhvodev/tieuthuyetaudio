import { AdminNav } from "@/components/admin/admin-nav";
import { EpisodeForm } from "@/components/admin/episode-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminEpisodesPage() {
  await requireAdmin();
  const [series, episodes] = await Promise.all([
    db.series.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.episode.findMany({ include: { series: true }, orderBy: [{ seriesId: "asc" }, { episodeNumber: "asc" }] })
  ]);
  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <h1 className="my-8 text-4xl font-black">Quản lý tập</h1>
        <EpisodeForm series={series} />
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader><TableRow><TableHead>Truyện</TableHead><TableHead>Tập</TableHead><TableHead>Tên</TableHead><TableHead>URL audio</TableHead></TableRow></TableHeader>
            <TableBody>
              {episodes.map((episode) => (
                <TableRow key={episode.id}>
                  <TableCell>{episode.series.title}</TableCell>
                  <TableCell>{episode.episodeNumber}</TableCell>
                  <TableCell>{episode.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{episode.audioUrl}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
