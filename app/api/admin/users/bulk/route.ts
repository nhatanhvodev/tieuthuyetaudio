import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";

const usersBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(["enableVip", "disableVip", "setAdmin", "setUser"])
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  const parsed = usersBulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const ids = Array.from(new Set(parsed.data.ids));

  if (parsed.data.action === "setUser" && ids.includes(session.user.id)) {
    return NextResponse.json({ error: "Không thể hạ quyền chính mình" }, { status: 400 });
  }

  if (parsed.data.action === "enableVip" || parsed.data.action === "disableVip") {
    const isVip = parsed.data.action === "enableVip";
    const updated = await db.user.updateMany({
      where: { id: { in: ids } },
      data: { isVip }
    });

    await createAdminAuditLog({
      actorId: session.user.id,
      action: `user.bulk.${parsed.data.action}`,
      targetType: "user",
      payload: { ids, affected: updated.count }
    });

    return NextResponse.json({ ok: true, affected: updated.count });
  }

  if (parsed.data.action === "setAdmin" || parsed.data.action === "setUser") {
    const role = parsed.data.action === "setAdmin" ? "ADMIN" : "USER";
    const updated = await db.user.updateMany({
      where: { id: { in: ids } },
      data: { role }
    });

    await createAdminAuditLog({
      actorId: session.user.id,
      action: `user.bulk.${parsed.data.action}`,
      targetType: "user",
      payload: { ids, affected: updated.count, role }
    });

    return NextResponse.json({ ok: true, affected: updated.count });
  }

  return NextResponse.json({ error: "Hành động không được hỗ trợ" }, { status: 400 });
}
