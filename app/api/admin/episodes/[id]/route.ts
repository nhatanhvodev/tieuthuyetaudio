import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { episodeInputSchema } from "@/lib/admin/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;

  const parsed = episodeInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tập không hợp lệ" }, { status: 400 });
  const data = parsed.data;

  const updated = await db.$transaction(async (tx) => {
    const previous = await tx.episode.findUnique({
      where: { id },
      select: { id: true, seriesId: true }
    });
    if (!previous) return null;

    const episode = await tx.episode.update({
      where: { id },
      data: {
        seriesId: data.seriesId,
        episodeNumber: data.episodeNumber,
        title: data.title,
        audioUrl: data.audioUrl || null,
        durationSeconds: data.durationSeconds,
        isPremium: data.isPremium
      }
    });

    const affectedSeriesIds = Array.from(new Set([previous.seriesId, data.seriesId]));
    for (const seriesId of affectedSeriesIds) {
      const count = await tx.episode.count({ where: { seriesId } });
      await tx.series.update({ where: { id: seriesId }, data: { episodeCount: count } });
    }

    return episode;
  });

  if (!updated) return NextResponse.json({ error: "Không tìm thấy tập" }, { status: 404 });

  await createAdminAuditLog({
    actorId: session.user.id,
    action: "episode.update",
    targetType: "episode",
    targetId: id,
    payload: {
      seriesId: data.seriesId,
      episodeNumber: data.episodeNumber,
      isPremium: data.isPremium
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;

  const deleted = await db.$transaction(async (tx) => {
    const episode = await tx.episode.findUnique({
      where: { id },
      select: { id: true, seriesId: true }
    });
    if (!episode) return null;

    await tx.episode.delete({ where: { id } });
    const count = await tx.episode.count({ where: { seriesId: episode.seriesId } });
    await tx.series.update({ where: { id: episode.seriesId }, data: { episodeCount: count } });

    return episode;
  });

  if (!deleted) return NextResponse.json({ error: "Không tìm thấy tập" }, { status: 404 });

  await createAdminAuditLog({
    actorId: session.user.id,
    action: "episode.delete",
    targetType: "episode",
    targetId: id,
    payload: { seriesId: deleted.seriesId }
  });

  return NextResponse.json({ ok: true });
}
