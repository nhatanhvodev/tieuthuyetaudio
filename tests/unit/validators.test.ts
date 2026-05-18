import { describe, expect, it } from "vitest";
import { seriesInputSchema } from "@/lib/admin/validators";
import { bookmarkCreateSchema, bookmarkDeleteSchema, bookmarkQuerySchema, bookmarkUpdateSchema } from "@/lib/bookmarks/validators";
import { seriesFilterSchema } from "@/lib/series/validators";

describe("series validators", () => {
  it("normalizes empty filters", () => {
    expect(seriesFilterSchema.parse({})).toEqual({ sort: "newest" });
  });

  it("rejects invalid admin series input", () => {
    expect(() => seriesInputSchema.parse({ title: "", slug: "bad slug", status: "ONGOING" })).toThrow();
  });
});

describe("bookmark validators", () => {
  it("normalizes note text for bookmark creation", () => {
    expect(bookmarkCreateSchema.parse({ episodeId: "episode-1", second: 42, note: "  doan cao trao  " })).toEqual({
      episodeId: "episode-1",
      second: 42,
      note: "doan cao trao"
    });

    expect(bookmarkCreateSchema.parse({ episodeId: "episode-1", second: 18, note: "   " })).toEqual({
      episodeId: "episode-1",
      second: 18,
      note: null
    });
  });

  it("rejects invalid bookmark payloads", () => {
    expect(bookmarkCreateSchema.safeParse({ episodeId: "", second: 12 }).success).toBe(false);
    expect(bookmarkCreateSchema.safeParse({ episodeId: "episode-1", second: -1 }).success).toBe(false);
    expect(bookmarkDeleteSchema.safeParse({ bookmarkId: "" }).success).toBe(false);
    expect(bookmarkQuerySchema.safeParse({ episodeId: "" }).success).toBe(false);
  });

  it("normalizes bookmark note updates", () => {
    expect(bookmarkUpdateSchema.parse({ bookmarkId: "bookmark-1", note: "  can nghe lai  " })).toEqual({
      bookmarkId: "bookmark-1",
      note: "can nghe lai"
    });

    expect(bookmarkUpdateSchema.parse({ bookmarkId: "bookmark-1", note: "   " })).toEqual({
      bookmarkId: "bookmark-1",
      note: null
    });
  });
});
