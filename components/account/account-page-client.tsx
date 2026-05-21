"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Crown, Loader2, Pencil, Check, X, Clock, BookOpen, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContinueListeningShelf } from "@/components/series/continue-listening-shelf";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";

type AccountData = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  isVip: boolean;
  createdAt: Date;
};

type ListeningItem = {
  id: string;
  currentSeconds: number;
  completed: boolean;
  episode: {
    id: string;
    episodeNumber: number;
    title: string;
    audioUrl: string | null;
    durationSeconds: number | null;
    series: {
      id: string;
      slug: string;
      title: string;
      coverUrl: string | null;
    };
  };
};

type FollowItem = {
  id: string;
  series: {
    id: string;
    slug: string;
    title: string;
    coverUrl: string | null;
    episodeCount: number;
    status: string;
  };
};

type TabId = "profile" | "history" | "follows";

const TABS = [
  { id: "profile" as const, label: "Tài khoản", icon: User },
  { id: "history" as const, label: "Lịch sử nghe", icon: Clock },
  { id: "follows" as const, label: "Đang theo dõi", icon: BookOpen }
];

type Props = {
  tab: string;
  account: AccountData;
  history: ListeningItem[];
  follows: FollowItem[];
  continueListening: Awaited<ReturnType<typeof import("@/lib/series/queries").getContinueListeningByUser>>;
};

export function AccountPageClient({ tab: initialTab, account, history, follows, continueListening }: Props) {
  const router = useRouter();
  const activeTab: TabId = (TABS.find((t) => t.id === initialTab) ? initialTab : "profile") as TabId;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(account.name ?? "");
  const [editEmail, setEditEmail] = useState(account.email);
  const [editing, startEditing] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = (account.name ?? account.email ?? "U").charAt(0).toUpperCase();
  const displayAvatar = avatarPreview ?? account.image;

  function goTab(id: TabId) {
    router.push(`/tai-khoan?tab=${id}`);
  }

  async function handleSave() {
    startEditing(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), email: editEmail.trim() })
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    const formData = new FormData();
    formData.set("file", file);
    const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
    if (res.ok) router.refresh();
    setUploading(false);
  }

  function cancelEdit() {
    setEditName(account.name ?? "");
    setEditEmail(account.email);
    setIsEditing(false);
  }

  return (
    <div className="space-y-8">
      <ContinueListeningShelf items={continueListening} title="Nghe tiếp" />

      {/* Profile header — always visible */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
            <div className="relative shrink-0">
              <Avatar className="size-24 ring-4 ring-border/40 sm:size-28">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={account.name ?? ""} className="size-full rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <AvatarFallback className="bg-accent/15 text-accent text-3xl font-bold">{initials}</AvatarFallback>
                )}
              </Avatar>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-2 border-background bg-card text-muted-foreground shadow-sm transition hover:text-foreground hover:shadow-md"
              >
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-black">{account.name ?? "Người dùng"}</h1>
                {account.isVip ? (
                  <Badge variant="accent" size="sm" className="inline-flex items-center gap-1"><Crown className="size-3" />VIP</Badge>
                ) : (
                  <Badge variant="secondary" size="sm">Miễn phí</Badge>
                )}
                {account.role === "ADMIN" ? <Badge variant="outline" size="sm">ADMIN</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{account.email}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSave} disabled={editing}>
                      {editing ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : <Check className="mr-1 size-3.5" />}Lưu
                    </Button>
                    <Button size="sm" variant="secondary" onClick={cancelEdit} disabled={editing}>
                      <X className="mr-1 size-3.5" />Huỷ
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-1 size-3.5" />Sửa hồ sơ
                  </Button>
                )}
                {!account.isVip ? (
                  <Button size="sm" asChild>
                    <Link href="/vip"><Crown className="mr-1 size-3.5" />Nâng cấp VIP</Link>
                  </Button>
                ) : null}
              </div>

              {isEditing ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground">Tên hiển thị</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring" placeholder="Tên hiển thị" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground">Email</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring" placeholder="Email" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-border/60">
            <div className="p-4 text-center"><p className="text-lg font-black">{history.length}</p><p className="text-xs text-muted-foreground">Tập đã nghe</p></div>
            <div className="border-x border-border/60 p-4 text-center"><p className="text-lg font-black">{follows.length}</p><p className="text-xs text-muted-foreground">Đang theo dõi</p></div>
            <div className="p-4 text-center"><p className="text-lg font-black">{account.isVip ? "VIP" : "Free"}</p><p className="text-xs text-muted-foreground">Gói</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Tab nav */}
      <div className="glass-panel flex gap-2 overflow-x-auto rounded-lg p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => goTab(tab.id)}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-semibold transition",
                activeTab === tab.id
                  ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content — only one section shown */}
      {activeTab === "profile" ? (
        <Card>
          <CardHeader><CardTitle>Thông tin tài khoản</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex justify-between border-b border-border/40 pb-2"><span className="text-muted-foreground">Tên</span><span className="font-semibold">{account.name ?? "—"}</span></div>
            <div className="flex justify-between border-b border-border/40 pb-2"><span className="text-muted-foreground">Email</span><span className="font-semibold">{account.email}</span></div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">Gói</span>
              <span className="font-semibold">{account.isVip ? "VIP" : "Miễn phí"}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">Vai trò</span>
              <span className="font-semibold">{account.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground">Tham gia từ</span>
              <span className="font-semibold">{new Date(account.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "history" ? (
        <Card>
          <CardHeader><CardTitle>Lịch sử nghe</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {history.length ? history.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/truyen/${item.episode.series.slug}/tap/${item.episode.episodeNumber}`} className="font-semibold text-sm hover:text-accent">
                    {item.episode.series.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">Tập {item.episode.episodeNumber} - {item.episode.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Đã nghe {formatDuration(item.currentSeconds)}</p>
                </div>
                <Button asChild size="sm" variant="secondary" className="shrink-0">
                  <Link href={`/truyen/${item.episode.series.slug}/tap/${item.episode.episodeNumber}`}>Nghe tiếp</Link>
                </Button>
              </div>
            )) : <p className="text-sm text-muted-foreground">Chưa có lịch sử nghe.</p>}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "follows" ? (
        <Card>
          <CardHeader><CardTitle>Truyện đang theo dõi</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {follows.length ? follows.map((follow) => (
              <Link key={follow.id} href={`/truyen/${follow.series.slug}`} className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition hover:border-accent/50 hover:bg-surface-3/50">
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {follow.series.coverUrl ? (
                    <img src={follow.series.coverUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">No IMG</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{follow.series.title}</p>
                  <p className="text-xs text-muted-foreground">{follow.series.episodeCount} tập</p>
                </div>
              </Link>
            )) : <p className="text-sm text-muted-foreground">Chưa theo dõi truyện nào.</p>}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
