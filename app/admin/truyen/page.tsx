import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSeriesPage() {
  await requireAdmin();
  const series = await db.series.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <div className="mt-8 flex items-center justify-between">
          <h1 className="text-4xl font-black">Quan ly truyen</h1>
          <Button asChild><Link href="/admin/truyen/new">Them truyen</Link></Button>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader><TableRow><TableHead>Ten</TableHead><TableHead>Slug</TableHead><TableHead>Status</TableHead><TableHead>Tap</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {series.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.slug}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.episodeCount}</TableCell>
                  <TableCell><Link className="font-semibold text-teal-700" href={`/admin/truyen/${item.id}/edit`}>Sua</Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
