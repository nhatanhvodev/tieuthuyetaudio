"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { UserVipToggle } from "@/components/admin/user-vip-toggle";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toastError, toastSuccess } from "@/lib/admin/toast-utils";

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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetEmail, setDeleteTargetEmail] = useState("");

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
        toastError(payload?.error ?? "Khong the xu ly hang loat");
        return;
      }

      toastSuccess(action === "enableVip" ? "Da bat VIP cho nguoi dung da chon." : "Da tat VIP cho nguoi dung da chon.");
      setSelectedIds([]);
      router.refresh();
    });
  }

  async function confirmDeleteUser() {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${deleteTargetId}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Khong the xoa nguoi dung");
        return;
      }

      toastSuccess(`Da xoa nguoi dung ${deleteTargetEmail}.`);
      setSelectedIds((current) => current.filter((id) => id !== deleteTargetId));
      setDeleteTargetId(null);
      setDeleteTargetEmail("");
      router.refresh();
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <div className="admin-panel overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-700">Da chon: {selectedIds.length}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="success" onClick={() => bulkAction("enableVip")} disabled={isPending || selectedIds.length === 0}>
              Bat VIP
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => bulkAction("disableVip")} disabled={isPending || selectedIds.length === 0}>
              Tat VIP
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50 text-slate-600">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Chon tat ca" />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ten</TableHead>
              <TableHead>Vai tro</TableHead>
              <TableHead>Goi</TableHead>
              <TableHead className="text-right">Thao tac VIP</TableHead>
              <TableHead className="text-right">Xoa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50/80">
                <TableCell>
                  <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggleOne(user.id)} aria-label={`Chon ${user.email}`} />
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name ?? "-"}</TableCell>
                <TableCell>{user.role === "ADMIN" ? "ADMIN" : "USER"}</TableCell>
                <TableCell>{user.isVip ? "VIP" : "Mien phi"}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex">
                    <UserVipToggle userId={user.id} isVip={user.isVip} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="error"
                    onClick={() => {
                      setDeleteTargetId(user.id);
                      setDeleteTargetEmail(user.email);
                    }}
                  >
                    Xoa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetId(null);
            setDeleteTargetEmail("");
          }
        }}
        title={`Xoa nguoi dung ${deleteTargetEmail}?`}
        description="Hanh dong nay khong the hoan tac."
        confirmLabel="Xoa nguoi dung"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDeleteUser}
      />
    </>
  );
}
