import { notFound } from "next/navigation";
import { SeriesForm } from "@/components/admin/series-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [series, categories] = await Promise.all([
    db.series.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            categoryId: true
          }
        }
      }
    }),
    db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    })
  ]);

  if (!series) notFound();

  return (
    <section className="space-y-4">
      <div className="admin-panel rounded-2xl p-5">
        <h2 className="text-3xl font-black text-slate-900">Sửa truyện</h2>
        <p className="admin-subtle mt-1 text-sm">Cập nhật nội dung, trạng thái và thể loại của truyện.</p>
      </div>
      <SeriesForm value={series} categories={categories} />
    </section>
  );
}
