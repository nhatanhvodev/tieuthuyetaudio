import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { roleToggleSchema } from "@/lib/admin/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;

  const parsed = roleToggleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vai trò không hợp lệ" }, { status: 400 });

  if (session.user.id === id && parsed.data.role !== "ADMIN") {
    return NextResponse.json({ error: "Không thể hạ quyền chính mình" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });

  const user = await db.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, role: true }
  });

  await createAdminAuditLog({
    actorId: session.user.id,
    action: "user.role.update",
    targetType: "user",
    targetId: user.id,
    payload: { role: user.role }
  });

  return NextResponse.json(user);
}
