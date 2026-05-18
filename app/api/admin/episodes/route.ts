import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { episodeInputSchema } from "@/lib/admin/validators";

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = episodeInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tap khong hop le" }, { status: 400 });
  const data = parsed.data;
  const episode = await db.episode.upsert({
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

  const count = await db.episode.count({ where: { seriesId: data.seriesId } });
  await db.series.update({ where: { id: data.seriesId }, data: { episodeCount: count } });
  return NextResponse.json(episode);
}
