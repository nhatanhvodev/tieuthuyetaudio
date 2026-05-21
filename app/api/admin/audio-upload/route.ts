import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/webm"
]);

function normalizeExt(fileName: string, mimeType: string) {
  const extFromName = path.extname(fileName).toLowerCase();
  if (extFromName) return extFromName;

  if (mimeType.includes("mpeg")) return ".mp3";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return ".m4a";
  if (mimeType.includes("aac")) return ".aac";
  if (mimeType.includes("ogg")) return ".ogg";
  if (mimeType.includes("wav")) return ".wav";
  if (mimeType.includes("flac")) return ".flac";
  if (mimeType.includes("webm")) return ".webm";
  return ".audio";
}

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Không nhận được file upload." }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "File audio rỗng." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File audio vượt quá 100MB." }, { status: 400 });
  }

  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Định dạng audio không được hỗ trợ." }, { status: 400 });
  }

  const ext = normalizeExt(file.name, file.type);
  const safeName = `${Date.now()}-${randomUUID()}${ext}`;
  const relativeDir = path.join("uploads", "audio");
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
