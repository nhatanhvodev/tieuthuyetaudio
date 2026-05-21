import { db } from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;

type DateRange = {
  from: Date;
  to: Date;
  fromInput: string;
  toInput: string;
};

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
}

function endOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);
}

function formatDateInput(value: Date) {
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateInput(value?: string) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function asPercent(numerator: number, denominator: number) {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export function resolveAdminDateRange(from?: string, to?: string): DateRange {
  const today = new Date();
  const defaultTo = endOfDay(today);
  const defaultFrom = startOfDay(new Date(defaultTo.getTime() - 29 * DAY_MS));

  const parsedFrom = parseDateInput(from);
  const parsedTo = parseDateInput(to);

  const normalizedFrom = startOfDay(parsedFrom ?? defaultFrom);
  const normalizedTo = endOfDay(parsedTo ?? defaultTo);

  if (normalizedFrom <= normalizedTo) {
    return {
      from: normalizedFrom,
      to: normalizedTo,
      fromInput: formatDateInput(normalizedFrom),
      toInput: formatDateInput(normalizedTo)
    };
  }

  return {
    from: defaultFrom,
    to: defaultTo,
    fromInput: formatDateInput(defaultFrom),
    toInput: formatDateInput(defaultTo)
  };
}

export async function buildAdminDashboardSnapshot(range: DateRange) {
  const whereRange = { gte: range.from, lte: range.to };
  const daysInRange = Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime() + 1) / DAY_MS));

  const [
    totalUsers,
    vipUsers,
    seriesCount,
    episodeCount,
    newUsersInRange,
    reviewsInRange,
    followsInRange,
    bookmarksInRange,
    activeRows,
    progressAgg,
    completedProgressCount,
    analyticsAgg,
    topSeriesRows,
    topEpisodeRows
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isVip: true } }),
    db.series.count(),
    db.episode.count(),
    db.user.count({ where: { createdAt: whereRange } }),
    db.review.count({ where: { createdAt: whereRange } }),
    db.follow.count({ where: { createdAt: whereRange } }),
    db.bookmark.count({ where: { createdAt: whereRange } }),
    db.listenProgress.findMany({ where: { updatedAt: whereRange }, distinct: ["userId"], select: { userId: true } }),
    db.listenProgress.aggregate({ where: { updatedAt: whereRange }, _sum: { currentSeconds: true }, _count: { id: true } }),
    db.listenProgress.count({ where: { updatedAt: whereRange, completed: true } }),
    db.analyticsEvent.aggregate({ where: { occurredAt: whereRange }, _sum: { listeningDeltaSeconds: true }, _count: { id: true } }),
    db.analyticsEvent.groupBy({
      by: ["seriesId"],
      where: { occurredAt: whereRange, seriesId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8
    }),
    db.analyticsEvent.groupBy({
      by: ["episodeId"],
      where: { occurredAt: whereRange, episodeId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8
    })
  ]);

  const seriesIds = topSeriesRows.map((item) => item.seriesId).filter((value): value is string => Boolean(value));
  const episodeIds = topEpisodeRows.map((item) => item.episodeId).filter((value): value is string => Boolean(value));

  const [seriesRows, episodeRows] = await Promise.all([
    seriesIds.length
      ? db.series.findMany({
          where: { id: { in: seriesIds } },
          select: { id: true, title: true, listenCount: true, episodeCount: true }
        })
      : Promise.resolve([]),
    episodeIds.length
      ? db.episode.findMany({
          where: { id: { in: episodeIds } },
          select: { id: true, title: true, episodeNumber: true, listenCount: true, series: { select: { title: true } } }
        })
      : Promise.resolve([])
  ]);

  const seriesMap = new Map(seriesRows.map((item) => [item.id, item]));
  const episodeMap = new Map(episodeRows.map((item) => [item.id, item]));

  const topSeries = topSeriesRows
    .map((item) => {
      if (!item.seriesId) return null;
      const series = seriesMap.get(item.seriesId);
      if (!series) return null;
      return {
        id: series.id,
        title: series.title,
        eventCount: item._count.id ?? 0,
        listenCount: series.listenCount,
        episodeCount: series.episodeCount
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const topEpisodes = topEpisodeRows
    .map((item) => {
      if (!item.episodeId) return null;
      const episode = episodeMap.get(item.episodeId);
      if (!episode) return null;
      return {
        id: episode.id,
        title: episode.title,
        episodeNumber: episode.episodeNumber,
        seriesTitle: episode.series.title,
        eventCount: item._count.id ?? 0,
        listenCount: episode.listenCount
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const trendDays = Math.min(14, Math.max(7, daysInRange));
  const trendStart = startOfDay(new Date(range.to.getTime() - (trendDays - 1) * DAY_MS));
  const buckets = Array.from({ length: trendDays }, (_, index) => {
    const day = new Date(trendStart.getTime() + index * DAY_MS);
    return { start: startOfDay(day), end: endOfDay(day) };
  });

  const trendRows = await Promise.all(
    buckets.map(async (bucket) => {
      const [events, listenerRows] = await Promise.all([
        db.analyticsEvent.count({ where: { occurredAt: { gte: bucket.start, lte: bucket.end } } }),
        db.listenProgress.findMany({
          where: { updatedAt: { gte: bucket.start, lte: bucket.end } },
          distinct: ["userId"],
          select: { userId: true }
        })
      ]);

      return {
        day: formatDateInput(bucket.start),
        events,
        activeListeners: listenerRows.length
      };
    })
  );

  const maxEvents = Math.max(1, ...trendRows.map((item) => item.events));
  const maxListeners = Math.max(1, ...trendRows.map((item) => item.activeListeners));
  const trackedSeconds = progressAgg._sum.currentSeconds ?? 0;
  const trackedHours = Math.round((trackedSeconds / 3600) * 10) / 10;
  const listeningDeltaSeconds = analyticsAgg._sum.listeningDeltaSeconds ?? 0;
  const listeningDeltaHours = Math.round((listeningDeltaSeconds / 3600) * 10) / 10;
  const progressRows = progressAgg._count.id ?? 0;
  const activeUsers = activeRows.length;

  return {
    range,
    totals: {
      totalUsers,
      vipUsers,
      vipRatePercent: asPercent(vipUsers, totalUsers),
      seriesCount,
      episodeCount
    },
    rangeMetrics: {
      daysInRange,
      newUsersInRange,
      reviewsInRange,
      followsInRange,
      bookmarksInRange,
      activeUsers,
      trackedHours,
      listeningDeltaHours,
      progressRows,
      completedProgressCount,
      completionRatePercent: asPercent(completedProgressCount, progressRows),
      averageTrackedHoursPerActiveUser: activeUsers ? Math.round((trackedHours / activeUsers) * 10) / 10 : 0,
      analyticsEvents: analyticsAgg._count.id ?? 0
    },
    trend: {
      rows: trendRows.map((item) => ({
        ...item,
        eventsPercent: Math.round((item.events / maxEvents) * 100),
        listenersPercent: Math.round((item.activeListeners / maxListeners) * 100)
      })),
      maxEvents,
      maxListeners
    },
    topSeries,
    topEpisodes
  };
}

export function formatAdminNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatAdminPercent(value: number | null) {
  if (value === null) return "-";
  return `${value.toFixed(1)}%`;
}
