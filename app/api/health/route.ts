import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, database: "connected" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, database: "disconnected", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 503 }
    );
  }
}
