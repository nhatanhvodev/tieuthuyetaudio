"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

const topics = ["Thảo luận", "Đề xuất", "Hỏi đáp", "Báo lỗi"];

export function PostForm({ onCreated }: { onCreated: (post: Post) => void }) {
  const [topic, setTopic] = useState("Thảo luận");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    setMessage("");
    startTransition(async () => {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, title, content })
      });
      if (!res.ok) {
        setMessage("Vui lòng đăng nhập để gửi bài");
        return;
      }
      const post: Post = await res.json();
      setTitle("");
      setContent("");
      setTopic("Thảo luận");
      onCreated(post);
    });
  }

  return (
    <div className="glass-panel rounded-lg p-4 md:p-5">
      <p className="text-lg font-black">Gửi góp ý</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            className={`inline-flex h-9 shrink-0 items-center rounded-md border px-3 text-sm font-semibold transition-colors ${
              topic === t ? "border-accent bg-accent/15 text-accent" : "border-border bg-secondary text-muted-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề bài viết"
        className="mt-3 border-border bg-muted"
        maxLength={200}
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Nội dung góp ý của bạn..."
        className="mt-3 min-h-28 border-border bg-muted"
        maxLength={5000}
      />
      <div className="mt-3 flex items-center gap-3">
        <Button
          onClick={submit}
          disabled={isPending || !title.trim() || !content.trim()}
          className="gap-2"
        >
          <Send className="size-4" />
          Gửi góp ý
        </Button>
        {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
      </div>
    </div>
  );
}
