import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const progressSchema = z.object({
  episodeId: z.string().min(1),
  currentSeconds: z.number().int().min(0),
  completed: z.boolean().default(false)
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid progress" }, { status: 400 });

  await db.listenProgress.upsert({
    where: {
      userId_episodeId: {
        userId: session.user.id,
        episodeId: parsed.data.episodeId
      }
    },
    update: {
      currentSeconds: parsed.data.currentSeconds,
      completed: parsed.data.completed
    },
    create: {
      userId: session.user.id,
      episodeId: parsed.data.episodeId,
      currentSeconds: parsed.data.currentSeconds,
      completed: parsed.data.completed
    }
  });

  return NextResponse.json({ ok: true });
}
