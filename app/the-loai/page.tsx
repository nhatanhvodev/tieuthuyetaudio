import Link from "next/link";
import { getCategories } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">The loai</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/the-loai/${category.slug}`} className="rounded-lg border bg-card p-5 transition hover:border-primary/50">
            <p className="text-xl font-black">{category.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{category._count.series} truyen</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
