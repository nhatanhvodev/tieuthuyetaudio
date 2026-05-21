import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { episodeInputSchema } from "@/lib/admin/validators";

export async function POST(request: Request) {
  const session = await requireAdmin();
  const parsed = episodeInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tập không hợp lệ" }, { status: 400 });

  const data = parsed.data;
  const episode = await db.$transaction(async (tx) => {
    const ep = await tx.episode.upsert({
      where: {
        seriesId_episodeNumber: {
          seriesId: data.seriesId,
          episodeNumber: data.episodeNumber
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
        episodeNumber: data.episodeNumber,
        title: data.title,
        audioUrl: data.audioUrl || null,
        durationSeconds: data.durationSeconds,
        isPremium: data.isPremium
      }
    });

    const count = await tx.episode.count({ where: { seriesId: data.seriesId } });
    await tx.series.update({ where: { id: data.seriesId }, data: { episodeCount: count } });

    return ep;
  });

  await createAdminAuditLog({
    actorId: session.user.id,
    action: "episode.upsert",
    targetType: "episode",
    targetId: episode.id,
    payload: {
      seriesId: data.seriesId,
      episodeNumber: data.episodeNumber,
      isPremium: data.isPremium
    }
  });

  return NextResponse.json(episode);
}
