import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const followSchema = z.object({ seriesId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = followSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid series" }, { status: 400 });

  await db.follow.upsert({
    where: { userId_seriesId: { userId: session.user.id, seriesId: parsed.data.seriesId } },
    update: {},
    create: { userId: session.user.id, seriesId: parsed.data.seriesId }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = followSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid series" }, { status: 400 });

  await db.follow.deleteMany({
    where: { userId: session.user.id, seriesId: parsed.data.seriesId }
  });

  return NextResponse.json({ ok: true });
}
