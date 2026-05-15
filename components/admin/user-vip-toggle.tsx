"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UserVipToggle({ userId, isVip }: { userId: string; isVip: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await fetch(`/api/admin/users/${userId}/vip`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVip: !isVip })
      });
      router.refresh();
    });
  }

  return (
    <Button type="button" size="sm" variant={isVip ? "secondary" : "default"} disabled={isPending} onClick={toggle}>
      {isVip ? "Go VIP" : "Bat VIP"}
    </Button>
  );
}
