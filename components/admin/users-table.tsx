"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserVipToggle } from "@/components/admin/user-vip-toggle";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toastSuccess, toastError } from "@/lib/admin/toast-utils";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  isVip: boolean;
};

export function UsersTable({ rows }: { rows: UserRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected = useMemo(() => rows.length > 0 && selectedIds.length === rows.length, [rows.length, selectedIds.length]);

  function toggleSelectAll() {
    setSelectedIds((current) => (current.length === rows.length ? [] : rows.map((row) => row.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function bulkAction(action: "enableVip" | "disableVip") {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Không thể xử lý hàng loạt");
        return;
      }

      toastSuccess(action === "enableVip" ? "Đã bật VIP cho người dùng đã chọn." : "Đã tắt VIP cho người dùng đã chọn.");
      setSelectedIds([]);
      router.refresh();
    });
  }

  return (
    <div className="admin-panel overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-700">Đã chọn: {selectedIds.length}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="success" onClick={() => bulkAction("enableVip")} disabled={isPending || selectedIds.length === 0}>
            Bật VIP
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => bulkAction("disableVip")} disabled={isPending || selectedIds.length === 0}>
            Tắt VIP
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-slate-50 text-slate-600">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Chọn tất cả" />
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Gói</TableHead>
            <TableHead className="text-right">Thao tác VIP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((user) => (
            <TableRow key={user.id} className="hover:bg-slate-50/80">
              <TableCell>
                <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggleOne(user.id)} aria-label={`Chọn ${user.email}`} />
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.name ?? "-"}</TableCell>
              <TableCell>{user.role === "ADMIN" ? "ADMIN" : "USER"}</TableCell>
              <TableCell>{user.isVip ? "VIP" : "Miễn phí"}</TableCell>
              <TableCell className="text-right">
                <div className="inline-flex">
                  <UserVipToggle userId={user.id} isVip={user.isVip} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
