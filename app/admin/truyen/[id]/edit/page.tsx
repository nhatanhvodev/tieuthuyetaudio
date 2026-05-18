import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { SeriesForm } from "@/components/admin/series-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const series = await db.series.findUnique({ where: { id } });
  if (!series) notFound();
  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-3xl">
        <AdminNav />
        <h1 className="my-8 text-4xl font-black">Sửa truyện</h1>
        <SeriesForm value={series} />
      </div>
    </section>
  );
}
