"use client";

import Link from "next/link";
import { BookOpen, Home, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Trang chu", icon: Home },
  { href: "/tim-kiem", label: "Tim kiem", icon: Search },
  { href: "/truyen", label: "Kho truyen", icon: BookOpen },
  { href: "/tai-khoan", label: "Tai khoan", icon: User }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Dieu huong chinh tren di dong" className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-1">
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
                "flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active && "bg-secondary text-accent"
              )}
            >
              <Icon aria-hidden="true" className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
