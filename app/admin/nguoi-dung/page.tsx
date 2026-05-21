import Link from "next/link";
import type { UserRole } from "@prisma/client";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { UsersTable } from "@/components/admin/users-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = {
  q?: string;
  page?: string;
  role?: string;
  vip?: string;
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;

  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const role: "" | UserRole = params.role === "ADMIN" || params.role === "USER" ? params.role : "";
  const vip = params.vip === "vip" || params.vip === "free" ? params.vip : "";

  const where = {
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } }
          ]
        }
      : {}),
    ...(role ? { role } : {}),
    ...(vip === "vip" ? { isVip: true } : {}),
    ...(vip === "free" ? { isVip: false } : {})
  };

  const total = await db.user.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });

  return (
    <section className="space-y-4">
      <div className="admin-panel rounded-2xl p-5">
        <h2 className="text-3xl font-black text-slate-900">Quản lý người dùng</h2>
        <p className="admin-subtle mt-1 text-sm">Theo dõi tài khoản, cấp quyền ADMIN và quản lý gói VIP.</p>
      </div>

      <div className="admin-panel rounded-2xl p-4">
        <form action="/admin/nguoi-dung" className="flex flex-wrap items-center gap-2">
          <Input name="q" defaultValue={q} placeholder="Tìm theo email hoặc tên..." className="max-w-md" />
          <select name="role" defaultValue={role} className="admin-select select select-bordered h-10 text-sm">
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị</option>
            <option value="USER">Người dùng</option>
          </select>
          <select name="vip" defaultValue={vip} className="admin-select select select-bordered h-10 text-sm">
            <option value="">Tất cả gói</option>
            <option value="vip">VIP</option>
            <option value="free">Miễn phí</option>
          </select>
          <Button type="submit" size="sm">Tìm</Button>
          {q || role || vip ? (
            <Button asChild type="button" variant="secondary" size="sm">
              <Link href="/admin/nguoi-dung">Xóa lọc</Link>
            </Button>
          ) : null}
        </form>
      </div>

      <UsersTable
        rows={users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVip: user.isVip
        }))}
      />

      <PaginationControls page={safePage} pageCount={pageCount} basePath="/admin/nguoi-dung" params={{ q, role, vip }} />
    </section>
  );
}
