"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/lib/admin/toast-utils";

export function UserVipToggle({ userId, isVip }: { userId: string; isVip: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${userId}/vip`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVip: !isVip })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Không thể cập nhật trạng thái VIP.");
        return;
      }

      toastSuccess(isVip ? "Đã tắt VIP." : "Đã bật VIP.");
      router.refresh();
    });
  }

  return (
    <Button type="button" size="sm" variant={isVip ? "secondary" : "success"} disabled={isPending} onClick={toggle}>
      {isPending ? "Đang cập nhật..." : isVip ? "Tắt VIP" : "Bật VIP"}
    </Button>
  );
}
