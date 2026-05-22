import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { seriesInputSchema } from "@/lib/admin/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;

  const parsed = seriesInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Truyen khong hop le" }, { status: 400 });
  const data = parsed.data;
  const resolvedStatus = data.seriesType === "ONE_SHOT" ? "COMPLETED" : data.status;

  const current = await db.series.findUnique({
    where: { id },
    select: { id: true, episodeCount: true }
  });
  if (!current) return NextResponse.json({ error: "Khong tim thay truyen" }, { status: 404 });

  if (data.seriesType === "ONE_SHOT" && current.episodeCount > 1) {
    return NextResponse.json(
      { error: "Truyen tap ngan chi duoc co 1 tap. Hay xoa bot tap truoc khi doi loai." },
      { status: 400 }
    );
  }

  const series = await db.$transaction(async (tx) => {
    if (data.seriesType === "ONE_SHOT") {
      const firstEpisode = await tx.episode.findFirst({
        where: { seriesId: id },
        orderBy: { episodeNumber: "asc" },
        select: { id: true }
      });

      if (firstEpisode) {
        await tx.episode.update({
          where: { id: firstEpisode.id },
          data: { episodeNumber: 1 }
        });
      }
    }

    await tx.series.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        producer: data.producer || null,
        status: resolvedStatus,
        seriesType: data.seriesType,
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
      status: resolvedStatus,
      seriesType: data.seriesType,
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
