import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const [series, episodes, users] = await Promise.all([db.series.count(), db.episode.count(), db.user.count()]);
  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <h1 className="mt-8 text-4xl font-black">Quản trị</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="bg-white text-slate-950"><CardHeader><CardTitle>Truyện</CardTitle></CardHeader><CardContent className="text-3xl font-black">{series}</CardContent></Card>
          <Card className="bg-white text-slate-950"><CardHeader><CardTitle>Tập</CardTitle></CardHeader><CardContent className="text-3xl font-black">{episodes}</CardContent></Card>
          <Card className="bg-white text-slate-950"><CardHeader><CardTitle>Người dùng</CardTitle></CardHeader><CardContent className="text-3xl font-black">{users}</CardContent></Card>
        </div>
        <div className="mt-6"><Link className="font-semibold text-teal-700" href="/admin/truyen/new">Thêm truyện mới</Link></div>
      </div>
    </section>
  );
}
