"use client";

import { useState } from "react";
import { MessageCircle, Star } from "lucide-react";
import { EpisodeList } from "@/components/series/episode-list";
import { ReviewForm } from "@/components/review/review-form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Episode = {
  id: string;
  episodeNumber: number;
  title: string;
  durationSeconds: number | null;
  listenCount?: number | null;
  isPremium?: boolean;
};

type Review = {
  id: string;
  rating: number;
  content: string | null;
  userName: string;
  isVip: boolean;
};

const tabs = [
  { id: "episodes", label: "Danh sach tap" },
  { id: "reviews", label: "Danh gia" },
  { id: "comments", label: "Thao luan" }
] as const;

type TabId = (typeof tabs)[number]["id"];

export function SeriesDetailTabs({
  slug,
  seriesId,
  coverUrl,
  episodes,
  reviews
}: {
  slug: string;
  seriesId: string;
  coverUrl?: string | null;
  episodes: Episode[];
  reviews: Review[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>("episodes");

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex gap-2 overflow-x-auto rounded-lg border bg-card/80 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "h-10 shrink-0 rounded-md px-4 text-sm font-semibold text-muted-foreground transition",
              activeTab === tab.id && "bg-accent text-accent-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "episodes" ? <EpisodeList slug={slug} episodes={episodes} coverUrl={coverUrl} /> : null}

      {activeTab === "reviews" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-3">
            {reviews.length ? (
              reviews.map((review) => (
                <article key={review.id} className="rounded-lg border bg-card/90 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-black">
                      {review.userName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{review.userName}</p>
                      <div className="flex items-center gap-1 text-accent">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={index} aria-hidden="true" className="size-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    {review.isVip ? <Badge variant="accent">VIP</Badge> : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.content ?? "Nguoi nghe chua de lai noi dung danh gia."}</p>
                </article>
              ))
            ) : (
              <div className="rounded-lg border bg-card/90 p-5 text-muted-foreground">Chua co danh gia nao cho truyen nay.</div>
            )}
          </div>
          <ReviewForm seriesId={seriesId} />
        </div>
      ) : null}

      {activeTab === "comments" ? (
        <div className="grid gap-3">
          {["Tap moi nghe on tren mobile, player khong bi che khi cuon.", "Minh muon them lich ra tap va bo loc truyen da hoan thanh."].map((comment, index) => (
            <article key={comment} className="rounded-lg border bg-card/90 p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-secondary font-black">{index + 1}</div>
                <div>
                  <p className="font-semibold">{index === 0 ? "Ban nghe thuong xuyen" : "Thanh vien moi"}</p>
                  <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageCircle aria-hidden="true" className="size-4" />
                    Thao luan cong dong
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{comment}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
