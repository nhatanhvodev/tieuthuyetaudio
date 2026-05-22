import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().trim().min(2).optional()
});

export async function PATCH(request: Request) {
  const session = await requireUser();

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Du lieu khong hop le" }, { status: 400 });
  }

  const { name } = parsed.data;
  if (!name) {
    return NextResponse.json({ error: "Khong co truong nao de cap nhat" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: { name },
    select: { id: true, email: true, name: true, image: true, role: true, isVip: true }
  });

  return NextResponse.json({ ok: true, user: updated });
}
