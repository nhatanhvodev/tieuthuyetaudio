import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { episodeInputSchema } from "@/lib/admin/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;

  const parsed = episodeInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tap khong hop le" }, { status: 400 });
  const data = parsed.data;

  try {
    const updated = await db.$transaction(async (tx) => {
      const previous = await tx.episode.findUnique({
        where: { id },
        select: { id: true, seriesId: true, episodeNumber: true }
      });
      if (!previous) throw new Error("EPISODE_NOT_FOUND");

      const targetSeries = await tx.series.findUnique({
        where: { id: data.seriesId },
        select: { id: true, seriesType: true }
      });
      if (!targetSeries) throw new Error("SERIES_NOT_FOUND");

      const targetEpisodeNumber =
        targetSeries.seriesType === "ONE_SHOT" ? 1 : data.episodeNumber ?? previous.episodeNumber;

      if (targetSeries.seriesType === "ONE_SHOT") {
        const conflict = await tx.episode.findFirst({
          where: {
            seriesId: data.seriesId,
            episodeNumber: 1,
            NOT: { id }
          },
          select: { id: true }
        });
        if (conflict) throw new Error("ONE_SHOT_ALREADY_HAS_EPISODE");
      }

      const episode = await tx.episode.update({
        where: { id },
        data: {
          seriesId: data.seriesId,
          episodeNumber: targetEpisodeNumber,
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

    await createAdminAuditLog({
      actorId: session.user.id,
      action: "episode.update",
      targetType: "episode",
      targetId: id,
      payload: {
        seriesId: data.seriesId,
        episodeNumber: updated.episodeNumber,
        isPremium: data.isPremium
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "EPISODE_NOT_FOUND") return NextResponse.json({ error: "Khong tim thay tap" }, { status: 404 });
      if (error.message === "SERIES_NOT_FOUND") return NextResponse.json({ error: "Khong tim thay truyen" }, { status: 404 });
      if (error.message === "ONE_SHOT_ALREADY_HAS_EPISODE") {
        return NextResponse.json({ error: "Truyen tap ngan chi duoc co 1 tap." }, { status: 400 });
      }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "So tap bi trung." }, { status: 409 });
    }
    throw error;
  }
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

  if (!deleted) return NextResponse.json({ error: "Khong tim thay tap" }, { status: 404 });

  await createAdminAuditLog({
    actorId: session.user.id,
    action: "episode.delete",
    targetType: "episode",
    targetId: id,
    payload: { seriesId: deleted.seriesId }
  });

  return NextResponse.json({ ok: true });
}
