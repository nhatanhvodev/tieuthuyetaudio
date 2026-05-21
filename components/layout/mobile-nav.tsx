"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Grid3X3, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/truyen", label: "Thư viện", icon: Library },
  { href: "/the-loai", label: "Thể loại", icon: Grid3X3 },
  { href: "/cong-dong", label: "Cộng đồng", icon: MessageSquare },
  { href: "/tai-khoan", label: "Cá nhân", icon: User }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính trên di động"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)] backdrop-blur-xl md:hidden shadow-[0_-4px_12px_rgba(120,53,15,0.04)]"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
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
                "flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95",
                "text-[11px] font-semibold",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "bg-primary text-primary-foreground rounded-full px-4 py-1"
                  : "text-muted-foreground hover:text-foreground rounded-full px-2 py-1"
              )}
            >
              <Icon aria-hidden="true" className="size-5" />
              <span style={{ fontFamily: "var(--font-label)" }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
