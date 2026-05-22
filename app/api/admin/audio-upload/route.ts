import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { uploadBufferToSupabaseStorage } from "@/lib/supabase/storage-admin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const AUDIO_BUCKET = process.env.SUPABASE_STORAGE_AUDIO_BUCKET ?? "audio";
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
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

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

  const arrayBuffer = await file.arrayBuffer();
  const ext = normalizeExt(file.name, file.type);
  const safeName = `${Date.now()}-${randomUUID()}${ext}`;
  const objectPath = path.posix.join("episodes", safeName);
  let url: string;
  try {
    const uploaded = await uploadBufferToSupabaseStorage({
      bucket: AUDIO_BUCKET,
      objectPath,
      body: arrayBuffer,
      contentType: file.type || "audio/mpeg",
      cacheControl: "31536000",
      upsert: false
    });
    url = uploaded.publicUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload audio lên Supabase thất bại.";
    if (!message.toLowerCase().includes("maximum allowed size")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    // Dev fallback: save to local public storage if Supabase rejects large object size.
    const localDir = path.join(process.cwd(), "public", "uploads", "audio", "episodes");
    await mkdir(localDir, { recursive: true });
    const localAbsolutePath = path.join(localDir, safeName);
    await writeFile(localAbsolutePath, Buffer.from(arrayBuffer));
    url = `/uploads/audio/episodes/${safeName}`;
  }

  return NextResponse.json({
    ok: true,
    fileName: safeName,
    size: file.size,
    type: file.type,
    url
  });
}
