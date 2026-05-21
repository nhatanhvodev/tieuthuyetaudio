"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toastSuccess, toastError } from "@/lib/admin/toast-utils";

type EpisodeRow = {
  id: string;
  seriesTitle: string;
  episodeNumber: number;
  title: string;
  isPremium: boolean;
  audioUrl: string | null;
};

export function EpisodesTable({ rows }: { rows: EpisodeRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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

  function bulkAction(action: "markPremium" | "unmarkPremium") {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      const response = await fetch("/api/admin/episodes/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Không thể xử lý hàng loạt");
        return;
      }
      toastSuccess(action === "markPremium" ? "Đã đánh dấu premium." : "Đã bỏ premium.");
      setSelectedIds([]);
      router.refresh();
    });
  }

  async function confirmBulkDelete() {
    if (selectedIds.length === 0) return;
    setDeleteLoading(true);
    try {
      const response = await fetch("/api/admin/episodes/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action: "delete" })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Không thể xóa hàng loạt");
        return;
      }
      toastSuccess(`Đã xóa ${selectedIds.length} tập.`);
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
      const response = await fetch(`/api/admin/episodes/${singleDeleteId}`, { method: "DELETE" });
      if (!response.ok) {
        toastError("Không thể xóa tập");
        return;
      }
      toastSuccess(`Đã xóa tập "${singleDeleteTitle}".`);
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
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => bulkAction("markPremium")} disabled={isPending || selectedIds.length === 0}>Đánh dấu premium</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => bulkAction("unmarkPremium")} disabled={isPending || selectedIds.length === 0}>Bỏ premium</Button>
            <Button type="button" size="sm" variant="error" onClick={() => setBulkDeleteOpen(true)} disabled={isPending || selectedIds.length === 0}>Xóa mục đã chọn</Button>
          </div>
        </div>
        <Table>
          <TableHeader className="bg-slate-50 text-slate-600">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Chọn tất cả" />
              </TableHead>
              <TableHead>Truyện</TableHead>
              <TableHead>Tập</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Gói</TableHead>
              <TableHead>URL audio</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((episode) => (
              <TableRow key={episode.id} className="hover:bg-slate-50/80">
                <TableCell>
                  <input type="checkbox" checked={selectedIds.includes(episode.id)} onChange={() => toggleOne(episode.id)} aria-label={`Chọn ${episode.title}`} />
                </TableCell>
                <TableCell>{episode.seriesTitle}</TableCell>
                <TableCell>{episode.episodeNumber}</TableCell>
                <TableCell className="font-medium text-slate-900">{episode.title}</TableCell>
                <TableCell>{episode.isPremium ? "Premium" : "Mở"}</TableCell>
                <TableCell className="max-w-xs truncate">{episode.audioUrl}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/admin/tap/${episode.id}/edit`}>Sửa</Link>
                    </Button>
                    <Button type="button" size="sm" variant="error" onClick={() => { setSingleDeleteId(episode.id); setSingleDeleteTitle(episode.title); }} disabled={isPending}>Xóa</Button>
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
        title={`Xóa ${selectedIds.length} tập đã chọn?`}
        description="Hành động này không thể hoàn tác."
        confirmLabel="Xóa tất cả"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmBulkDelete}
      />

      <ConfirmDialog
        open={singleDeleteId !== null}
        onOpenChange={(open) => { if (!open) setSingleDeleteId(null); }}
        title={`Xóa tập "${singleDeleteTitle}"?`}
        description="Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmSingleDelete}
      />
    </>
  );
}
