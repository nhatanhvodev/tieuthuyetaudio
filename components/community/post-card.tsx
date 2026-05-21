"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Pin, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type Post = {
  id: string;
  topic: string;
  title: string;
  content: string;
  isPinned: boolean;
  likes: number;
  comments: number;
  author: string;
  authorImage: string | null;
  authorVip: boolean;
  isLiked: boolean;
  createdAt: string;
};

export function PostCard({
  post,
  onToggleComments
}: {
  post: Post;
  onToggleComments: (postId: string) => void;
}) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isPending, startTransition] = useTransition();

  function toggleLike() {
    if (isPending) return;
    startTransition(async () => {
      const wasLiked = liked;
      setLiked(!wasLiked);
      setLikeCount((c) => c + (wasLiked ? -1 : 1));

      const res = await fetch(`/api/community/posts/${post.id}/likes`, { method: "POST" });
      if (!res.ok) {
        setLiked(wasLiked);
        setLikeCount((c) => c + (wasLiked ? 1 : -1));
      }
    });
  }

  const topicColors: Record<string, string> = {
    "Thảo luận": "bg-blue-500/15 text-blue-400",
    "Đề xuất": "bg-emerald-500/15 text-emerald-400",
    "Hỏi đáp": "bg-amber-500/15 text-amber-400",
    "Báo lỗi": "bg-red-500/15 text-red-400"
  };

  return (
    <article className="glass-panel rounded-lg p-4 transition-colors hover:bg-card/60">
      <div className="flex flex-wrap items-center gap-2">
        {post.isPinned ? <Pin aria-hidden="true" className="size-4 text-accent" /> : null}
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${topicColors[post.topic] ?? "bg-secondary text-muted-foreground"}`}>
          {post.topic}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-[10px] font-bold">
            {post.authorImage ? (
              <img src={post.authorImage} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              post.author.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {post.author}
            {post.authorVip ? <span className="ml-1 rounded bg-amber-500/20 px-1 text-[10px] font-bold text-amber-400">VIP</span> : null}
          </span>
        </div>
        <span className="ml-auto text-xs text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
        </span>
      </div>
      <h2 className="mt-3 text-lg font-black">{post.title}</h2>
      <p className="mt-2 whitespace-pre-wrap leading-6 text-muted-foreground">{post.content}</p>
      <div className="mt-4 flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleLike}
          disabled={isPending}
          className={`gap-1.5 text-sm ${liked ? "text-accent" : "text-muted-foreground"}`}
        >
          <ThumbsUp aria-hidden="true" className={`size-4 ${liked ? "fill-current" : ""}`} />
          {likeCount}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onToggleComments(post.id)}
          className="gap-1.5 text-sm text-muted-foreground"
        >
          <MessageCircle aria-hidden="true" className="size-4" />
          {post.comments} bình luận
        </Button>
      </div>
    </article>
  );
}
