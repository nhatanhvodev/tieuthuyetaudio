import { Bug, Download, MessageCircle, Pin, Send, ThumbsUp } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const topics = ["Thao luan", "De xuat", "Hoi dap", "Bao loi"];
const posts = [
  {
    title: "Ghim: gop y trai nghiem nghe tren mobile",
    author: "Quan tri vien",
    category: "De xuat",
    pinned: true,
    content: "Hay gui loi hien thi, yeu cau the loai moi hoac phan hoi ve player de nhom phat trien uu tien trong cac ban sau.",
    likes: 38,
    comments: 12
  },
  {
    title: "Nen them bo loc truyen da hoan thanh",
    author: "Minh Anh",
    category: "Thao luan",
    pinned: false,
    content: "Khi nghe dai ngay minh thuong muon loc nhanh cac bo da hoan thanh de nghe lien tuc khong phai cho tap moi.",
    likes: 21,
    comments: 7
  },
  {
    title: "Player hien thi gio phut giay rat de theo doi",
    author: "Ban nghe dem",
    category: "Hoi dap",
    pinned: false,
    content: "Dong thoi gian moi ro hon, nhat la cac tap dai. Mong co them nut hen gio tat trong phien ban sau.",
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
            <p className="text-sm font-semibold text-accent">Cong dong</p>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">Gop y va thao luan</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Chia se cam nhan, bao loi giao dien, de xuat truyen moi hoac gop y cho trai nghiem nghe tren web va PWA.</p>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">Gui gop y</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {topics.map((topic) => (
                  <button key={topic} type="button" className="inline-flex h-9 shrink-0 items-center rounded-md border bg-secondary px-3 text-sm font-semibold">
                    {topic}
                  </button>
                ))}
              </div>
              <Textarea aria-label="Noi dung gop y" placeholder="Ban muon cai thien dieu gi?" className="min-h-28" />
              <Button className="w-fit">
                <Send data-icon="inline-start" />
                Gui gop y
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-3">
            {posts.map((post) => (
              <article key={post.title} className="rounded-lg border bg-card/90 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {post.pinned ? <Pin aria-hidden="true" className="text-accent" /> : <MessageCircle aria-hidden="true" className="text-muted-foreground" />}
                  <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">{post.category}</span>
                  <span className="text-sm text-muted-foreground">boi {post.author}</span>
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
              <h2 className="text-xl font-black">Cai ung dung</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Nguoi dung mobile co the cai website nhu app de mo nhanh va nghe truyen toan man hinh.</p>
            <div className="mt-4">
              <InstallAppButton />
            </div>
          </div>
          <div className="rounded-lg border bg-card/90 p-5">
            <div className="flex items-center gap-2 text-accent">
              <Bug aria-hidden="true" />
              <h2 className="text-xl font-black">Bao loi nhanh</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Neu thay text tran, nut kho bam hoac player che noi dung, hay gui gop y kem ten trang.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
