import Link from "next/link";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { SeriesTable } from "@/components/admin/series-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParams = {
  q?: string;
  page?: string;
};

export default async function AdminSeriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;

  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { slug: { contains: q, mode: "insensitive" as const } }
        ]
      }
    : undefined;

  const total = await db.series.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const series = await db.series.findMany({
    where,
    include: {
      categories: {
        include: {
          category: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });

  return (
    <section className="space-y-4">
      <div className="admin-panel flex flex-wrap items-start justify-between gap-3 rounded-2xl p-5">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Quản lý truyện</h2>
          <p className="admin-subtle mt-1 text-sm">Tạo mới, chỉnh sửa và xóa dữ liệu truyện.</p>
        </div>
        <Button asChild><Link href="/admin/truyen/new">Thêm truyện</Link></Button>
      </div>

      <div className="admin-panel rounded-2xl p-4">
        <form action="/admin/truyen" className="flex flex-wrap items-center gap-2">
          <Input name="q" defaultValue={q} placeholder="Tìm theo tên truyện hoặc slug..." className="max-w-md" />
          <Button type="submit" size="sm">Tìm</Button>
          {q ? (
            <Button asChild type="button" variant="secondary" size="sm">
              <Link href="/admin/truyen">Xóa lọc</Link>
            </Button>
          ) : null}
        </form>
      </div>

      <SeriesTable
        rows={series.map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          status: item.status,
          seriesType: item.seriesType,
          episodeCount: item.episodeCount,
          categories: item.categories.map((entry) => entry.category.name)
        }))}
      />

      <PaginationControls page={safePage} pageCount={pageCount} basePath="/admin/truyen" params={{ q }} />
    </section>
  );
}
