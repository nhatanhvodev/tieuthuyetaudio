import Link from "next/link";
import { BookOpen, Headphones, Tags, Users, ScrollText, Plus, ListMusic, FolderOpen, UserCog, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<React.ComponentProps<"svg">>; color: "indigo" | "cyan" | "emerald" | "amber" | "rose" }) {
  const gradients: Record<typeof color, string> = {
    indigo: "from-indigo-500 to-blue-600",
    cyan: "from-cyan-500 to-teal-600",
    emerald: "from-emerald-500 to-green-600",
    amber: "from-amber-500 to-orange-600",
    rose: "from-rose-500 to-red-600"
  };
  const bgGradients: Record<typeof color, string> = {
    indigo: "from-indigo-50 to-blue-50",
    cyan: "from-cyan-50 to-teal-50",
    emerald: "from-emerald-50 to-green-50",
    amber: "from-amber-50 to-orange-50",
    rose: "from-rose-50 to-red-50"
  };

  return (
    <Card className="admin-panel group relative overflow-hidden border-0 shadow-none transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradients[color]} opacity-40`} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="text-3xl font-black text-slate-900">{value.toLocaleString("vi-VN")}</p>
          </div>
          <div className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradients[color]} shadow-lg`}>
            <Icon className="size-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminPage() {
  await requireAdmin();
  const [series, episodes, categories, users, audits] = await Promise.all([
    db.series.count(),
    db.episode.count(),
    db.category.count(),
    db.user.count(),
    db.adminAuditLog.count()
  ]);

  const stats: Array<{ label: string; value: number; icon: React.ComponentType<React.ComponentProps<"svg">>; color: "indigo" | "cyan" | "emerald" | "amber" | "rose" }> = [
    { label: "Truyện", value: series, icon: BookOpen, color: "indigo" },
    { label: "Tập", value: episodes, icon: Headphones, color: "cyan" },
    { label: "Thể loại", value: categories, icon: Tags, color: "emerald" },
    { label: "Người dùng", value: users, icon: Users, color: "amber" },
    { label: "Nhật ký", value: audits, icon: ScrollText, color: "rose" }
  ];

  return (
    <section className="space-y-4">
      <div className="admin-panel rounded-2xl p-5">
        <h2 className="text-3xl font-black text-slate-900">Tổng quan hệ thống</h2>
        <p className="admin-subtle mt-2 text-sm">Theo dõi nhanh nội dung, người dùng và nhật ký quản trị.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="admin-panel flex flex-wrap gap-3 rounded-2xl p-5">
        <Button asChild><Link href="/admin/truyen/new"><Plus className="size-4" /> Thêm truyện mới</Link></Button>
        <Button asChild variant="secondary"><Link href="/admin/tap"><ListMusic className="size-4" /> Quản lý tập</Link></Button>
        <Button asChild variant="secondary"><Link href="/admin/the-loai"><FolderOpen className="size-4" /> Quản lý thể loại</Link></Button>
        <Button asChild variant="secondary"><Link href="/admin/nguoi-dung"><UserCog className="size-4" /> Quản lý người dùng</Link></Button>
        <Button asChild variant="secondary"><Link href="/admin/audit"><FileText className="size-4" /> Xem nhật ký</Link></Button>
      </div>
    </section>
  );
}
