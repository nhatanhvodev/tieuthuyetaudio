import { NextResponse } from "next/server";
import { z } from "zod";
import { safeAuth, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const postSchema = z.object({
  topic: z.enum(["Thảo luận", "Đề xuất", "Hỏi đáp", "Báo lỗi"]),
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(5000)
});

const topics = ["Thảo luận", "Đề xuất", "Hỏi đáp", "Báo lỗi"] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic");
  const validTopic = topics.includes(topic as (typeof topics)[number]) ? topic : null;

  const posts = await db.communityPost.findMany({
    where: validTopic ? { topic: validTopic } : undefined,
    include: {
      user: { select: { id: true, name: true, isVip: true } }
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 50
  });

  const session = await safeAuth();
  const userId = session?.user?.id;

  let likedPostIds: Set<string> = new Set();
  if (userId && posts.length > 0) {
    const likes = await db.communityPostLike.findMany({
      where: { userId, postId: { in: posts.map((p) => p.id) } },
      select: { postId: true }
    });
    likedPostIds = new Set(likes.map((l) => l.postId));
  }

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      topic: p.topic,
      title: p.title,
      content: p.content,
      isPinned: p.isPinned,
      likes: p.likes,
      comments: p.comments,
      author: p.user.name ?? "Người dùng ẩn danh",
      authorVip: p.user.isVip,
      isLiked: likedPostIds.has(p.id),
      createdAt: p.createdAt.toISOString()
    }))
  });
}

export async function POST(request: Request) {
  const session = await safeAuth();
  if (!session?.user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nội dung không hợp lệ" }, { status: 400 });

  const post = await db.communityPost.create({
    data: {
      userId: session.user.id,
      topic: parsed.data.topic,
      title: parsed.data.title,
      content: parsed.data.content
    },
    include: {
      user: { select: { name: true, isVip: true } }
    }
  });

  return NextResponse.json({
    id: post.id,
    topic: post.topic,
    title: post.title,
    content: post.content,
    isPinned: post.isPinned,
    likes: post.likes,
    comments: post.comments,
    author: post.user.name ?? "Người dùng ẩn danh",
    authorVip: post.user.isVip,
    isLiked: false,
    createdAt: post.createdAt.toISOString()
  }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("id");
  if (!postId) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.isPinned !== "boolean") {
    return NextResponse.json({ error: "isPinned là bắt buộc" }, { status: 400 });
  }

  await db.communityPost.update({ where: { id: postId }, data: { isPinned: body.isPinned } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("id");
  if (!postId) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

  await db.communityPost.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true });
}
