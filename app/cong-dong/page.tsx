"use client";

import { useEffect, useState } from "react";
import { Bug, Download } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { PostForm } from "@/components/community/post-form";
import { PostCard } from "@/components/community/post-card";
import { CommentSection } from "@/components/community/comment-section";

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

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/community/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts))
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(post: Post) {
    setPosts((prev) => [post, ...prev]);
  }

  function toggleComments(postId: string) {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="glass-panel rounded-lg p-5 md:p-7">
            <p className="text-sm font-semibold text-accent">Cộng đồng</p>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">Góp ý và thảo luận</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Chia sẻ cảm nhận, báo lỗi giao diện, đề xuất truyện mới hoặc góp ý cho trải nghiệm nghe trên web và PWA.</p>
          </div>

          <div className="mt-6">
            <PostForm onCreated={handleCreated} />
          </div>

          <div className="mt-6 grid gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-panel animate-pulse rounded-lg p-4">
                  <div className="mb-3 h-4 w-28 rounded bg-muted" />
                  <div className="mb-2 h-6 w-3/4 rounded bg-muted" />
                  <div className="mb-1 h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                </div>
              ))
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id}>
                  <PostCard post={post} onToggleComments={toggleComments} />
                  {openComments.has(post.id) ? <CommentSection postId={post.id} /> : null}
                </div>
              ))
            ) : (
              <div className="glass-panel rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Chưa có bài viết nào. Hãy là người đầu tiên gửi góp ý!</p>
              </div>
            )}
          </div>
        </div>

        <aside className="grid h-fit gap-4">
          <div className="glass-panel rounded-lg p-5">
            <div className="flex items-center gap-2 text-accent">
              <Download aria-hidden="true" />
              <h2 className="text-xl font-black">Cài ứng dụng</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Người dùng mobile có thể cài website như app để mở nhanh và nghe truyện toàn màn hình.</p>
            <div className="mt-4">
              <InstallAppButton />
            </div>
          </div>
          <div className="glass-panel rounded-lg p-5">
            <div className="flex items-center gap-2 text-accent">
              <Bug aria-hidden="true" />
              <h2 className="text-xl font-black">Báo lỗi nhanh</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Nếu thấy text tràn, nút khó bấm hoặc player che nội dung, hãy gửi góp ý kèm tên trang.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
