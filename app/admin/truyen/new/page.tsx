import { AdminNav } from "@/components/admin/admin-nav";
import { SeriesForm } from "@/components/admin/series-form";
import { requireAdmin } from "@/lib/auth";

export default async function NewSeriesPage() {
  await requireAdmin();
  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-3xl">
        <AdminNav />
        <h1 className="my-8 text-4xl font-black">Thêm truyện</h1>
        <SeriesForm />
      </div>
    </section>
  );
}
