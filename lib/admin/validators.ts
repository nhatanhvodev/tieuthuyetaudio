import { z } from "zod";

export const seriesInputSchema = z.object({
  title: z.string().trim().min(2, "Nhập tên truyện"),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang"),
  description: z.string().trim().min(10, "Mô tả cần tối thiểu 10 ký tự").optional().or(z.literal("")),
  producer: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["ONGOING", "COMPLETED"]),
  coverUrl: z.string().url("URL ảnh bìa không hợp lệ").optional().or(z.literal(""))
});

export const episodeInputSchema = z.object({
  seriesId: z.string().min(1, "Chọn truyện"),
  episodeNumber: z.coerce.number().int().positive("Số tập phải lớn hơn 0"),
  title: z.string().trim().min(2, "Nhập tên tập"),
  audioUrl: z.string().url("URL audio không hợp lệ").optional().or(z.literal("")),
  durationSeconds: z.coerce.number().int().positive().optional()
});

export const vipToggleSchema = z.object({
  isVip: z.boolean()
});
