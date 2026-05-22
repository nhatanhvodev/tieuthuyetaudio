"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toastSuccess, toastError } from "@/lib/admin/toast-utils";

type SeriesRow = {
  id: string;
  title: string;
  slug: string;
  status: "ONGOING" | "COMPLETED";
  seriesType: "MULTI_EPISODE" | "ONE_SHOT";
  episodeCount: number;
  categories: string[];
};

export function SeriesTable({ rows }: { rows: SeriesRow[] }) {
  const router = useRouter();
  const [isPending] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [singleDeleteTitle, setSingleDeleteTitle] = useState("");
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const allSelected = useMemo(() => rows.length > 0 && selectedIds.length === rows.length, [rows.length, selectedIds.length]);

  function toggleSelectAll() {
    setSelectedIds((current) => (current.length === rows.length ? [] : rows.map((row) => row.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function confirmBulkDelete() {
    if (selectedIds.length === 0) return;
    setDeleteLoading(true);
    try {
      const response = await fetch("/api/admin/series/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action: "delete" })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Không thể xóa hàng loạt");
        return;
      }
      toastSuccess(`Đã xóa ${selectedIds.length} truyện.`);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      router.refresh();
    } finally {
      setDeleteLoading(false);
    }
  }

  async function confirmSingleDelete() {
    if (!singleDeleteId) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/series/${singleDeleteId}`, { method: "DELETE" });
      if (!response.ok) {
        toastError("Không thể xóa truyện");
        return;
      }
      toastSuccess(`Đã xóa truyện "${singleDeleteTitle}".`);
      setSelectedIds((current) => current.filter((item) => item !== singleDeleteId));
      setSingleDeleteId(null);
      router.refresh();
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <div className="admin-panel overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">Đã chọn: {selectedIds.length}</p>
          <Button type="button" size="sm" variant="error" onClick={() => setBulkDeleteOpen(true)} disabled={isPending || selectedIds.length === 0}>
            {isPending ? "Đang xử lý..." : "Xóa mục đã chọn"}
          </Button>
        </div>
        <Table>
          <TableHeader className="bg-slate-50 text-slate-600">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Chọn tất cả" />
              </TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tập</TableHead>
              <TableHead>Thể loại</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50/80">
                <TableCell>
                  <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleOne(item.id)} aria-label={`Chọn ${item.title}`} />
                </TableCell>
                <TableCell className="font-medium text-slate-900">{item.title}</TableCell>
                <TableCell>{item.slug}</TableCell>
                <TableCell>{item.seriesType === "ONE_SHOT" ? "Tập ngắn" : "Nhiều tập"}</TableCell>
                <TableCell>{item.status === "COMPLETED" ? "Hoàn thành" : "Đang cập nhật"}</TableCell>
                <TableCell>{item.episodeCount}</TableCell>
                <TableCell className="max-w-xs">{item.categories.join(", ") || "-"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/admin/truyen/${item.id}/edit`}>Sửa</Link>
                    </Button>
                    <Button type="button" size="sm" variant="error" onClick={() => { setSingleDeleteId(item.id); setSingleDeleteTitle(item.title); }} disabled={isPending}>Xóa</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Xóa ${selectedIds.length} truyện đã chọn?`}
        description="Hành động này không thể hoàn tác. Tất cả tập và dữ liệu liên quan sẽ bị xóa."
        confirmLabel="Xóa tất cả"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmBulkDelete}
      />

      <ConfirmDialog
        open={singleDeleteId !== null}
        onOpenChange={(open) => { if (!open) setSingleDeleteId(null); }}
        title={`Xóa truyện "${singleDeleteTitle}"?`}
        description="Hành động này không thể hoàn tác. Tất cả tập và dữ liệu liên quan sẽ bị xóa."
        confirmLabel="Xóa"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmSingleDelete}
      />
    </>
  );
}
