"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Lỗi trang quản trị</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Có lỗi không mong đợi xảy ra trong trang quản trị. Vui lòng thử lại.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => reset()}>Thử lại</Button>
            <Button variant="secondary" onClick={() => (window.location.href = "/admin")}>
              Về trang quản trị
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
