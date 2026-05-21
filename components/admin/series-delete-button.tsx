"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toastSuccess, toastError } from "@/lib/admin/toast-utils";

export function SeriesDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending] = useTransition();
  const [open, setOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function onConfirm() {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/series/${id}`, { method: "DELETE" });
      if (!response.ok) {
        toastError("Không thể xóa truyện.");
        return;
      }
      toastSuccess(`Đã xóa truyện "${title}".`);
      setOpen(false);
      router.refresh();
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <Button type="button" size="sm" variant="error" disabled={isPending} onClick={() => setOpen(true)}>
        {isPending ? "Đang xóa..." : "Xóa"}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Xóa truyện "${title}"?`}
        description="Hành động này không thể hoàn tác. Tất cả tập và dữ liệu liên quan sẽ bị xóa."
        confirmLabel="Xóa"
        variant="danger"
        loading={deleteLoading}
        onConfirm={onConfirm}
      />
    </>
  );
}
