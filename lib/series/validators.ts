import { z } from "zod";

export const seriesFilterSchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(["ONGOING", "COMPLETED"]).optional(),
  sort: z.enum(["newest", "popular", "rating"]).default("newest")
});

export type SeriesFilters = z.infer<typeof seriesFilterSchema>;
