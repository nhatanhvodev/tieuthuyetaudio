import { describe, expect, it } from "vitest";
import { buildSeriesOrderBy, buildSeriesWhere } from "@/lib/series/queries";

describe("buildSeriesWhere", () => {
  it("builds category and status filters", () => {
    expect(buildSeriesWhere({ category: "ngon-tinh", status: "COMPLETED", sort: "newest" })).toMatchObject({
      status: "COMPLETED",
      categories: {
        some: {
          category: {
            slug: "ngon-tinh"
          }
        }
      }
    });
  });

  it("builds text search across key fields", () => {
    const where = buildSeriesWhere({ q: "kiem", sort: "popular" });
    expect(where.OR).toHaveLength(3);
  });

  it("adds numeric and audio availability filters", () => {
    const where = buildSeriesWhere({
      sort: "rating",
      minEpisodes: 12,
      maxEpisodes: 50,
      minRating: 4.2,
      hasAudio: true
    });

    expect(where).toMatchObject({
      episodeCount: { gte: 12, lte: 50 },
      averageRating: { gte: 4.2 },
      episodes: {
        some: {
          audioUrl: { not: null }
        }
      }
    });
  });
});

describe("buildSeriesOrderBy", () => {
  it("keeps completion-first ordering when requested", () => {
    expect(buildSeriesOrderBy("newest", "completed-first")).toEqual([{ status: "desc" }, { createdAt: "desc" }, { title: "asc" }]);
  });

  it("sorts by selected strategy when completion ordering is missing", () => {
    expect(buildSeriesOrderBy("popular")).toEqual([{ listenCount: "desc" }, { createdAt: "desc" }, { title: "asc" }]);
  });
});
