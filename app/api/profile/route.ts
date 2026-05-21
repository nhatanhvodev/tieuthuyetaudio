import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().email().optional()
});

export async function PATCH(request: Request) {
  const session = await requireUser();

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { name, email } = parsed.data;
  if (!name && !email) {
    return NextResponse.json({ error: "Không có trường nào để cập nhật" }, { status: 400 });
  }

  if (email && email !== session.user.email) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 409 });
    }
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(name ? { name } : {}),
      ...(email ? { email } : {})
    },
    select: { id: true, email: true, name: true, image: true, role: true, isVip: true }
  });

  return NextResponse.json({ ok: true, user: updated });
}
