"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TruyenError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[TruyenError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Lỗi tải truyện</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Không thể tải thông tin truyện. Vui lòng thử lại hoặc quay về kho truyện.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => reset()}>Thử lại</Button>
            <Button variant="secondary" onClick={() => (window.location.href = "/truyen")}>
              Về kho truyện
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
