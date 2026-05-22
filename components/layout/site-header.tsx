"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Crown, Home, Menu, Search } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/truyen", label: "Kho truyện", icon: BookOpen },
  { href: "/vip", label: "VIP", icon: Crown },
  { href: "/cong-dong", label: "Cộng đồng", icon: Menu }
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const clerkEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  const isClerkAdmin = clerkEmail === "nhatanhvo741@gmail.com";

  return (
    <header className="sticky top-0 z-30 border-b border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] bg-[color-mix(in_srgb,var(--background)_80%,transparent)] backdrop-blur-md shadow-sm">
      {/* Desktop layout */}
      <div className="mx-auto hidden max-w-7xl items-center gap-6 px-4 py-3 md:flex">
        <Link
          href="/"
          className="shrink-0 text-lg font-black tracking-tight"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Tiểu thuyết Audio
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "btn btn-ghost btn-sm rounded-full px-3 text-foreground/70 hover:text-foreground",
                  active && "text-foreground"
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action="/tim-kiem" className="flex flex-1 items-center gap-2 max-w-md ml-auto">
          <Input
            name="q"
            aria-label="Tìm truyện, tác giả, giọng đọc"
            placeholder="Tìm truyện audio"
            className="h-10 rounded-xl border-[color-mix(in_oklch,var(--foreground)_12%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)]"
          />
          <Button type="submit" variant="secondary" size="sm" aria-label="Tìm kiếm">
            <Search aria-hidden="true" />
          </Button>
        </form>

        <div className="flex items-center gap-2">
          {isClerkAdmin ? (
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/admin">Admin</Link>
            </Button>
          ) : null}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="rounded-full">Dang nhap</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="rounded-full">Dang ky</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden">
        <button aria-label="Menu" className="p-2 hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] rounded-full transition-colors">
          <Menu className="size-5" />
        </button>
        <Link
          href="/"
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Tiểu thuyết Audio
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/tim-kiem" aria-label="Search" className="p-2 hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] rounded-full transition-colors">
            <Search className="size-5" />
          </Link>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
