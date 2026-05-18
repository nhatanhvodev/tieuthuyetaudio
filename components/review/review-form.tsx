"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/review/rating-stars";

export function ReviewForm({ seriesId }: { seriesId: string }) {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId,
          rating,
          content: String(formData.get("content") ?? "")
        })
      });
      setMessage(response.ok ? "Đã lưu đánh giá" : "Cần đăng nhập để đánh giá");
    });
  }

  return (
    <form action={submit} className="flex flex-col gap-3 rounded-lg border bg-card/90 p-4">
      <p className="font-black">Viết đánh giá</p>
      <RatingStars value={rating} onChange={setRating} />
      <Textarea name="content" aria-label="Nội dung đánh giá" placeholder="Cảm nhận của bạn về truyện này" />
      <Button type="submit" disabled={isPending}>{isPending ? "Đang lưu..." : "Gửi đánh giá"}</Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}
