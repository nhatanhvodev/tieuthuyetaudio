import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";

const episodeBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(["delete", "markPremium", "unmarkPremium"])
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  const parsed = episodeBulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const ids = Array.from(new Set(parsed.data.ids));

  if (parsed.data.action === "delete") {
    const episodes = await db.episode.findMany({
      where: { id: { in: ids } },
      select: { id: true, seriesId: true }
    });

    const deleted = await db.episode.deleteMany({ where: { id: { in: ids } } });

    const affectedSeriesIds = Array.from(new Set(episodes.map((item) => item.seriesId)));
    await Promise.all(
      affectedSeriesIds.map(async (seriesId) => {
        const count = await db.episode.count({ where: { seriesId } });
        await db.series.update({ where: { id: seriesId }, data: { episodeCount: count } });
      })
    );

    await createAdminAuditLog({
      actorId: session.user.id,
      action: "episode.bulk.delete",
      targetType: "episode",
      payload: { ids, deletedCount: deleted.count }
    });

    return NextResponse.json({ ok: true, affected: deleted.count });
  }

  if (parsed.data.action === "markPremium" || parsed.data.action === "unmarkPremium") {
    const isPremium = parsed.data.action === "markPremium";
    const updated = await db.episode.updateMany({
      where: { id: { in: ids } },
      data: { isPremium }
    });

    await createAdminAuditLog({
      actorId: session.user.id,
      action: `episode.bulk.${isPremium ? "markPremium" : "unmarkPremium"}`,
      targetType: "episode",
      payload: { ids, affected: updated.count, isPremium }
    });

    return NextResponse.json({ ok: true, affected: updated.count });
  }

  return NextResponse.json({ error: "Hành động không được hỗ trợ" }, { status: 400 });
}
