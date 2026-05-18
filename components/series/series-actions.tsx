"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Play, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SeriesActions({
  seriesId,
  slug,
  firstEpisodeNumber,
  title
}: {
  seriesId: string;
  slug: string;
  firstEpisodeNumber?: number;
  title: string;
}) {
  const [followed, setFollowed] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function follow() {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/follow", {
        method: followed ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId })
      });
      if (!response.ok) {
        setMessage("Cần đăng nhập để theo dõi");
        return;
      }
      setFollowed((value) => !value);
      setMessage(followed ? "Đã bỏ theo dõi" : "Đã theo dõi");
    });
  }

  async function share() {
    const url = `${window.location.origin}/truyen/${slug}`;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(url).catch(() => undefined);
    setMessage("Đã sao chép liên kết");
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <Button asChild>
        <Link href={`/truyen/${slug}/tap/${firstEpisodeNumber ?? 1}`}>
          <Play data-icon="inline-start" />
          Nghe thử
        </Link>
      </Button>
      <Button type="button" variant="secondary" onClick={follow} disabled={isPending}>
        {followed ? <Check data-icon="inline-start" /> : null}
        {followed ? "Đang theo dõi" : "Theo dõi"}
      </Button>
      <Button type="button" variant="outline" onClick={share}>
        <Share2 data-icon="inline-start" />
        Chia sẻ
      </Button>
      {message ? <p className="basis-full text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
