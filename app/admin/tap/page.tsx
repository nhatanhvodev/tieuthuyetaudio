import Link from "next/link";
import { EpisodeForm } from "@/components/admin/episode-form";
import { EpisodesTable } from "@/components/admin/episodes-table";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = {
  q?: string;
  page?: string;
  premium?: string;
  seriesId?: string;
};

export default async function AdminEpisodesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;

  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const premium = params.premium === "premium" || params.premium === "free" ? params.premium : "";
  const seriesId = (params.seriesId ?? "").trim();

  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { series: { title: { contains: q, mode: "insensitive" as const } } }
          ]
        }
      : {}),
    ...(premium === "premium" ? { isPremium: true } : {}),
    ...(premium === "free" ? { isPremium: false } : {}),
    ...(seriesId ? { seriesId } : {})
  };

  const [series, total] = await Promise.all([
    db.series.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.episode.count({ where })
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const episodes = await db.episode.findMany({
    where,
    include: { series: true },
    orderBy: [{ updatedAt: "desc" }],
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });

  return (
    <section className="space-y-4">
      <div className="admin-panel rounded-2xl p-5">
        <h2 className="text-3xl font-black text-slate-900">Quản lý tập</h2>
        <p className="admin-subtle mt-1 text-sm">Tạo và kiểm soát danh sách tập audio theo từng truyện.</p>
      </div>

      <EpisodeForm series={series} />

      <div className="admin-panel rounded-2xl p-4">
        <form action="/admin/tap" className="flex flex-wrap items-center gap-2">
          <Input name="q" defaultValue={q} placeholder="Tìm theo tên tập hoặc tên truyện..." className="max-w-md" />
          <select name="seriesId" defaultValue={seriesId} className="admin-select select select-bordered h-10 text-sm">
            <option value="">Tất cả truyện</option>
            {series.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
          <select name="premium" defaultValue={premium} className="admin-select select select-bordered h-10 text-sm">
            <option value="">Tất cả gói</option>
            <option value="premium">Premium</option>
            <option value="free">Mở</option>
          </select>
          <Button type="submit" size="sm">Tìm</Button>
          {q || premium || seriesId ? (
            <Button asChild type="button" variant="secondary" size="sm">
              <Link href="/admin/tap">Xóa lọc</Link>
            </Button>
          ) : null}
        </form>
      </div>

      <EpisodesTable
        rows={episodes.map((episode) => ({
          id: episode.id,
          seriesTitle: episode.series.title,
          episodeNumber: episode.episodeNumber,
          title: episode.title,
          isPremium: episode.isPremium,
          audioUrl: episode.audioUrl
        }))}
      />

      <PaginationControls page={safePage} pageCount={pageCount} basePath="/admin/tap" params={{ q, premium, seriesId }} />
    </section>
  );
}
