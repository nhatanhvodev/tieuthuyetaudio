import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bookmarkCreateSchema, bookmarkDeleteSchema, bookmarkQuerySchema, bookmarkUpdateSchema, type BookmarkTimelineItem } from "@/lib/bookmarks/validators";
import { db } from "@/lib/db";

function serializeBookmark(bookmark: { id: string; second: number; note: string | null; createdAt: Date }) : BookmarkTimelineItem {
  return {
    id: bookmark.id,
    second: bookmark.second,
    note: bookmark.note,
    createdAt: bookmark.createdAt.toISOString()
  };
}

async function requireSessionUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export async function GET(request: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parsed = bookmarkQuerySchema.safeParse({
    episodeId: searchParams.get("episodeId")
  });
  if (!parsed.success) return NextResponse.json({ error: "Tap truyen khong hop le" }, { status: 400 });

  const bookmarks = await db.bookmark.findMany({
    where: {
      userId: user.id,
      episodeId: parsed.data.episodeId
    },
    orderBy: [{ second: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      second: true,
      note: true,
      createdAt: true
    }
  });

  return NextResponse.json({
    bookmarks: bookmarks.map(serializeBookmark)
  });
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });

  const parsed = bookmarkCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Moc nghe khong hop le" }, { status: 400 });

  const episode = await db.episode.findUnique({
    where: { id: parsed.data.episodeId },
    select: { id: true }
  });
  if (!episode) return NextResponse.json({ error: "Khong tim thay tap truyen" }, { status: 404 });

  const bookmark = await db.bookmark.create({
    data: {
      userId: user.id,
      episodeId: parsed.data.episodeId,
      second: parsed.data.second,
      note: parsed.data.note
    },
    select: {
      id: true,
      second: true,
      note: true,
      createdAt: true
    }
  });

  return NextResponse.json({
    ok: true,
    bookmark: serializeBookmark(bookmark)
  });
}

export async function DELETE(request: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });

  const parsed = bookmarkDeleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Moc nghe khong hop le" }, { status: 400 });

  const deleted = await db.bookmark.deleteMany({
    where: {
      id: parsed.data.bookmarkId,
      userId: user.id
    }
  });

  if (!deleted.count) return NextResponse.json({ error: "Khong tim thay moc nghe" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });

  const parsed = bookmarkUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Noi dung ghi chu khong hop le" }, { status: 400 });

  const bookmark = await db.bookmark.findFirst({
    where: {
      id: parsed.data.bookmarkId,
      userId: user.id
    },
    select: {
      id: true,
      second: true,
      note: true,
      createdAt: true
    }
  });

  if (!bookmark) return NextResponse.json({ error: "Khong tim thay moc nghe" }, { status: 404 });

  const updated = await db.bookmark.update({
    where: { id: bookmark.id },
    data: {
      note: parsed.data.note
    },
    select: {
      id: true,
      second: true,
      note: true,
      createdAt: true
    }
  });

  return NextResponse.json({
    ok: true,
    bookmark: serializeBookmark(updated)
  });
}
