import { SeriesForm } from "@/components/admin/series-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function NewSeriesPage() {
  await requireAdmin();
  const categories = await db.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return (
    <section className="space-y-4">
      <div className="admin-panel rounded-2xl p-5">
        <h2 className="text-3xl font-black text-slate-900">Thêm truyện</h2>
        <p className="admin-subtle mt-1 text-sm">Điền thông tin cơ bản và chọn thể loại trước khi xuất bản.</p>
      </div>
      <SeriesForm categories={categories} />
    </section>
  );
}
