import { describe, expect, it } from "vitest";
import {
  buildRecommendationSignals,
  rankSeriesForRecommendation,
  type RecommendationCandidate,
  type RecommendationInteraction
} from "@/lib/series/recommendations";

const candidates: RecommendationCandidate[] = [
  {
    id: "series-a",
    slug: "series-a",
    title: "Series A",
    categorySlugs: ["ngon-tinh", "do-thi"],
    createdAt: new Date("2026-05-17T00:00:00.000Z"),
    averageRating: 4.6,
    listenCount: 7000
  },
  {
    id: "series-b",
    slug: "series-b",
    title: "Series B",
    categorySlugs: ["kiem-hiep"],
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    averageRating: 4.8,
    listenCount: 22000
  },
  {
    id: "series-c",
    slug: "series-c",
    title: "Series C",
    categorySlugs: ["ngon-tinh"],
    createdAt: new Date("2026-05-18T00:00:00.000Z"),
    averageRating: 4.5,
    listenCount: 4200
  }
];

describe("recommendation ranking", () => {
  it("prioritizes categories reinforced by follows, completion and recency", () => {
    const interactions: RecommendationInteraction[] = [
      {
        type: "follow",
        seriesId: "followed-1",
        categorySlugs: ["ngon-tinh", "do-thi"],
        occurredAt: new Date("2026-05-18T09:00:00.000Z")
      },
      {
        type: "progress",
        seriesId: "finished-1",
        categorySlugs: ["ngon-tinh"],
        occurredAt: new Date("2026-05-18T08:00:00.000Z"),
        completed: true,
        completionPercent: 100
      }
    ];

    const signals = buildRecommendationSignals(interactions, new Date("2026-05-18T10:00:00.000Z"));
    const ranked = rankSeriesForRecommendation(candidates, signals).map((item) => item.series.id);

    expect(ranked.slice(0, 2)).toEqual(["series-a", "series-c"]);
    expect(ranked.at(-1)).toBe("series-b");
  });

  it("filters out already followed series ids from the final ranking", () => {
    const interactions: RecommendationInteraction[] = [
      {
        type: "follow",
        seriesId: "series-a",
        categorySlugs: ["ngon-tinh"],
        occurredAt: new Date("2026-05-18T09:00:00.000Z")
      }
    ];

    const signals = buildRecommendationSignals(interactions, new Date("2026-05-18T10:00:00.000Z"));
    const ranked = rankSeriesForRecommendation(candidates, signals);

    expect(ranked.map((item) => item.series.id)).not.toContain("series-a");
  });
});
