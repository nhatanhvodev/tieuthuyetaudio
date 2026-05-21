import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { categoryInputSchema } from "@/lib/admin/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;
  const parsed = categoryInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Thể loại không hợp lệ" }, { status: 400 });

  const category = await db.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug
    }
  });

  await createAdminAuditLog({
    actorId: session.user.id,
    action: "category.update",
    targetType: "category",
    targetId: category.id,
    payload: { slug: category.slug, name: category.name }
  });

  return NextResponse.json(category);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;

  const linkedCount = await db.seriesCategory.count({ where: { categoryId: id } });
  if (linkedCount > 0) {
    return NextResponse.json({ error: "Thể loại đang được gắn vào truyện" }, { status: 400 });
  }

  await db.category.delete({ where: { id } });
  await createAdminAuditLog({
    actorId: session.user.id,
    action: "category.delete",
    targetType: "category",
    targetId: id
  });

  return NextResponse.json({ ok: true });
}
