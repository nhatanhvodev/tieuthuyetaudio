import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif"
]);

function extFromMime(mimeType: string) {
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/avif") return ".avif";
  return "";
}

export async function POST(request: Request) {
  const session = await requireUser();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Không nhận được file ảnh." }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "File ảnh rỗng." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Ảnh vượt quá 5MB." }, { status: 400 });
  }

  if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
    return NextResponse.json({ error: "Không hỗ trợ ảnh SVG." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Định dạng ảnh không được hỗ trợ." }, { status: 400 });
  }

  const ext = extFromMime(file.type) || path.extname(file.name).toLowerCase() || ".jpg";
  const safeName = `${Date.now()}-${randomUUID()}${ext}`;
  const relativeDir = path.join("uploads", "avatars");
  const relativePath = path.join(relativeDir, safeName);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  await mkdir(absoluteDir, { recursive: true });
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(absolutePath, Buffer.from(arrayBuffer));

  const url = `/${relativePath.replaceAll("\\", "/")}`;

  await db.user.update({
    where: { id: session.user.id },
    data: { image: url }
  });

  return NextResponse.json({ ok: true, url });
}
