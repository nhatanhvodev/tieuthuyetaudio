import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { categoryInputSchema } from "@/lib/admin/validators";

export async function GET() {
  await requireAdmin();
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  const parsed = categoryInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Thể loại không hợp lệ" }, { status: 400 });

  const category = await db.category.create({
    data: { name: parsed.data.name, slug: parsed.data.slug }
  });

  await createAdminAuditLog({
    actorId: session.user.id,
    action: "category.create",
    targetType: "category",
    targetId: category.id,
    payload: { slug: category.slug, name: category.name }
  });

  return NextResponse.json(category);
}
