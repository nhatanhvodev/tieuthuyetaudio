import { z } from "zod";

function normalizeNote(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : null;
}

export const bookmarkQuerySchema = z.object({
  episodeId: z.string().trim().min(1)
});

export const bookmarkCreateSchema = z.object({
  episodeId: z.string().trim().min(1),
  second: z.coerce.number().int().min(0),
  note: z.string().max(500).optional().transform(normalizeNote)
});

export const bookmarkDeleteSchema = z.object({
  bookmarkId: z.string().trim().min(1)
});

export const bookmarkUpdateSchema = z.object({
  bookmarkId: z.string().trim().min(1),
  note: z.string().max(500).optional().transform(normalizeNote)
});

export type BookmarkTimelineItem = {
  id: string;
  second: number;
  note: string | null;
  createdAt: string;
};
