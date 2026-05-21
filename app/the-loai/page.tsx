import Link from "next/link";
import { Tags } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { getCategories } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    categories = await getCategories();
  } catch (error) {
    console.error("[CategoriesPage] Fallback to empty categories due to data source error", error);
  }
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">Thể loại</h1>
      {categories.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/the-loai/${category.slug}`} className="glass-panel rounded-lg p-5 transition hover:border-accent/60">
              <Tags aria-hidden="true" className="text-accent" />
              <p className="mt-4 text-xl font-black">{category.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{category._count.series} truyện</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="Chưa có thể loại"
            description="Dữ liệu thể loại đang được cập nhật. Vui lòng quay lại sau hoặc vào kho truyện để khám phá nội dung mới."
          />
        </div>
      )}
    </section>
  );
}
