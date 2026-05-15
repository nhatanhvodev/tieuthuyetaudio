import { describe, expect, it } from "vitest";
import { seriesInputSchema } from "@/lib/admin/validators";
import { seriesFilterSchema } from "@/lib/series/validators";

describe("series validators", () => {
  it("normalizes empty filters", () => {
    expect(seriesFilterSchema.parse({})).toEqual({ sort: "newest" });
  });

  it("rejects invalid admin series input", () => {
    expect(() => seriesInputSchema.parse({ title: "", slug: "bad slug", status: "ONGOING" })).toThrow();
  });
});
