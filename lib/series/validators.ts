import { z } from "zod";

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  }, schema.optional());

const optionalBoolean = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
}, z.boolean().optional());

export const seriesFilterSchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(["ONGOING", "COMPLETED"]).optional(),
  sort: z.enum(["newest", "popular", "rating"]).default("newest"),
  minEpisodes: optionalNumber(z.coerce.number().int().min(1).max(5000)),
  maxEpisodes: optionalNumber(z.coerce.number().int().min(1).max(5000)),
  minRating: optionalNumber(z.coerce.number().min(0).max(5)),
  hasAudio: optionalBoolean,
  sortByCompletion: z.enum(["completed-first", "ongoing-first"]).optional()
}).superRefine((value, ctx) => {
  if (value.minEpisodes !== undefined && value.maxEpisodes !== undefined && value.minEpisodes > value.maxEpisodes) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maxEpisodes"],
      message: "maxEpisodes phải lớn hơn hoặc bằng minEpisodes"
    });
  }
});

export type SeriesFilters = z.infer<typeof seriesFilterSchema>;
