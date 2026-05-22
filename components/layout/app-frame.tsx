"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MiniPlayer } from "@/components/player/mini-player";
import { PlayerProvider } from "@/components/player/player-provider";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-dvh">{children}</main>;
  }

  return (
    <PlayerProvider>
      <div className="flex min-h-dvh flex-col overflow-x-clip">
        <SiteHeader />
        <main className="min-w-0 flex-1 pb-[calc(var(--app-bottom-space)+env(safe-area-inset-bottom))] md:pb-28">{children}</main>
        <SiteFooter />
      </div>
      <MiniPlayer />
      <MobileNav />
    </PlayerProvider>
  );
}
