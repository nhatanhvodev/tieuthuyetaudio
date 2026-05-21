"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildPlayerEventPayload, emitAnalyticsPayload } from "@/lib/analytics/events";

type ContextualUpsellProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
  href?: string;
  compact?: boolean;
  tracking?: {
    episodeId: string;
    seriesId?: string;
    seriesSlug: string;
    episodeNumber: number;
  };
};

export function ContextualUpsell({
  title = "Mở khóa trải nghiệm nghe không giới hạn",
  description = "Nâng cấp VIP để mở rộng thư viện, nghe liền mạch và ưu tiên nhận các cập nhật mới nhất.",
  ctaLabel = "Xem quyền lợi VIP",
  href = "/vip",
  compact = false,
  tracking
}: ContextualUpsellProps) {
  function trackUpsellClick() {
    if (!tracking) return;

    emitAnalyticsPayload(
      buildPlayerEventPayload({
        eventName: "upsell_click",
        source: compact ? "episode_sidebar_upsell" : "contextual_upsell",
        episodeId: tracking.episodeId,
        seriesId: tracking.seriesId,
        seriesSlug: tracking.seriesSlug,
        episodeNumber: tracking.episodeNumber,
        currentSeconds: 0,
        durationSeconds: 0,
        completed: false
      })
    );
  }

  return (
    <aside className="rounded-lg border border-accent/40 bg-gradient-to-br from-accent/15 to-card p-4">
      <div className="flex items-center gap-2 text-accent">
        <Crown aria-hidden="true" className="size-4" />
        <Badge variant="accent">Đề xuất VIP</Badge>
      </div>
      <h3 className={`mt-3 font-black ${compact ? "text-lg" : "text-2xl"}`}>{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <Button asChild className="mt-4">
        <Link href={href} onClick={trackUpsellClick}>{ctaLabel}</Link>
      </Button>
    </aside>
  );
}
