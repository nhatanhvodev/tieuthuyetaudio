import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InstallAppButton } from "@/components/pwa/install-app-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/86 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="text-lg font-black">
          Tieu thuyet Audio
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <Link href="/truyen">Truyen</Link>
          <Link href="/the-loai">The loai</Link>
          <Link href="/vip">VIP</Link>
          <Link href="/cong-dong">Cong dong</Link>
        </nav>
        <form action="/tim-kiem" className="ml-auto hidden w-full max-w-sm items-center gap-2 md:flex">
          <Input name="q" aria-label="Tim truyen, tac gia, giong doc" className="h-9" />
          <Button type="submit" size="sm">
            <Search data-icon="inline-start" />
            Tim
          </Button>
        </form>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <InstallAppButton compact />
          <Button asChild variant="secondary" size="sm">
            <Link href="/dang-nhap">Dang nhap</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
