import { AdminNav } from "@/components/admin/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { buildKpiSnapshot } from "@/lib/analytics/kpi";

export const dynamic = "force-dynamic";

function formatPercent(value: number | null) {
  if (value === null) return "-";
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const snapshot = await buildKpiSnapshot();

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <h1 className="mt-8 text-4xl font-black">Analytics KPI</h1>
        <p className="mt-2 text-sm text-slate-600">Snapshot: {new Date(snapshot.generatedAt).toLocaleString("vi-VN")}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="bg-white text-slate-950">
            <CardHeader>
              <CardTitle>Retention proxy D1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{formatPercent(snapshot.retention.d1.ratePercent)}</p>
              <p className="mt-1 text-xs text-slate-500">{formatNumber(snapshot.retention.d1.retainedUsers)} / {formatNumber(snapshot.retention.d1.cohortUsers)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white text-slate-950">
            <CardHeader>
              <CardTitle>Retention proxy D7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{formatPercent(snapshot.retention.d7.ratePercent)}</p>
              <p className="mt-1 text-xs text-slate-500">{formatNumber(snapshot.retention.d7.retainedUsers)} / {formatNumber(snapshot.retention.d7.cohortUsers)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white text-slate-950">
            <CardHeader>
              <CardTitle>Retention proxy D30</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{formatPercent(snapshot.retention.d30.ratePercent)}</p>
              <p className="mt-1 text-xs text-slate-500">{formatNumber(snapshot.retention.d30.retainedUsers)} / {formatNumber(snapshot.retention.d30.cohortUsers)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white text-slate-950"><CardHeader><CardTitle>Users</CardTitle></CardHeader><CardContent className="text-2xl font-black">{formatNumber(snapshot.users.total)}</CardContent></Card>
          <Card className="bg-white text-slate-950"><CardHeader><CardTitle>VIP users</CardTitle></CardHeader><CardContent className="text-2xl font-black">{formatNumber(snapshot.users.vip)} ({formatPercent(snapshot.users.vipRatePercent)})</CardContent></Card>
          <Card className="bg-white text-slate-950"><CardHeader><CardTitle>Tracked listening</CardTitle></CardHeader><CardContent className="text-2xl font-black">{formatNumber(snapshot.listening.trackedHours)}h</CardContent></Card>
          <Card className="bg-white text-slate-950"><CardHeader><CardTitle>Completion rate</CardTitle></CardHeader><CardContent className="text-2xl font-black">{formatPercent(snapshot.listening.completionRatePercent)}</CardContent></Card>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <p className="font-semibold">Retention note</p>
          <p className="mt-1">{snapshot.retention.note}</p>
        </div>
      </div>
    </section>
  );
}

