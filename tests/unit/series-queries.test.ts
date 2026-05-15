import { describe, expect, it } from "vitest";
import { buildSeriesWhere } from "@/lib/series/queries";

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
});
