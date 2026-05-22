import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getUploadStatus } from "@/lib/upload/chunked-upload";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get("uploadId");

  if (!uploadId) {
    return NextResponse.json({ error: "Thiếu uploadId." }, { status: 400 });
  }

  const status = await getUploadStatus(uploadId);
  if (!status) {
    return NextResponse.json({ error: "Upload không tồn tại hoặc đã hết hạn." }, { status: 404 });
  }

  return NextResponse.json(status);
}
