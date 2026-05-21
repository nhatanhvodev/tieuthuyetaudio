import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";

const seriesBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(["delete"])
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  const parsed = seriesBulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const ids = Array.from(new Set(parsed.data.ids));
  if (parsed.data.action === "delete") {
    const deleted = await db.series.deleteMany({
      where: { id: { in: ids } }
    });

    await createAdminAuditLog({
      actorId: session.user.id,
      action: "series.bulk.delete",
      targetType: "series",
      payload: { ids, deletedCount: deleted.count }
    });

    return NextResponse.json({ ok: true, affected: deleted.count });
  }

  return NextResponse.json({ error: "Hành động không được hỗ trợ" }, { status: 400 });
}
