import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { seriesInputSchema } from "@/lib/admin/validators";

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = seriesInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Truyện không hợp lệ" }, { status: 400 });
  const data = parsed.data;
  const series = await db.series.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      producer: data.producer || null,
      status: data.status,
      coverUrl: data.coverUrl || null
    }
  });
  return NextResponse.json(series);
}
