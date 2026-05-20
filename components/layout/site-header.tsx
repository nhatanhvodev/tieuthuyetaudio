"use client";

import Link from "next/link";
import { BookOpen, Crown, Home, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import type { Session } from "next-auth";

const navItems = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/truyen", label: "Kho truyện", icon: BookOpen },
  { href: "/vip", label: "VIP", icon: Crown },
  { href: "/cong-dong", label: "Cộng đồng", icon: Menu }
];

export function SiteHeader({ session }: { session: Session | null }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/88 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-lg font-black tracking-tight text-transparent"
          >
            Tiểu thuyết Audio
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeSwitcher />
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <nav className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="btn btn-ghost btn-sm rounded-full px-3 text-foreground/80 hover:text-foreground"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <form action="/tim-kiem" className="flex w-full items-center gap-2 lg:max-w-md lg:justify-self-end">
            <Input
              name="q"
              aria-label="Tìm truyện, tác giả, giọng đọc"
              placeholder="Tìm truyện audio"
              className="h-10 border-border/70 bg-background/85"
            />
            <Button type="submit" variant="secondary" size="sm" aria-label="Tìm kiếm">
              <Search aria-hidden="true" />
              <span className="hidden sm:inline">Tìm</span>
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-end gap-2">
          {session?.user ? (
            <UserMenu session={session} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/dang-nhap">Đăng nhập</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/dang-ky">Đăng ký</Link>
              </Button>
            </>
          )}
          <div className="hidden lg:block">
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 px-4 py-2 xl:hidden">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 text-sm font-medium text-muted-foreground transition hover:border-border hover:text-foreground"
              >
                <Icon aria-hidden="true" className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
