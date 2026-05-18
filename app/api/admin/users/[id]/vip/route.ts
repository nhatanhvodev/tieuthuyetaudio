import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { vipToggleSchema } from "@/lib/admin/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const parsed = vipToggleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Trạng thái VIP không hợp lệ" }, { status: 400 });
  const user = await db.user.update({
    where: { id },
    data: { isVip: parsed.data.isVip }
  });
  return NextResponse.json({ id: user.id, isVip: user.isVip });
}
