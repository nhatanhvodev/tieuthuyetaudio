import { NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await safeAuth();
  if (!session?.user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id: postId } = await params;

  const existing = await db.communityPostLike.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } }
  });

  if (existing) {
    await db.$transaction([
      db.communityPostLike.delete({ where: { id: existing.id } }),
      db.communityPost.update({ where: { id: postId }, data: { likes: { decrement: 1 } } })
    ]);
    return NextResponse.json({ liked: false });
  }

  await db.$transaction([
    db.communityPostLike.create({ data: { postId, userId: session.user.id } }),
    db.communityPost.update({ where: { id: postId }, data: { likes: { increment: 1 } } })
  ]);
  return NextResponse.json({ liked: true });
}
