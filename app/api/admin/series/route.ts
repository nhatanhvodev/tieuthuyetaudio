import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { seriesInputSchema } from "@/lib/admin/validators";

export async function POST(request: Request) {
  const session = await requireAdmin();
  const parsed = seriesInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Truyen khong hop le" }, { status: 400 });

  const data = parsed.data;
  const resolvedStatus = data.seriesType === "ONE_SHOT" ? "COMPLETED" : data.status;
  const existing = await db.series.findUnique({ where: { slug: data.slug } });
  if (existing) return NextResponse.json({ error: "Slug da duoc su dung" }, { status: 409 });

  const series = await db.series.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      producer: data.producer || null,
      status: resolvedStatus,
      seriesType: data.seriesType,
      coverUrl: data.coverUrl || null,
      categories: {
        create: data.categoryIds.map((categoryId) => ({ categoryId }))
      }
    },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  });

  await createAdminAuditLog({
    actorId: session.user.id,
    action: "series.create",
    targetType: "series",
    targetId: series.id,
    payload: {
      title: series.title,
      slug: series.slug,
      status: series.status,
      seriesType: series.seriesType,
      categoryIds: data.categoryIds
    }
  });

  return NextResponse.json(series);
}
