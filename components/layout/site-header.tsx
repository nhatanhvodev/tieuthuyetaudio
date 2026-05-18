import Link from "next/link";
import { BookOpen, Crown, Home, MessageCircle, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InstallAppButton } from "@/components/pwa/install-app-button";

const navItems = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/truyen", label: "Kho truyện", icon: BookOpen },
  { href: "/vip", label: "VIP", icon: Crown },
  { href: "/cong-dong", label: "Cộng đồng", icon: MessageCircle }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap">
        <Link href="/" className="mr-1 text-lg font-black">
          Tiểu thuyết Audio
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Icon aria-hidden="true" className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action="/tim-kiem" className="order-last flex w-full items-center gap-2 md:order-none md:ml-auto md:max-w-sm">
          <Input name="q" aria-label="Tìm truyện, tác giả, giọng đọc" placeholder="Tìm truyện audio" className="h-9" />
          <Button type="submit" size="sm" aria-label="Tìm kiếm">
            <Search aria-hidden="true" />
            <span className="hidden sm:inline">Tìm</span>
          </Button>
        </form>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <InstallAppButton compact />
          <Button asChild variant="secondary" size="sm">
            <Link href="/dang-nhap">
              <User data-icon="inline-start" />
              Đăng nhập
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
