import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { initChunkedUpload } from "@/lib/upload/chunked-upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.fileName !== "string" || typeof body.fileSize !== "number") {
    return NextResponse.json({ error: "Thông tin file không hợp lệ." }, { status: 400 });
  }

  const { fileName, mimeType = "", fileSize } = body;

  const result = await initChunkedUpload(fileName, mimeType, fileSize);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
