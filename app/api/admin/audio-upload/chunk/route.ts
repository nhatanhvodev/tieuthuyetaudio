import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadChunk } from "@/lib/upload/chunked-upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const uploadId = formData.get("uploadId");
  const chunkIndex = formData.get("chunkIndex");
  const chunk = formData.get("chunk");

  if (typeof uploadId !== "string" || !uploadId) {
    return NextResponse.json({ error: "Thiếu uploadId." }, { status: 400 });
  }

  const index = Number(chunkIndex);
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "Chunk index không hợp lệ." }, { status: 400 });
  }

  if (!(chunk instanceof File)) {
    return NextResponse.json({ error: "Không nhận được chunk." }, { status: 400 });
  }

  const arrayBuffer = await chunk.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await uploadChunk(uploadId, index, buffer);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
