"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { categoryInputSchema } from "@/lib/admin/validators";
import { toastSuccess, toastError } from "@/lib/admin/toast-utils";
import { z } from "zod";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

const formSchema = categoryInputSchema;
type FormData = z.infer<typeof formSchema>;

export function CategoryManager({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingSlug, setEditingSlug] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", slug: "" }
  });

  function createCategory(data: FormData) {
    startTransition(async () => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Không thể tạo thể loại");
        return;
      }

      toastSuccess("Đã thêm thể loại mới.");
      reset();
      router.refresh();
    });
  }

  function startEdit(category: CategoryItem) {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingSlug(category.slug);
  }

  function saveEdit() {
    if (!editingId) return;
    startTransition(async () => {
      const response = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName, slug: editingSlug })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Không thể cập nhật thể loại");
        return;
      }

      toastSuccess("Đã cập nhật thể loại.");
      setEditingId(null);
      setEditingName("");
      setEditingSlug("");
      router.refresh();
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Không thể xóa thể loại");
        return;
      }
      toastSuccess(`Đã xóa thể loại "${deleteTarget.name}".`);
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(createCategory)} className="admin-panel grid gap-3 rounded-2xl p-4 md:grid-cols-[1fr_1fr_auto]">
        <div>
          <Input {...register("name")} placeholder="Tên thể loại" />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <Input {...register("slug")} placeholder="Slug" />
          {errors.slug ? <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p> : null}
        </div>
        <Button type="submit" disabled={isPending}>Thêm</Button>
      </form>

      <div className="admin-panel overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Tên</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const isEditing = editingId === category.id;
              return (
                <tr key={category.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Input value={editingName} onChange={(event) => setEditingName(event.target.value)} className="h-9" />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Input value={editingSlug} onChange={(event) => setEditingSlug(event.target.value)} className="h-9" />
                    ) : (
                      category.slug
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        <>
                          <Button type="button" size="sm" onClick={saveEdit} disabled={isPending}>Lưu</Button>
                          <Button type="button" size="sm" variant="secondary" onClick={() => setEditingId(null)} disabled={isPending}>Hủy</Button>
                        </>
                      ) : (
                        <>
                          <Button type="button" size="sm" variant="secondary" onClick={() => startEdit(category)} disabled={isPending}>Sửa</Button>
                          <Button type="button" size="sm" variant="error" onClick={() => setDeleteTarget(category)} disabled={isPending}>Xóa</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Xóa thể loại "${deleteTarget?.name}"?`}
        description="Hành động này không thể hoàn tác. Các truyện liên kết với thể loại này có thể bị ảnh hưởng."
        confirmLabel="Xóa"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
