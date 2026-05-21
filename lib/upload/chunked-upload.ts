import { mkdir, writeFile, readFile, unlink, rmdir, stat, readdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { CHUNK_SIZE, MAX_FILE_SIZE } from "./constants";
const UPLOAD_TTL_MS = 60 * 60 * 1000; // 1 hour - cleanup stale uploads

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

const ALLOWED_EXTENSIONS = new Set([".mp3", ".m4a", ".aac", ".ogg", ".wav", ".flac", ".webm"]);

export type UploadInitResult = {
  uploadId: string;
  chunkSize: number;
  totalChunks: number;
  fileName: string;
};

export type UploadChunkResult = {
  received: number;
  totalChunks: number;
  completed: boolean;
  url?: string;
};

export type UploadStatus = {
  uploadId: string;
  fileName: string;
  totalChunks: number;
  receivedChunks: number;
  completed: boolean;
  createdAt: number;
};

function getUploadDir(uploadId: string) {
  return path.join(process.cwd(), "public", "uploads", "audio", ".chunks", uploadId);
}

function getChunkPath(uploadId: string, chunkIndex: number) {
  return path.join(getUploadDir(uploadId), `chunk-${chunkIndex.toString().padStart(6, "0")}`);
}

function getMetaPath(uploadId: string) {
  return path.join(getUploadDir(uploadId), "meta.json");
}

function normalizeExt(fileName: string, mimeType: string): string {
  const extFromName = path.extname(fileName).toLowerCase();
  if (extFromName && ALLOWED_EXTENSIONS.has(extFromName)) return extFromName;

  if (mimeType.includes("mpeg")) return ".mp3";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return ".m4a";
  if (mimeType.includes("aac")) return ".aac";
  if (mimeType.includes("ogg")) return ".ogg";
  if (mimeType.includes("wav")) return ".wav";
  if (mimeType.includes("flac")) return ".flac";
  if (mimeType.includes("webm")) return ".webm";
  return ".audio";
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function validateAudioFile(fileName: string, mimeType: string, fileSize: number): string | null {
  if (fileSize <= 0) return "File audio rỗng.";
  if (fileSize > MAX_FILE_SIZE) return `File audio vượt quá giới hạn ${MAX_FILE_SIZE / 1024 / 1024}MB.`;

  const ext = path.extname(fileName).toLowerCase();
  if (ext && !ALLOWED_EXTENSIONS.has(ext)) return "Định dạng audio không được hỗ trợ.";
  if (mimeType && !ALLOWED_TYPES.has(mimeType) && !mimeType.startsWith("audio/"))
    return "Định dạng audio không được hỗ trợ.";

  return null;
}

export async function initChunkedUpload(
  fileName: string,
  mimeType: string,
  fileSize: number
): Promise<{ error: string } | UploadInitResult> {
  const validationError = validateAudioFile(fileName, mimeType, fileSize);
  if (validationError) return { error: validationError };

  const uploadId = randomUUID();
  const ext = normalizeExt(fileName, mimeType);
  const safeName = `${Date.now()}-${randomUUID()}${ext}`;
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

  const uploadDir = getUploadDir(uploadId);
  await mkdir(uploadDir, { recursive: true });

  const meta = {
    fileName: safeName,
    originalName: sanitizeFileName(fileName),
    mimeType,
    fileSize,
    chunkSize: CHUNK_SIZE,
    totalChunks,
    receivedChunks: [] as number[],
    createdAt: Date.now()
  };

  await writeFile(getMetaPath(uploadId), JSON.stringify(meta, null, 2));

  return {
    uploadId,
    chunkSize: CHUNK_SIZE,
    totalChunks,
    fileName: safeName
  };
}

export async function uploadChunk(
  uploadId: string,
  chunkIndex: number,
  chunkData: Buffer
): Promise<{ error: string } | UploadChunkResult> {
  const metaPath = getMetaPath(uploadId);

  let meta: {
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    chunkSize: number;
    totalChunks: number;
    receivedChunks: number[];
    createdAt: number;
  };

  try {
    const raw = await readFile(metaPath, "utf-8");
    meta = JSON.parse(raw);
  } catch {
    return { error: "Upload không tồn tại hoặc đã hết hạn." };
  }

  if (chunkIndex < 0 || chunkIndex >= meta.totalChunks) {
    return { error: "Chunk index không hợp lệ." };
  }

  if (meta.receivedChunks.includes(chunkIndex)) {
    return {
      received: meta.receivedChunks.length,
      totalChunks: meta.totalChunks,
      completed: meta.receivedChunks.length === meta.totalChunks
    };
  }

  const chunkPath = getChunkPath(uploadId, chunkIndex);
  await writeFile(chunkPath, chunkData);

  meta.receivedChunks.push(chunkIndex);
  meta.receivedChunks.sort((a, b) => a - b);
  await writeFile(metaPath, JSON.stringify(meta, null, 2));

  const completed = meta.receivedChunks.length === meta.totalChunks;

  if (completed) {
    const url = await assembleChunks(uploadId, meta);
    return {
      received: meta.receivedChunks.length,
      totalChunks: meta.totalChunks,
      completed: true,
      url
    };
  }

  return {
    received: meta.receivedChunks.length,
    totalChunks: meta.totalChunks,
    completed: false
  };
}

async function assembleChunks(
  uploadId: string,
  meta: { fileName: string; totalChunks: number; mimeType: string }
): Promise<string> {
  const uploadDir = getUploadDir(uploadId);
  const finalDir = path.join(process.cwd(), "public", "uploads", "audio");
  await mkdir(finalDir, { recursive: true });

  const finalPath = path.join(finalDir, meta.fileName);
  const chunks: Buffer[] = [];

  for (let i = 0; i < meta.totalChunks; i++) {
    const chunkPath = getChunkPath(uploadId, i);
    const chunk = await readFile(chunkPath);
    chunks.push(chunk);
  }

  const assembled = Buffer.concat(chunks);
  await writeFile(finalPath, assembled);

  // Cleanup chunks
  for (let i = 0; i < meta.totalChunks; i++) {
    try {
      await unlink(getChunkPath(uploadId, i));
    } catch {
      // ignore cleanup errors
    }
  }
  try {
    await unlink(getMetaPath(uploadId));
    await rmdir(uploadDir);
  } catch {
    // ignore cleanup errors
  }

  return `/uploads/audio/${meta.fileName}`;
}

export async function getUploadStatus(uploadId: string): Promise<UploadStatus | null> {
  try {
    const raw = await readFile(getMetaPath(uploadId), "utf-8");
    const meta = JSON.parse(raw);
    return {
      uploadId,
      fileName: meta.fileName,
      totalChunks: meta.totalChunks,
      receivedChunks: meta.receivedChunks.length,
      completed: false,
      createdAt: meta.createdAt
    };
  } catch {
    return null;
  }
}

export async function cancelUpload(uploadId: string): Promise<boolean> {
  const uploadDir = getUploadDir(uploadId);
  try {
    const files = await readFile(getMetaPath(uploadId), "utf-8").then(JSON.parse).catch(() => null);
    if (files) {
      for (let i = 0; i < files.totalChunks; i++) {
        try {
          await unlink(getChunkPath(uploadId, i));
        } catch {
          // ignore
        }
      }
    }
    await unlink(getMetaPath(uploadId)).catch(() => {});
    await rmdir(uploadDir).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

export async function cleanupStaleUploads(): Promise<number> {
  const chunksBaseDir = path.join(process.cwd(), "public", "uploads", "audio", ".chunks");
  let cleaned = 0;

  try {
    const entries = await readFile(chunksBaseDir, "utf-8").then(() => true).catch(() => false);
    if (!entries) return 0;
  } catch {
    return 0;
  }

  try { await stat(chunksBaseDir); } catch { return 0; }

  let dirs: string[];
  try {
    dirs = await readdir(chunksBaseDir);
  } catch {
    return 0;
  }

  const now = Date.now();
  for (const dir of dirs) {
    const metaPath = path.join(chunksBaseDir, dir, "meta.json");
    try {
      const raw = await readFile(metaPath, "utf-8");
      const meta = JSON.parse(raw);
      if (now - meta.createdAt > UPLOAD_TTL_MS) {
        await cancelUpload(dir);
        cleaned++;
      }
    } catch {
      // If meta is corrupt, try to cleanup
      await cancelUpload(dir).catch(() => {});
      cleaned++;
    }
  }

  return cleaned;
}

