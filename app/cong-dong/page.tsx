import { Bug, Download, MessageCircle, Pin, Send, ThumbsUp } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const topics = ["Thảo luận", "Đề xuất", "Hỏi đáp", "Báo lỗi"];
const posts = [
  {
    title: "Ghim: góp ý trải nghiệm nghe trên mobile",
    author: "Quản trị viên",
    category: "Đề xuất",
    pinned: true,
    content: "Hãy gửi lỗi hiển thị, yêu cầu thể loại mới hoặc phản hồi về player để nhóm phát triển ưu tiên trong các bản sau.",
    likes: 38,
    comments: 12
  },
  {
    title: "Nên thêm bộ lọc truyện đã hoàn thành",
    author: "Minh Anh",
    category: "Thảo luận",
    pinned: false,
    content: "Khi nghe dài ngày mình thường muốn lọc nhanh các bộ đã hoàn thành để nghe liên tục không phải chờ tập mới.",
    likes: 21,
    comments: 7
  },
  {
    title: "Player hiển thị giờ phút giây rất dễ theo dõi",
    author: "Bạn nghe đêm",
    category: "Hỏi đáp",
    pinned: false,
    content: "Dòng thời gian mới rõ hơn, nhất là các tập dài. Mong có thêm nút hẹn giờ tắt trong phiên bản sau.",
    likes: 16,
    comments: 5
  }
];

export default function CommunityPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="rounded-lg border bg-card/90 p-5 md:p-7">
            <p className="text-sm font-semibold text-accent">Cộng đồng</p>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">Góp ý và thảo luận</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Chia sẻ cảm nhận, báo lỗi giao diện, đề xuất truyện mới hoặc góp ý cho trải nghiệm nghe trên web và PWA.</p>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">Gửi góp ý</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {topics.map((topic) => (
                  <button key={topic} type="button" className="inline-flex h-9 shrink-0 items-center rounded-md border bg-secondary px-3 text-sm font-semibold">
                    {topic}
                  </button>
                ))}
              </div>
              <Textarea aria-label="Nội dung góp ý" placeholder="Bạn muốn cải thiện điều gì?" className="min-h-28" />
              <Button className="w-fit">
                <Send data-icon="inline-start" />
                Gửi góp ý
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-3">
            {posts.map((post) => (
              <article key={post.title} className="rounded-lg border bg-card/90 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {post.pinned ? <Pin aria-hidden="true" className="text-accent" /> : <MessageCircle aria-hidden="true" className="text-muted-foreground" />}
                  <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">{post.category}</span>
                  <span className="text-sm text-muted-foreground">bởi {post.author}</span>
                </div>
                <h2 className="mt-3 text-xl font-black">{post.title}</h2>
                <p className="mt-2 leading-6 text-muted-foreground">{post.content}</p>
                <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><ThumbsUp aria-hidden="true" className="size-4" /> {post.likes}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle aria-hidden="true" className="size-4" /> {post.comments}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid h-fit gap-4">
          <div className="rounded-lg border bg-card/90 p-5">
            <div className="flex items-center gap-2 text-accent">
              <Download aria-hidden="true" />
              <h2 className="text-xl font-black">Cài ứng dụng</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Người dùng mobile có thể cài website như app để mở nhanh và nghe truyện toàn màn hình.</p>
            <div className="mt-4">
              <InstallAppButton />
            </div>
          </div>
          <div className="rounded-lg border bg-card/90 p-5">
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
