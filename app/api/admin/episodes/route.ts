import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { episodeInputSchema } from "@/lib/admin/validators";

export async function POST(request: Request) {
  const session = await requireAdmin();
  const parsed = episodeInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tap khong hop le" }, { status: 400 });

  const data = parsed.data;

  try {
    const episode = await db.$transaction(async (tx) => {
      const series = await tx.series.findUnique({
        where: { id: data.seriesId },
        select: { id: true, seriesType: true }
      });
      if (!series) throw new Error("SERIES_NOT_FOUND");

      if (series.seriesType === "ONE_SHOT") {
        const upserted = await tx.episode.upsert({
          where: {
            seriesId_episodeNumber: {
              seriesId: data.seriesId,
              episodeNumber: 1
            }
          },
          update: {
            title: data.title,
            audioUrl: data.audioUrl || null,
            durationSeconds: data.durationSeconds,
            isPremium: data.isPremium
          },
          create: {
            seriesId: data.seriesId,
            episodeNumber: 1,
            title: data.title,
            audioUrl: data.audioUrl || null,
            durationSeconds: data.durationSeconds,
            isPremium: data.isPremium
          }
        });

        await tx.series.update({ where: { id: data.seriesId }, data: { episodeCount: 1 } });
        return upserted;
      }

      const maxEpisodeNumber =
        (
          await tx.episode.findFirst({
            where: { seriesId: data.seriesId },
            orderBy: { episodeNumber: "desc" },
            select: { episodeNumber: true }
          })
        )?.episodeNumber ?? 0;

      const created = await tx.episode.create({
        data: {
          seriesId: data.seriesId,
          episodeNumber: maxEpisodeNumber + 1,
          title: data.title,
          audioUrl: data.audioUrl || null,
          durationSeconds: data.durationSeconds,
          isPremium: data.isPremium
        }
      });

      const count = await tx.episode.count({ where: { seriesId: data.seriesId } });
      await tx.series.update({ where: { id: data.seriesId }, data: { episodeCount: count } });

      return created;
    });

    await createAdminAuditLog({
      actorId: session.user.id,
      action: "episode.upsert",
      targetType: "episode",
      targetId: episode.id,
      payload: {
        seriesId: data.seriesId,
        episodeNumber: episode.episodeNumber,
        isPremium: data.isPremium
      }
    });

    return NextResponse.json(episode);
  } catch (error) {
    if (error instanceof Error && error.message === "SERIES_NOT_FOUND") {
      return NextResponse.json({ error: "Khong tim thay truyen" }, { status: 404 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "So tap bi trung. Vui long thu lai." }, { status: 409 });
    }
    throw error;
  }
}
