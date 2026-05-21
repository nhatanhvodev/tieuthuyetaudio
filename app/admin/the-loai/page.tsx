import { CategoryManager } from "@/components/admin/category-manager";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await db.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" }
  });

  return (
    <section className="space-y-4">
      <div className="admin-panel rounded-2xl p-5">
        <h2 className="text-3xl font-black text-slate-900">Quản lý thể loại</h2>
        <p className="admin-subtle mt-1 text-sm">Thêm, sửa và xóa thể loại dùng cho truyện.</p>
      </div>
      <CategoryManager categories={categories} />
    </section>
  );
}
