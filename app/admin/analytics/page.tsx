import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendBarChart } from "@/components/admin/analytics-charts";
import { requireAdmin } from "@/lib/auth";
import {
  buildAdminDashboardSnapshot,
  formatAdminNumber,
  formatAdminPercent,
  resolveAdminDateRange
} from "@/lib/admin/dashboard";

export const dynamic = "force-dynamic";

type SearchParams = {
  from?: string;
  to?: string;
};

function rangeQuery(fromInput: string, toInput: string) {
  return `from=${encodeURIComponent(fromInput)}&to=${encodeURIComponent(toInput)}`;
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const range = resolveAdminDateRange(params.from, params.to);
  const snapshot = await buildAdminDashboardSnapshot(range);

  const exportHref = `/api/admin/analytics/export?${rangeQuery(range.fromInput, range.toInput)}`;
  const quick7d = resolveAdminDateRange(
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    new Date().toISOString().slice(0, 10)
  );
  const quick30d = resolveAdminDateRange(
    new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    new Date().toISOString().slice(0, 10)
  );

  return (
    <section className="space-y-4">
      <div className="admin-panel rounded-2xl p-5">
        <h2 className="text-3xl font-black text-slate-900">Phân tích quản trị</h2>
        <p className="admin-subtle mt-1 text-sm">Đo hiệu quả theo khoảng ngày và theo dõi nội dung có tương tác cao nhất.</p>
      </div>

      <div className="admin-panel rounded-2xl p-4">
        <form action="/admin/analytics" className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Từ ngày
            <Input type="date" name="from" defaultValue={range.fromInput} className="w-[180px]" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Đến ngày
            <Input type="date" name="to" defaultValue={range.toInput} className="w-[180px]" />
          </label>
          <Button type="submit" size="sm">Áp dụng</Button>
          <Button asChild type="button" size="sm" variant="secondary">
            <Link href={`/admin/analytics?${rangeQuery(quick7d.fromInput, quick7d.toInput)}`}>7 ngày</Link>
          </Button>
          <Button asChild type="button" size="sm" variant="secondary">
            <Link href={`/admin/analytics?${rangeQuery(quick30d.fromInput, quick30d.toInput)}`}>30 ngày</Link>
          </Button>
          <Button asChild type="button" size="sm" variant="success">
            <Link href={exportHref}>Xuất CSV</Link>
          </Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Người dùng mới" value={formatAdminNumber(snapshot.rangeMetrics.newUsersInRange)} />
        <StatCard label="Người nghe hoạt động" value={formatAdminNumber(snapshot.rangeMetrics.activeUsers)} />
        <StatCard label="Giờ nghe ghi nhận" value={`${formatAdminNumber(snapshot.rangeMetrics.trackedHours)}h`} />
        <StatCard label="Giờ nghe từ sự kiện" value={`${formatAdminNumber(snapshot.rangeMetrics.listeningDeltaHours)}h`} />
        <StatCard label="Tỷ lệ hoàn tất" value={formatAdminPercent(snapshot.rangeMetrics.completionRatePercent)} />
        <StatCard label="Sự kiện analytics" value={formatAdminNumber(snapshot.rangeMetrics.analyticsEvents)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="admin-panel border-0 shadow-none">
          <CardHeader>
            <CardTitle>Xu hướng theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendBarChart data={snapshot.trend.rows} />
          </CardContent>
        </Card>

        <Card className="admin-panel border-0 shadow-none">
          <CardHeader>
            <CardTitle>Tổng quan hệ thống</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <MetricRow label="Tổng người dùng" value={formatAdminNumber(snapshot.totals.totalUsers)} />
            <MetricRow label="Người dùng VIP" value={`${formatAdminNumber(snapshot.totals.vipUsers)} (${formatAdminPercent(snapshot.totals.vipRatePercent)})`} />
            <MetricRow label="Tổng truyện" value={formatAdminNumber(snapshot.totals.seriesCount)} />
            <MetricRow label="Tổng tập" value={formatAdminNumber(snapshot.totals.episodeCount)} />
            <MetricRow label="Đánh giá trong kỳ" value={formatAdminNumber(snapshot.rangeMetrics.reviewsInRange)} />
            <MetricRow label="Theo dõi mới trong kỳ" value={formatAdminNumber(snapshot.rangeMetrics.followsInRange)} />
            <MetricRow label="Bookmark trong kỳ" value={formatAdminNumber(snapshot.rangeMetrics.bookmarksInRange)} />
            <MetricRow label="Giờ nghe TB / người hoạt động" value={`${formatAdminNumber(snapshot.rangeMetrics.averageTrackedHoursPerActiveUser)}h`} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="admin-panel border-0 shadow-none">
          <CardHeader>
            <CardTitle>Top truyện theo tương tác</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Truyện</TableHead>
                    <TableHead>Sự kiện</TableHead>
                    <TableHead>Lượt nghe</TableHead>
                    <TableHead>Số tập</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.topSeries.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-slate-900">{item.title}</TableCell>
                      <TableCell>{formatAdminNumber(item.eventCount)}</TableCell>
                      <TableCell>{formatAdminNumber(item.listenCount)}</TableCell>
                      <TableCell>{formatAdminNumber(item.episodeCount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-panel border-0 shadow-none">
          <CardHeader>
            <CardTitle>Top tập theo tương tác</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tập</TableHead>
                    <TableHead>Truyện</TableHead>
                    <TableHead>Sự kiện</TableHead>
                    <TableHead>Lượt nghe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.topEpisodes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-slate-900">Tập {item.episodeNumber}: {item.title}</TableCell>
                      <TableCell>{item.seriesTitle}</TableCell>
                      <TableCell>{formatAdminNumber(item.eventCount)}</TableCell>
                      <TableCell>{formatAdminNumber(item.listenCount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="admin-panel border-0 shadow-none">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm text-slate-600">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-2xl font-black text-slate-900">{value}</CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <strong className="text-slate-900">{value}</strong>
    </p>
  );
}
