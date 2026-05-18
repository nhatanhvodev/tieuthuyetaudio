import { z } from "zod";

export const seriesInputSchema = z.object({
  title: z.string().trim().min(2, "Nhap ten truyen"),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Duong dan chi gom chu thuong, so va dau gach ngang"),
  description: z.string().trim().min(10, "Mo ta can toi thieu 10 ky tu").optional().or(z.literal("")),
  producer: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["ONGOING", "COMPLETED"]),
  coverUrl: z.string().url("URL anh bia khong hop le").optional().or(z.literal(""))
});

export const episodeInputSchema = z.object({
  seriesId: z.string().min(1, "Chon truyen"),
  episodeNumber: z.coerce.number().int().positive("So tap phai lon hon 0"),
  title: z.string().trim().min(2, "Nhap ten tap"),
  audioUrl: z.string().url("URL audio khong hop le").optional().or(z.literal("")),
  durationSeconds: z.coerce.number().int().positive().optional(),
  isPremium: z.boolean().default(false)
});

export const vipToggleSchema = z.object({
  isVip: z.boolean()
});
