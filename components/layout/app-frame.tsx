"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MiniPlayer } from "@/components/player/mini-player";
import { PlayerProvider } from "@/components/player/player-provider";

export function AppFrame({ children, session }: { children: ReactNode; session: Session | null }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-dvh">{children}</main>;
  }

  return (
    <PlayerProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader session={session} />
        <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-24">{children}</main>
        <SiteFooter />
      </div>
      <MiniPlayer />
      <MobileNav />
    </PlayerProvider>
  );
}
