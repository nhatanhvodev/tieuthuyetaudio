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

export function buildSeriesWhere(filters: SeriesFilters): Prisma.SeriesWhereInput {
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
      : {})
  };
}

function buildOrderBy(sort: SeriesFilters["sort"]): Prisma.SeriesOrderByWithRelationInput {
  if (sort === "popular") return { listenCount: "desc" };
  if (sort === "rating") return { averageRating: "desc" };
  return { createdAt: "desc" };
}

export async function getHomeShelves() {
  const [latest, popular, recommended, categories] = await Promise.all([
    db.series.findMany({ include: seriesInclude, orderBy: { createdAt: "desc" }, take: 8 }),
    db.series.findMany({ include: seriesInclude, orderBy: { listenCount: "desc" }, take: 8 }),
    db.series.findMany({ include: seriesInclude, orderBy: { averageRating: "desc" }, take: 8 }),
    db.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return { latest, popular, recommended, categories };
}

export async function getSeriesList(filters: SeriesFilters) {
  return db.series.findMany({
    where: buildSeriesWhere(filters),
    include: seriesInclude,
    orderBy: buildOrderBy(filters.sort),
    take: 48
  });
}

export async function getSeriesBySlug(slug: string) {
  return db.series.findUnique({
    where: { slug },
    include: seriesInclude
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
