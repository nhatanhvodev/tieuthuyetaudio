import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/admin/audit";
import { deleteClerkUsersByEmail } from "@/lib/clerk-admin";
import { db } from "@/lib/db";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "Khong the xoa tai khoan admin hien tai." }, { status: 400 });
  }

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true }
  });
  if (!target) return NextResponse.json({ error: "Khong tim thay nguoi dung" }, { status: 404 });

  if (target.role === "ADMIN") {
    const adminCount = await db.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Khong the xoa admin cuoi cung." }, { status: 400 });
    }
  }

  await db.user.delete({ where: { id } });

  let deletedClerkAccounts = 0;
  try {
    deletedClerkAccounts = await deleteClerkUsersByEmail(target.email);
  } catch {
    deletedClerkAccounts = 0;
  }

  await createAdminAuditLog({
    actorId: session.user.id,
    action: "user.delete",
    targetType: "user",
    targetId: target.id,
    payload: {
      email: target.email,
      role: target.role,
      deletedClerkAccounts
    }
  });

  return NextResponse.json({ ok: true });
}
