"use client";

import { useEffect, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Comment = {
  id: string;
  content: string;
  author: string;
  authorImage: string | null;
  authorVip: boolean;
  authorId: string;
  createdAt: string;
};

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/community/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments))
      .finally(() => setLoading(false));
  }, [postId]);

  function submitComment() {
    if (!content.trim()) return;
    setMessage("");
    startTransition(async () => {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Lỗi khi gửi bình luận");
        return;
      }
      setComments((prev) => [...prev, data]);
      setContent("");
    });
  }

  return (
    <div className="mt-3 border-t border-border/40 pt-3">
      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải bình luận...</p>
      ) : comments.length > 0 ? (
        <div className="grid gap-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-muted/60 p-3">
              <div className="flex items-center gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-[10px] font-bold">
                  {c.authorImage ? (
                    <img src={c.authorImage} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    c.author.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm font-semibold">{c.author}</span>
                {c.authorVip ? <span className="rounded bg-amber-500/20 px-1 text-[10px] font-bold text-amber-400">VIP</span> : null}
                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{c.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Chưa có bình luận nào.</p>
      )}

      <div className="mt-3 flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết bình luận..."
          className="min-h-10 flex-1 border-border bg-muted text-sm"
          maxLength={2000}
        />
        <Button
          type="button"
          size="icon"
          disabled={isPending || !content.trim()}
          onClick={submitComment}
          className="h-10 w-10 shrink-0"
        >
          <Send className="size-4" />
        </Button>
      </div>
      {message ? <p className="mt-1 text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
