import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { cancelUpload } from "@/lib/upload/chunked-upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json().catch(() => null);
  if (!body || typeof body.uploadId !== "string") {
    return NextResponse.json({ error: "Thiếu uploadId." }, { status: 400 });
  }

  const success = await cancelUpload(body.uploadId);
  if (!success) {
    return NextResponse.json({ error: "Không thể hủy upload." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
