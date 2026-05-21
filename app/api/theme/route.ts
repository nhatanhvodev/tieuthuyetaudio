import { NextResponse } from "next/server";
import { z } from "zod";
import { safeAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { THEME_OPTIONS } from "@/lib/theme/themes";

const themeSchema = z.object({
  theme: z.enum(THEME_OPTIONS)
});

export async function GET() {
  const session = await safeAuth();
  if (!session?.user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { themePreference: true }
  });
  if (!user) return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });

  return NextResponse.json({ theme: user.themePreference });
}

export async function PUT(request: Request) {
  const session = await safeAuth();
  if (!session?.user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const parsed = themeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Theme không hợp lệ" }, { status: 400 });

  const user = await db.user.update({
    where: { id: session.user.id },
    data: { themePreference: parsed.data.theme },
    select: { id: true, themePreference: true }
  });

  return NextResponse.json({ ok: true, theme: user.themePreference });
}
