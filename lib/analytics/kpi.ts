import { db } from "@/lib/db";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysAgo(days: number) {
  return new Date(Date.now() - days * MS_PER_DAY);
}

function percentage(numerator: number, denominator: number) {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export async function buildKpiSnapshot() {
  const since1d = daysAgo(1);
  const since7d = daysAgo(7);
  const since30d = daysAgo(30);

  const [
    totalUsers,
    vipUsers,
    seriesCount,
    episodeCount,
    newUsers1d,
    newUsers7d,
    newUsers30d,
    progressAgg,
    completedProgressCount,
    active1dRows,
    active7dRows,
    active30dRows,
    seriesListenAgg
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isVip: true } }),
    db.series.count(),
    db.episode.count(),
    db.user.count({ where: { createdAt: { gte: since1d } } }),
    db.user.count({ where: { createdAt: { gte: since7d } } }),
    db.user.count({ where: { createdAt: { gte: since30d } } }),
    db.listenProgress.aggregate({ _count: { id: true }, _sum: { currentSeconds: true } }),
    db.listenProgress.count({ where: { completed: true } }),
    db.listenProgress.findMany({ where: { updatedAt: { gte: since1d } }, distinct: ["userId"], select: { userId: true } }),
    db.listenProgress.findMany({ where: { updatedAt: { gte: since7d } }, distinct: ["userId"], select: { userId: true } }),
    db.listenProgress.findMany({ where: { updatedAt: { gte: since30d } }, distinct: ["userId"], select: { userId: true } }),
    db.series.aggregate({ _sum: { listenCount: true } })
  ]);

  const activeUsers1d = active1dRows.length;
  const activeUsers7d = active7dRows.length;
  const activeUsers30d = active30dRows.length;
  const trackedSeconds = progressAgg._sum.currentSeconds ?? 0;
  const progressRows = progressAgg._count.id ?? 0;

  return {
    generatedAt: new Date().toISOString(),
    users: {
      total: totalUsers,
      vip: vipUsers,
      vipRatePercent: percentage(vipUsers, totalUsers),
      newUsers: {
        d1: newUsers1d,
        d7: newUsers7d,
        d30: newUsers30d
      }
    },
    activity: {
      activeListeners: {
        d1: activeUsers1d,
        d7: activeUsers7d,
        d30: activeUsers30d
      }
    },
    retention: {
      note: "Placeholder retention based on active-listener proxy (no dedicated cohort events table in this batch).",
      d1: {
        placeholder: true,
        retainedUsers: activeUsers1d,
        cohortUsers: totalUsers,
        ratePercent: percentage(activeUsers1d, totalUsers)
      },
      d7: {
        placeholder: true,
        retainedUsers: activeUsers7d,
        cohortUsers: totalUsers,
        ratePercent: percentage(activeUsers7d, totalUsers)
      },
      d30: {
        placeholder: true,
        retainedUsers: activeUsers30d,
        cohortUsers: totalUsers,
        ratePercent: percentage(activeUsers30d, totalUsers)
      }
    },
    listening: {
      trackedSeconds,
      trackedHours: Math.round((trackedSeconds / 3600) * 10) / 10,
      progressRows,
      completedProgressRows: completedProgressCount,
      completionRatePercent: percentage(completedProgressCount, progressRows),
      avgTrackedSecondsPerUser: totalUsers ? Math.round(trackedSeconds / totalUsers) : 0
    },
    catalog: {
      seriesCount,
      episodeCount,
      totalSeriesListenCount: seriesListenAgg._sum.listenCount ?? 0
    }
  };
}
