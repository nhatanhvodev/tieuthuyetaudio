"use client";

import Link from "next/link";
import { BookOpen, Home, MessageSquare, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/tim-kiem", label: "Tìm kiếm", icon: Search },
  { href: "/truyen", label: "Kho truyện", icon: BookOpen },
  { href: "/cong-dong", label: "Cộng đồng", icon: MessageSquare },
  { href: "/tai-khoan", label: "Tài khoản", icon: User }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính trên di động"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl md:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "relative flex min-h-[3.5rem] min-w-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[11px] font-semibold transition-all duration-200 motion-reduce:transition-none",
                "text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "active:scale-95",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "hover:text-foreground"
              )}
            >
              {active ? (
                <span
                  className="absolute inset-x-2 -top-0.5 h-0.5 rounded-full bg-accent transition-all duration-200 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              ) : null}
              <Icon aria-hidden="true" className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
