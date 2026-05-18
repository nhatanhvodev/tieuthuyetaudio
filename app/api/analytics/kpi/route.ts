import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { buildKpiSnapshot } from "@/lib/analytics/kpi";

export async function GET() {
  await requireAdmin();
  const snapshot = await buildKpiSnapshot();
  return NextResponse.json(snapshot);
}
