import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif"
]);

function extFromMime(mimeType: string) {
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/avif") return ".avif";
  if (mimeType === "image/gif") return ".gif";
  return "";
}

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Không nhận được file ảnh bìa." }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "File ảnh bìa rỗng." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Ảnh bìa vượt quá 15MB." }, { status: 400 });
  }

  const lowerName = file.name.toLowerCase();
  if (file.type === "image/svg+xml" || lowerName.endsWith(".svg")) {
    return NextResponse.json({ error: "Không hỗ trợ ảnh SVG cho ảnh bìa." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Định dạng ảnh không được hỗ trợ." }, { status: 400 });
  }

  const ext = extFromMime(file.type) || path.extname(file.name).toLowerCase() || ".jpg";
  const safeName = `${Date.now()}-${randomUUID()}${ext}`;
  const relativeDir = path.join("uploads", "covers");
  const relativePath = path.join(relativeDir, safeName);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  await mkdir(absoluteDir, { recursive: true });
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(absolutePath, Buffer.from(arrayBuffer));

  return NextResponse.json({
    ok: true,
    fileName: safeName,
    size: file.size,
    type: file.type,
    url: `/${relativePath.replaceAll("\\", "/")}`
  });
}
