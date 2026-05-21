import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { seriesInputSchema } from "@/lib/admin/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;

  const parsed = seriesInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Truyện không hợp lệ" }, { status: 400 });
  const data = parsed.data;

  const series = await db.$transaction(async (tx) => {
    await tx.series.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        producer: data.producer || null,
        status: data.status,
        coverUrl: data.coverUrl || null,
        categories: {
          deleteMany: {},
          create: data.categoryIds.map((categoryId) => ({ categoryId }))
        }
      }
    });

    return tx.series.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  });

  await createAdminAuditLog({
    actorId: session.user.id,
    action: "series.update",
    targetType: "series",
    targetId: id,
    payload: {
      title: data.title,
      slug: data.slug,
      status: data.status,
      categoryIds: data.categoryIds
    }
  });

  return NextResponse.json(series);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;

  await db.series.delete({ where: { id } });
  await createAdminAuditLog({
    actorId: session.user.id,
    action: "series.delete",
    targetType: "series",
    targetId: id
  });

  return NextResponse.json({ ok: true });
}
