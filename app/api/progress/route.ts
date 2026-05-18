import { NextResponse } from "next/server";
import { z } from "zod";
import { analyticsPayloadSchema } from "@/lib/analytics/events";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const progressSchema = analyticsPayloadSchema.extend({
  completed: z.boolean().default(false)
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Tien trinh khong hop le" }, { status: 400 });

  const payload = parsed.data;
  const completionPercent =
    payload.durationSeconds && payload.durationSeconds > 0
      ? Math.min(100, Math.round((payload.currentSeconds / payload.durationSeconds) * 1000) / 10)
      : payload.completionPercent ?? null;

  const shouldMarkCompleted = Boolean(payload.completed || (completionPercent !== null && completionPercent >= 99));
  const episode = await db.episode.findUnique({
    where: { id: payload.episodeId },
    select: { seriesId: true }
  });

  await db.listenProgress.upsert({
    where: {
      userId_episodeId: {
        userId: session.user.id,
        episodeId: payload.episodeId
      }
    },
    update: {
      currentSeconds: payload.currentSeconds,
      ...(shouldMarkCompleted ? { completed: true } : {})
    },
    create: {
      userId: session.user.id,
      episodeId: payload.episodeId,
      currentSeconds: payload.currentSeconds,
      completed: shouldMarkCompleted
    }
  });

  await db.analyticsEvent.create({
    data: {
      userId: session.user.id,
      seriesId: payload.seriesId ?? episode?.seriesId ?? null,
      episodeId: payload.episodeId,
      nextEpisodeId: payload.nextEpisodeId ?? null,
      eventName: payload.eventName ?? "progress_update",
      source: payload.source,
      sessionId: payload.sessionId ?? null,
      currentSeconds: payload.currentSeconds,
      durationSeconds: payload.durationSeconds ?? null,
      completed: shouldMarkCompleted,
      completionPercent,
      listeningDeltaSeconds: payload.listeningDeltaSeconds ?? null,
      nextEpisodeNumber: payload.nextEpisodeNumber ?? null,
      autoPlayEnabled: payload.autoPlayEnabled ?? null,
      occurredAt: payload.occurredAt ? new Date(payload.occurredAt) : new Date()
    }
  });

  return NextResponse.json({
    ok: true,
    metric: {
      eventName: payload.eventName ?? "progress_update",
      occurredAt: payload.occurredAt ?? new Date().toISOString(),
      source: payload.source,
      sessionId: payload.sessionId ?? null,
      episodeId: payload.episodeId,
      seriesId: payload.seriesId ?? episode?.seriesId ?? null,
      seriesSlug: payload.seriesSlug ?? null,
      episodeNumber: payload.episodeNumber ?? null,
      currentSeconds: payload.currentSeconds,
      durationSeconds: payload.durationSeconds ?? null,
      completed: shouldMarkCompleted,
      completionPercent,
      listeningDeltaSeconds: payload.listeningDeltaSeconds ?? null,
      nextEpisodeId: payload.nextEpisodeId ?? null,
      nextEpisodeNumber: payload.nextEpisodeNumber ?? null,
      autoPlayEnabled: payload.autoPlayEnabled ?? null
    }
  });
}
