import { PaginationControls } from "@/components/admin/pagination-controls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type SearchParams = {
  q?: string;
  page?: string;
};

function stringifyPayload(value: unknown) {
  if (value == null) return "-";
  try {
    const json = JSON.stringify(value);
    return json.length > 120 ? `${json.slice(0, 120)}...` : json;
  } catch {
    return "[payload không hợp lệ]";
  }
}

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;

  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const where = q
    ? {
        OR: [
          { action: { contains: q, mode: "insensitive" as const } },
          { targetType: { contains: q, mode: "insensitive" as const } },
          { targetId: { contains: q, mode: "insensitive" as const } },
          { actor: { email: { contains: q, mode: "insensitive" as const } } }
        ]
      }
    : undefined;

  const total = await db.adminAuditLog.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const logs = await db.adminAuditLog.findMany({
    where,
    include: {
      actor: {
        select: {
          email: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });

  return (
    <section className="space-y-4">
      <div className="admin-panel rounded-2xl p-5">
        <h2 className="text-3xl font-black text-slate-900">Nhật ký hệ thống</h2>
        <p className="admin-subtle mt-1 text-sm">Theo dõi toàn bộ thao tác quản trị gần nhất.</p>
      </div>

      <div className="admin-panel rounded-2xl p-4">
        <form action="/admin/audit" className="flex flex-wrap items-center gap-2">
          <Input name="q" defaultValue={q} placeholder="Tìm theo hành động, đối tượng, người dùng..." className="max-w-md" />
          <Button type="submit" size="sm">Tìm</Button>
        </form>
      </div>

      <div className="admin-panel overflow-hidden rounded-2xl">
        <Table>
          <TableHeader className="bg-slate-50 text-slate-600">
            <TableRow className="hover:bg-transparent">
              <TableHead>Thời gian</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Đối tượng</TableHead>
              <TableHead>Payload</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-50/80">
                <TableCell>{new Date(log.createdAt).toLocaleString("vi-VN")}</TableCell>
                <TableCell>{log.actor?.email ?? "-"}</TableCell>
                <TableCell className="font-medium text-slate-900">{log.action}</TableCell>
                <TableCell>{log.targetType}{log.targetId ? `:${log.targetId}` : ""}</TableCell>
                <TableCell className="max-w-sm truncate" title={stringifyPayload(log.payload)}>{stringifyPayload(log.payload)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls page={safePage} pageCount={pageCount} basePath="/admin/audit" params={{ q }} />
    </section>
  );
}
