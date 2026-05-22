import { z } from "zod";

const pathOrUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) return true;
      if (value.startsWith("/")) return true;
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Đường dẫn không hợp lệ" }
  );

export const seriesInputSchema = z.object({
  title: z.string().trim().min(2, "Nhap ten truyen"),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Duong dan chi gom chu thuong, so va dau gach ngang"),
  description: z.string().trim().min(10, "Mo ta can toi thieu 10 ky tu").optional().or(z.literal("")),
  producer: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["ONGOING", "COMPLETED"]),
  seriesType: z.enum(["MULTI_EPISODE", "ONE_SHOT"]).default("MULTI_EPISODE"),
  coverUrl: pathOrUrlSchema.optional().or(z.literal("")),
  categoryIds: z.array(z.string().min(1)).default([])
});

export const episodeInputSchema = z.object({
  seriesId: z.string().min(1, "Chon truyen"),
  episodeNumber: z.coerce.number().int().positive("So tap phai lon hon 0").optional(),
  title: z.string().trim().min(2, "Nhap ten tap"),
  audioUrl: pathOrUrlSchema.optional().or(z.literal("")),
  durationSeconds: z.coerce.number().int().positive().optional(),
  isPremium: z.boolean().default(false)
});

export const vipToggleSchema = z.object({
  isVip: z.boolean()
});

export const roleToggleSchema = z.object({
  role: z.enum(["USER", "ADMIN"])
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Nhap ten the loai"),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Duong dan chi gom chu thuong, so va dau gach ngang")
});
