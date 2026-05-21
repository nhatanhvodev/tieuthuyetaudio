import { NextResponse } from "next/server";
import { buildAdminDashboardSnapshot, formatAdminNumber, formatAdminPercent, resolveAdminDateRange } from "@/lib/admin/dashboard";
import { requireAdmin } from "@/lib/auth";

function csvCell(value: string | number) {
  const text = String(value ?? "").replaceAll("\r\n", " ").replaceAll("\n", " ").replaceAll("\r", " ");
  const escaped = text.replaceAll("\"", "\"\"");
  return `"${escaped}"`;
}

function csvRow(values: Array<string | number>) {
  return values.map(csvCell).join(",");
}

export async function GET(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const range = resolveAdminDateRange(searchParams.get("from") ?? undefined, searchParams.get("to") ?? undefined);
  const snapshot = await buildAdminDashboardSnapshot(range);

  const lines: string[] = [];
  lines.push(csvRow(["Báo cáo admin", `${range.fromInput} -> ${range.toInput}`]));
  lines.push("");

  lines.push(csvRow(["Chỉ số", "Giá trị"]));
  lines.push(csvRow(["Tổng người dùng", formatAdminNumber(snapshot.totals.totalUsers)]));
  lines.push(csvRow(["Người dùng VIP", `${formatAdminNumber(snapshot.totals.vipUsers)} (${formatAdminPercent(snapshot.totals.vipRatePercent)})`]));
  lines.push(csvRow(["Tổng truyện", formatAdminNumber(snapshot.totals.seriesCount)]));
  lines.push(csvRow(["Tổng tập", formatAdminNumber(snapshot.totals.episodeCount)]));
  lines.push(csvRow(["Người dùng mới", formatAdminNumber(snapshot.rangeMetrics.newUsersInRange)]));
  lines.push(csvRow(["Người nghe hoạt động", formatAdminNumber(snapshot.rangeMetrics.activeUsers)]));
  lines.push(csvRow(["Giờ nghe ghi nhận", `${formatAdminNumber(snapshot.rangeMetrics.trackedHours)}h`]));
  lines.push(csvRow(["Giờ nghe từ sự kiện", `${formatAdminNumber(snapshot.rangeMetrics.listeningDeltaHours)}h`]));
  lines.push(csvRow(["Tỷ lệ hoàn tất", formatAdminPercent(snapshot.rangeMetrics.completionRatePercent)]));
  lines.push(csvRow(["Sự kiện analytics", formatAdminNumber(snapshot.rangeMetrics.analyticsEvents)]));
  lines.push("");

  lines.push(csvRow(["Top truyện", "Sự kiện", "Lượt nghe", "Số tập"]));
  for (const item of snapshot.topSeries) {
    lines.push(csvRow([item.title, item.eventCount, item.listenCount, item.episodeCount]));
  }
  lines.push("");

  lines.push(csvRow(["Top tập", "Truyện", "Sự kiện", "Lượt nghe"]));
  for (const item of snapshot.topEpisodes) {
    lines.push(csvRow([`Tập ${item.episodeNumber}: ${item.title}`, item.seriesTitle, item.eventCount, item.listenCount]));
  }

  const body = `\uFEFF${lines.join("\n")}`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bao-cao-admin-${range.fromInput}-den-${range.toInput}.csv"`
    }
  });
}
