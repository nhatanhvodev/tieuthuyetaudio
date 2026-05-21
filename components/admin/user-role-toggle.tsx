"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/lib/admin/toast-utils";

export function UserRoleToggle({ userId, role }: { userId: string; role: "USER" | "ADMIN" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleRole() {
    const nextRole = role === "ADMIN" ? "USER" : "ADMIN";

    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Không thể cập nhật quyền quản trị.");
        return;
      }

      toastSuccess(nextRole === "ADMIN" ? "Đã cấp quyền ADMIN." : "Đã gỡ quyền ADMIN.");
      router.refresh();
    });
  }

  const isAdmin = role === "ADMIN";

  return (
    <Button type="button" size="sm" variant={isAdmin ? "secondary" : "warning"} disabled={isPending} onClick={toggleRole}>
      {isPending ? "Đang cập nhật..." : isAdmin ? "Gỡ quyền ADMIN" : "Cấp quyền ADMIN"}
    </Button>
  );
}
