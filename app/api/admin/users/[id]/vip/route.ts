import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { vipToggleSchema } from "@/lib/admin/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;
  const parsed = vipToggleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Trạng thái VIP không hợp lệ" }, { status: 400 });

  const existing = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });

  const user = await db.user.update({
    where: { id },
    data: { isVip: parsed.data.isVip }
  });

  await createAdminAuditLog({
    actorId: session.user.id,
    action: "user.vip.update",
    targetType: "user",
    targetId: user.id,
    payload: { isVip: user.isVip }
  });

  return NextResponse.json({ id: user.id, isVip: user.isVip });
}
