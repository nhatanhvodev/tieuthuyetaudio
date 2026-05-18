import Link from "next/link";
import { Tags } from "lucide-react";
import { getCategories } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">Thể loại</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/the-loai/${category.slug}`} className="rounded-lg border bg-card/90 p-5 transition hover:border-accent/60">
            <Tags aria-hidden="true" className="text-accent" />
            <p className="mt-4 text-xl font-black">{category.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{category._count.series} truyện</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
