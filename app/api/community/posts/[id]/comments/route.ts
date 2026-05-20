import { NextResponse } from "next/server";
import { z } from "zod";
import { safeAuth } from "@/lib/auth";
import { db } from "@/lib/db";

const commentSchema = z.object({
  content: z.string().trim().min(1).max(2000)
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;

  const comments = await db.communityComment.findMany({
    where: { postId },
    include: {
      user: { select: { id: true, name: true, isVip: true } }
    },
    orderBy: { createdAt: "asc" },
    take: 100
  });

  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      author: c.user.name ?? "Người dùng ẩn danh",
      authorVip: c.user.isVip,
      authorId: c.user.id,
      createdAt: c.createdAt.toISOString()
    }))
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await safeAuth();
  if (!session?.user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id: postId } = await params;
  const parsed = commentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bình luận không hợp lệ" }, { status: 400 });

  const [comment] = await db.$transaction([
    db.communityComment.create({
      data: {
        postId,
        userId: session.user.id,
        content: parsed.data.content
      },
      include: {
        user: { select: { id: true, name: true, isVip: true } }
      }
    }),
    db.communityPost.update({ where: { id: postId }, data: { comments: { increment: 1 } } })
  ]);

  return NextResponse.json({
    id: comment.id,
    content: comment.content,
    author: comment.user.name ?? "Người dùng ẩn danh",
    authorVip: comment.user.isVip,
    authorId: comment.user.id,
    createdAt: comment.createdAt.toISOString()
  }, { status: 201 });
}
