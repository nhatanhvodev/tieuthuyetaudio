import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { SeriesFilters } from "@/lib/series/validators";

export const seriesInclude = {
  categories: {
    include: {
      category: true
    }
  },
  episodes: {
    orderBy: {
      episodeNumber: "asc"
    }
  }
} satisfies Prisma.SeriesInclude;

export type SeriesWithRelations = Prisma.SeriesGetPayload<{ include: typeof seriesInclude }>;

export const seriesDetailInclude = {
  ...seriesInclude,
  reviews: {
    include: {
      user: {
        select: {
          name: true,
          email: true,
          isVip: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  }
} satisfies Prisma.SeriesInclude;

export type SeriesDetailWithRelations = Prisma.SeriesGetPayload<{ include: typeof seriesDetailInclude }>;

export type ContinueListeningItem = {
  progressId: string;
  currentSeconds: number;
  durationSeconds: number;
  percentCompleted: number;
  updatedAt: Date;
  episode: {
    id: string;
    episodeNumber: number;
    title: string;
  };
  series: {
    id: string;
    slug: string;
    title: string;
    coverUrl: string | null;
  };
};

export function buildSeriesWhere(filters: SeriesFilters): Prisma.SeriesWhereInput {
  const episodeCountFilter: Prisma.IntFilter = {};
  if (filters.minEpisodes !== undefined) {
    episodeCountFilter.gte = filters.minEpisodes;
  }
  if (filters.maxEpisodes !== undefined) {
    episodeCountFilter.lte = filters.maxEpisodes;
  }

  return {
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { producer: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.category
      ? {
          categories: {
            some: {
              category: {
                slug: filters.category
              }
            }
          }
        }
      : {}),
    ...(Object.keys(episodeCountFilter).length > 0 ? { episodeCount: episodeCountFilter } : {}),
    ...(filters.minRating !== undefined ? { averageRating: { gte: filters.minRating } } : {}),
    ...(filters.hasAudio === true
      ? {
          episodes: {
            some: {
              audioUrl: {
                not: null
              }
            }
          }
        }
      : {})
  };
}

export function buildSeriesOrderBy(
  sort: SeriesFilters["sort"],
  sortByCompletion?: SeriesFilters["sortByCompletion"]
): Prisma.SeriesOrderByWithRelationInput[] {
  const orderBy: Prisma.SeriesOrderByWithRelationInput[] = [];

  if (sortByCompletion === "completed-first") {
    orderBy.push({ status: "desc" });
  } else if (sortByCompletion === "ongoing-first") {
    orderBy.push({ status: "asc" });
  }

  if (sort === "popular") {
    orderBy.push({ listenCount: "desc" });
  } else if (sort === "rating") {
    orderBy.push({ averageRating: "desc" });
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  if (sort !== "newest") {
    orderBy.push({ createdAt: "desc" });
  }
  orderBy.push({ title: "asc" });
  return orderBy;
}

async function getRankedSeriesByRecentProgress(hours: number, take = 8): Promise<SeriesWithRelations[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recentProgresses = await db.listenProgress.findMany({
    where: {
      updatedAt: {
        gte: since
      }
    },
    select: {
      completed: true,
      currentSeconds: true,
      episode: {
        select: {
          seriesId: true
        }
      }
    }
  });

  if (!recentProgresses.length) return [];

  const scores = new Map<string, number>();
  for (const progress of recentProgresses) {
    const base = progress.completed ? 3 : progress.currentSeconds >= 600 ? 2 : 1;
    scores.set(progress.episode.seriesId, (scores.get(progress.episode.seriesId) ?? 0) + base);
  }

  const rankedIds = [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  const series = await db.series.findMany({
    where: {
      id: {
        in: rankedIds
      }
    },
    include: seriesInclude
  });

  const byId = new Map(series.map((item) => [item.id, item]));
  const rankedSeries = rankedIds
    .map((id) => byId.get(id))
    .filter((item): item is SeriesWithRelations => Boolean(item))
    .slice(0, take);

  return rankedSeries;
}

export async function getDiscoveryRankings(take = 8) {
  const [popularFallback, trending24h, trending7d, rising] = await Promise.all([
    db.series.findMany({ include: seriesInclude, orderBy: { listenCount: "desc" }, take }),
    getRankedSeriesByRecentProgress(24, take),
    getRankedSeriesByRecentProgress(24 * 7, take),
    db.series.findMany({
      include: seriesInclude,
      where: {
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: [{ listenCount: "desc" }, { createdAt: "desc" }],
      take
    })
  ]);

  return {
    trending24h: trending24h.length ? trending24h : popularFallback,
    trending7d: trending7d.length ? trending7d : popularFallback,
    rising: rising.length ? rising : popularFallback
  };
}

export async function getHomeShelves() {
  const [latest, popular, recommended, latestEpisodes, categories, discovery] = await Promise.all([
    db.series.findMany({ include: seriesInclude, orderBy: { createdAt: "desc" }, take: 8 }),
    db.series.findMany({ include: seriesInclude, orderBy: { listenCount: "desc" }, take: 8 }),
    db.series.findMany({ include: seriesInclude, orderBy: { averageRating: "desc" }, take: 8 }),
    db.episode.findMany({
      include: {
        series: {
          include: seriesInclude
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    getDiscoveryRankings(8)
  ]);

  return {
    latest,
    popular,
    recommended: discovery.trending7d.length ? discovery.trending7d : recommended,
    latestEpisodes,
    categories,
    trending24h: discovery.trending24h,
    trending7d: discovery.trending7d,
    rising: discovery.rising
  };
}

export async function getContinueListeningByUser(userId: string, take = 8): Promise<ContinueListeningItem[]> {
  const progresses = await db.listenProgress.findMany({
    where: {
      userId,
      currentSeconds: { gt: 0 },
      episode: { audioUrl: { not: null } }
    },
    orderBy: { updatedAt: "desc" },
    take,
    include: {
      episode: {
        select: {
          id: true,
          episodeNumber: true,
          title: true,
          durationSeconds: true,
          series: {
            select: {
              id: true,
              slug: true,
              title: true,
              coverUrl: true
            }
          }
        }
      }
    }
  });

  return progresses.map((item) => {
    const durationSeconds = Math.max(item.episode.durationSeconds ?? 0, 0);
    const percentCompleted = durationSeconds > 0 ? Math.min(100, Math.floor((item.currentSeconds / durationSeconds) * 100)) : 0;

    return {
      progressId: item.id,
      currentSeconds: item.currentSeconds,
      durationSeconds,
      percentCompleted,
      updatedAt: item.updatedAt,
      episode: {
        id: item.episode.id,
        episodeNumber: item.episode.episodeNumber,
        title: item.episode.title
      },
      series: item.episode.series
    };
  });
}

export async function getSeriesList(filters: SeriesFilters) {
  return db.series.findMany({
    where: buildSeriesWhere(filters),
    include: seriesInclude,
    orderBy: buildSeriesOrderBy(filters.sort, filters.sortByCompletion),
    take: 48
  });
}

export async function getSeriesBySlug(slug: string) {
  return db.series.findUnique({
    where: { slug },
    include: seriesDetailInclude
  });
}

export async function getSeriesEpisode(slug: string, episodeNumber: number) {
  return db.episode.findFirst({
    where: {
      episodeNumber,
      series: { slug }
    },
    include: {
      series: {
        include: seriesInclude
      }
    }
  });
}

export async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { series: true }
      }
    }
  });
}

export async function getCategoryWithSeries(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      series: {
        include: {
          series: {
            include: seriesInclude
          }
        }
      }
    }
  });
}
