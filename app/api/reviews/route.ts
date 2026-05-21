import { NextResponse } from "next/server";
import { z } from "zod";
import { safeAuth } from "@/lib/auth";
import { db } from "@/lib/db";

const reviewSchema = z.object({
  seriesId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  content: z.string().trim().max(1000).optional()
});

export async function POST(request: Request) {
  const session = await safeAuth();
  if (!session?.user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Đánh giá không hợp lệ" }, { status: 400 });

  await db.$transaction(async (tx) => {
    await tx.review.upsert({
      where: { userId_seriesId: { userId: session.user.id, seriesId: parsed.data.seriesId } },
      update: { rating: parsed.data.rating, content: parsed.data.content },
      create: {
        userId: session.user.id,
        seriesId: parsed.data.seriesId,
        rating: parsed.data.rating,
        content: parsed.data.content
      }
    });

    const aggregate = await tx.review.aggregate({
      where: { seriesId: parsed.data.seriesId },
      _avg: { rating: true }
    });
    await tx.series.update({
      where: { id: parsed.data.seriesId },
      data: { averageRating: aggregate._avg.rating ?? parsed.data.rating }
    });
  });

  return NextResponse.json({ ok: true });
}
