# Tieu thuyet Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first full-stack responsive mobile-friendly PWA release of Tieu thuyet Audio with catalog browsing, playback, auth, user account, admin CRUD, Prisma/PostgreSQL data, mock VIP entitlement, and a mobile install/download-app option.

**Architecture:** Create a Next.js 15 App Router app directly in the existing repository root, because the workspace already contains planning Markdown files. Use server-rendered public pages for catalog/detail SEO, client components for player/auth interactions, Prisma for persistence, Auth.js for credentials sessions, and Zustand for the cross-route audio player.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui + Radix primitives, Prisma, PostgreSQL, Auth.js, Zod, Zustand, Vitest, Testing Library, Playwright smoke verification.

---

## Scope Check

The design spec contains several subsystems. This plan intentionally implements one vertical first release, not every future subsystem:

- Included: scaffold, design tokens, Prisma schema/seed, auth, public catalog, search/filter, story detail, player, progress, follow/rating, account, admin CRUD, responsive mobile layouts, PWA metadata, mobile install/download-app CTA, lint/build/test.
- Deferred: real payments, real uploads/transcoding, ads, advanced comments, advanced playlists, analytics pipeline, native store builds, and separately signed APK/TWA distribution.

## File Structure

Create or modify these files:

- Root project: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `components.json`, `.gitignore`, `.env.example`, `middleware.ts`.
- App shell: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `app/not-found.tsx`, `app/manifest.ts`, `app/icon.svg`.
- Public routes: `app/truyen/page.tsx`, `app/truyen/[slug]/page.tsx`, `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`, `app/the-loai/page.tsx`, `app/the-loai/[slug]/page.tsx`, `app/tim-kiem/page.tsx`, `app/vip/page.tsx`, `app/cong-dong/page.tsx`.
- Auth/account routes: `app/dang-nhap/page.tsx`, `app/dang-ky/page.tsx`, `app/tai-khoan/page.tsx`.
- Admin routes: `app/admin/page.tsx`, `app/admin/truyen/page.tsx`, `app/admin/truyen/new/page.tsx`, `app/admin/truyen/[id]/edit/page.tsx`, `app/admin/tap/page.tsx`, `app/admin/nguoi-dung/page.tsx`.
- API routes: `app/api/auth/[...nextauth]/route.ts`, `app/api/register/route.ts`, `app/api/follow/route.ts`, `app/api/reviews/route.ts`, `app/api/progress/route.ts`, `app/api/admin/series/route.ts`, `app/api/admin/series/[id]/route.ts`, `app/api/admin/episodes/route.ts`, `app/api/admin/users/[id]/vip/route.ts`.
- Domain/data: `lib/db.ts`, `lib/auth.ts`, `lib/password.ts`, `lib/routes.ts`, `lib/format.ts`, `lib/series/queries.ts`, `lib/series/validators.ts`, `lib/account/queries.ts`, `lib/admin/validators.ts`.
- UI: `components/layout/site-header.tsx`, `components/layout/site-footer.tsx`, `components/layout/mobile-nav.tsx`, `components/layout/app-frame.tsx`, `components/pwa/install-app-button.tsx`, `components/series/story-card.tsx`, `components/series/story-shelf.tsx`, `components/series/series-filters.tsx`, `components/series/episode-list.tsx`, `components/player/audio-player.tsx`, `components/player/mini-player.tsx`, `components/player/player-provider.tsx`, `components/auth/login-form.tsx`, `components/auth/register-form.tsx`, `components/review/rating-stars.tsx`, `components/review/review-form.tsx`, `components/search/search-box.tsx`, `components/common/empty-state.tsx`, `components/admin/admin-nav.tsx`, `components/admin/series-form.tsx`, `components/admin/episode-form.tsx`, `components/admin/user-vip-toggle.tsx`.
- State: `stores/player-store.ts`.
- Prisma: `prisma/schema.prisma`, `prisma/seed.ts`.
- Tests: `tests/unit/series-queries.test.ts`, `tests/unit/player-store.test.ts`, `tests/unit/validators.test.ts`, `tests/e2e/smoke.spec.ts`.

## Task 1: Initialize Repository And Project Shell

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `.env.example`

- [ ] **Step 1: Initialize git if missing**

Run:

```powershell
git status --short; if ($LASTEXITCODE -ne 0) { git init }
```

Expected: either existing status output or `Initialized empty Git repository`.

- [ ] **Step 2: Create `.gitignore`**

```gitignore
node_modules
.next
out
coverage
.env
.env.local
.env.*.local
dist
*.tsbuildinfo
.superpowers
```

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "tieuthuyetaudio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@auth/prisma-adapter": "latest",
    "@hookform/resolvers": "latest",
    "@prisma/client": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-popover": "latest",
    "@radix-ui/react-progress": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-slider": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-toast": "latest",
    "bcryptjs": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "lucide-react": "latest",
    "next": "latest",
    "next-auth": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-hook-form": "latest",
    "sonner": "latest",
    "tailwind-merge": "latest",
    "zod": "latest",
    "zustand": "latest"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "@tailwindcss/postcss": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/bcryptjs": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "jsdom": "latest",
    "prisma": "latest",
    "tailwindcss": "latest",
    "tsx": "latest",
    "typescript": "latest",
    "vitest": "latest"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 4: Create core config files**

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: false
  }
};

export default nextConfig;
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {}
  }
};

export default config;
```

`eslint.config.mjs`:

```js
import nextPlugin from "eslint-config-next";

export default [...nextPlugin];
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: []
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname
    }
  }
});
```

`.env.example`:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tieuthuyetaudio?schema=public"
AUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 5: Install dependencies**

Run:

```powershell
npm install
```

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 6: Commit**

```powershell
git add .gitignore package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs vitest.config.ts .env.example
git commit -m "chore: initialize next project shell"
```

Expected: commit succeeds.

## Task 2: Add Design Tokens, App Shell, And PWA Metadata

**Files:**
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx`
- Create: `app/not-found.tsx`
- Create: `app/manifest.ts`
- Create: `app/icon.svg`
- Create: `lib/utils.ts`
- Create: `components/layout/site-header.tsx`
- Create: `components/layout/site-footer.tsx`
- Create: `components/layout/mobile-nav.tsx`
- Create: `components/layout/app-frame.tsx`
- Create: `components/pwa/install-app-button.tsx`

- [ ] **Step 1: Add shadcn project config**

Create `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 2: Add required shadcn components**

Run:

```powershell
npx shadcn@latest add button card badge input label textarea select tabs dialog dropdown-menu popover slider progress separator skeleton sonner table avatar sheet
```

Expected: `components/ui/*` files are created.

- [ ] **Step 3: Add utility function**

`lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Add global CSS tokens**

`app/globals.css` must define the dark audiobook theme and light admin surfaces using CSS variables. Use semantic variables for shadcn components and app-specific variables:

```css
@import "tailwindcss";

:root {
  --background: #08111f;
  --foreground: #f8fafc;
  --card: #101b2d;
  --card-foreground: #f8fafc;
  --popover: #101b2d;
  --popover-foreground: #f8fafc;
  --primary: #2dd4bf;
  --primary-foreground: #042f2e;
  --secondary: #1f2a44;
  --secondary-foreground: #e2e8f0;
  --muted: #16233a;
  --muted-foreground: #9aa9bd;
  --accent: #f59e0b;
  --accent-foreground: #1f1300;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #24324a;
  --input: #1d2b44;
  --ring: #2dd4bf;
  --radius: 0.5rem;
  --admin-background: #f8fafc;
  --admin-foreground: #0f172a;
}

* {
  border-color: var(--border);
}

html {
  min-height: 100%;
  background: var(--background);
}

body {
  min-height: 100%;
  margin: 0;
  background: radial-gradient(circle at top left, rgba(45, 212, 191, 0.12), transparent 32rem), var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
  letter-spacing: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
textarea,
select {
  font: inherit;
}
```

- [ ] **Step 5: Implement layout components**

`components/layout/site-header.tsx`:

```tsx
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InstallAppButton } from "@/components/pwa/install-app-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/86 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="text-lg font-black">Tieu thuyet Audio</Link>
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
        <Button asChild variant="secondary" size="sm">
          <Link href="/dang-nhap">Dang nhap</Link>
        </Button>
        <InstallAppButton compact />
      </div>
    </header>
  );
}
```

`components/pwa/install-app-button.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (!installEvent) {
      setShowGuide((value) => !value);
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  }

  return (
    <div className="relative">
      <Button type="button" size={compact ? "sm" : "default"} variant={compact ? "outline" : "default"} onClick={install}>
        <Download data-icon="inline-start" />
        Tai app
      </Button>
      {showGuide ? (
        <div className="absolute right-0 top-11 z-50 w-72 rounded-md border bg-popover p-3 text-sm text-popover-foreground shadow-lg">
          <p className="font-semibold">Cai nhu app tren dien thoai</p>
          <p className="mt-1 text-muted-foreground">Mo bang Chrome/Edge tren Android, chon menu trinh duyet, roi chon "Add to Home screen" hoac "Install app".</p>
        </div>
      ) : null}
    </div>
  );
}
```

`components/layout/mobile-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Home, Library, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tim-kiem", label: "Search", icon: Search },
  { href: "/truyen", label: "Library", icon: Library },
  { href: "/tai-khoan", label: "Account", icon: User }
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-2 pb-2 pt-1 backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] text-muted-foreground", active && "text-primary")}>
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

`components/layout/site-footer.tsx`:

```tsx
export function SiteFooter() {
  return (
    <footer className="border-t pb-24 pt-10 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 text-sm text-muted-foreground md:grid-cols-3">
        <p>Tieu thuyet Audio - demo platform for licensed Vietnamese audio stories.</p>
        <p>No copied logos, copyrighted stories, or unauthorized audio are included.</p>
        <p className="md:text-right">Lien he · Chinh sach · Dieu khoan</p>
      </div>
    </footer>
  );
}
```

`components/layout/app-frame.tsx`:

```tsx
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MiniPlayer } from "@/components/player/mini-player";
import { PlayerProvider } from "@/components/player/player-provider";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <SiteHeader />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <SiteFooter />
      <MiniPlayer />
      <MobileNav />
    </PlayerProvider>
  );
}
```

- [ ] **Step 6: Add root layout and PWA metadata**

`app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppFrame } from "@/components/layout/app-frame";

export const metadata: Metadata = {
  title: {
    default: "Tieu thuyet Audio",
    template: "%s | Tieu thuyet Audio"
  },
  description: "Nghe tieu thuyet audio tieng Viet voi player PWA, thu vien truyen va tien trinh nghe.",
  applicationName: "Tieu thuyet Audio",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#08111f",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
```

`app/manifest.ts`:

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tieu thuyet Audio",
    short_name: "AudioTruyen",
    description: "PWA nghe tieu thuyet audio tieng Viet.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#08111f",
    theme_color: "#08111f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" }
    ]
  };
}
```

- [ ] **Step 7: Add temporary homepage and not found**

`app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h1 className="max-w-3xl text-5xl font-black leading-tight">Nghe tiep cau chuyen dang do</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">Catalog, player, auth, admin, and PWA surfaces are implemented in the next tasks.</p>
    </section>
  );
}
```

`app/not-found.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-black">Khong tim thay trang</h1>
      <p className="text-muted-foreground">Noi dung nay khong ton tai hoac da duoc di chuyen.</p>
      <Button asChild><Link href="/">Ve trang chu</Link></Button>
    </section>
  );
}
```

- [ ] **Step 8: Verify shell**

Run:

```powershell
npm run typecheck
npm run build
```

Expected: both commands pass after Task 6 provides player exports. If executing strictly in order, create the minimal `MiniPlayer` and `PlayerProvider` files from Task 6 before running this verification command, then replace them with the complete Task 6 implementation.

- [ ] **Step 9: Commit**

```powershell
git add app components lib components.json
git commit -m "feat: add app shell and pwa metadata"
```

## Task 3: Add Prisma Schema, Database Client, And Seed Data

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `lib/db.ts`
- Create: `lib/format.ts`

- [ ] **Step 1: Create Prisma schema**

Use PostgreSQL provider and these models: `User`, `Account`, `Session`, `VerificationToken`, `Series`, `Episode`, `Category`, `SeriesCategory`, `Follow`, `Review`, `ListenProgress`. Include `UserRole` and `SeriesStatus` enums. Add `isVip` boolean to `User` for mock VIP.

- [ ] **Step 2: Create database singleton**

`lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

- [ ] **Step 3: Create format helpers**

`lib/format.ts`:

```ts
export function formatCount(value: number) {
  return new Intl.NumberFormat("vi-VN", { notation: value >= 10000 ? "compact" : "standard" }).format(value);
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "Dang cap nhat";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} gio ${minutes} phut`;
  return `${minutes} phut`;
}
```

- [ ] **Step 4: Seed demo data**

`prisma/seed.ts` must:

- hash password `Admin@123456` for `admin@tieuthuyetaudio.local`;
- hash password `User@123456` for `user@tieuthuyetaudio.local`;
- create categories: Ngon tinh, Tien hiep, Kiem hiep, Trinh tham, Do thi, Xuyen khong;
- create at least 8 series with original demo titles and render CSS-gradient cover art in UI when `coverUrl` is empty;
- create 3 episodes per series using safe remote sample MP3 URLs from a known public sample audio provider or local future files under `/demo/audio/`;
- create follows/reviews/progress for the demo user.

- [ ] **Step 5: Generate and push DB**

Run:

```powershell
Copy-Item .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
```

Expected: Prisma client generated; schema pushed; seed inserts admin/user/demo catalog. If local PostgreSQL is not running, record the failure and continue with code until verification.

- [ ] **Step 6: Commit**

```powershell
git add prisma lib/db.ts lib/format.ts .env.example
git commit -m "feat: add prisma schema and seed data"
```

## Task 4: Add Domain Queries, Validators, And Unit Tests

**Files:**
- Create: `lib/series/queries.ts`
- Create: `lib/series/validators.ts`
- Create: `lib/account/queries.ts`
- Create: `lib/admin/validators.ts`
- Create: `tests/unit/validators.test.ts`
- Create: `tests/unit/series-queries.test.ts`

- [ ] **Step 1: Write validator tests**

`tests/unit/validators.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { seriesFilterSchema } from "@/lib/series/validators";
import { seriesInputSchema } from "@/lib/admin/validators";

describe("series validators", () => {
  it("normalizes empty filters", () => {
    expect(seriesFilterSchema.parse({})).toEqual({ sort: "newest" });
  });

  it("rejects invalid admin series input", () => {
    expect(() => seriesInputSchema.parse({ title: "", slug: "bad slug" })).toThrow();
  });
});
```

- [ ] **Step 2: Implement validators**

`lib/series/validators.ts`:

```ts
import { z } from "zod";

export const seriesFilterSchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(["ONGOING", "COMPLETED"]).optional(),
  sort: z.enum(["newest", "popular", "rating"]).default("newest")
});

export type SeriesFilters = z.infer<typeof seriesFilterSchema>;
```

`lib/admin/validators.ts`:

```ts
import { z } from "zod";

export const seriesInputSchema = z.object({
  title: z.string().trim().min(2),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(10).optional().or(z.literal("")),
  producer: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["ONGOING", "COMPLETED"]),
  coverUrl: z.string().url().optional().or(z.literal(""))
});

export const episodeInputSchema = z.object({
  seriesId: z.string().min(1),
  episodeNumber: z.coerce.number().int().positive(),
  title: z.string().trim().min(2),
  audioUrl: z.string().url().optional().or(z.literal("")),
  durationSeconds: z.coerce.number().int().positive().optional()
});
```

- [ ] **Step 3: Implement query functions**

`lib/series/queries.ts` must export:

- `getHomeShelves()`
- `getSeriesList(filters: SeriesFilters)`
- `getSeriesBySlug(slug: string)`
- `getSeriesEpisode(slug: string, episodeNumber: number)`
- `getCategories()`
- `getCategoryWithSeries(slug: string)`

Use Prisma `include` for categories and episodes; select only fields needed by UI to reduce serialization.

- [ ] **Step 4: Add account queries**

`lib/account/queries.ts` must export:

- `getAccountOverview(userId: string)`
- `getListeningHistory(userId: string)`
- `getFollowedSeries(userId: string)`

- [ ] **Step 5: Run tests**

Run:

```powershell
npm run test -- tests/unit/validators.test.ts
```

Expected: validators tests pass.

- [ ] **Step 6: Commit**

```powershell
git add lib/series lib/account lib/admin tests/unit
git commit -m "feat: add domain queries and validators"
```

## Task 5: Implement Auth, Registration, Guards, And Middleware

**Files:**
- Create: `lib/password.ts`
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `app/api/register/route.ts`
- Create: `middleware.ts`
- Create: `components/auth/login-form.tsx`
- Create: `components/auth/register-form.tsx`
- Create: `app/dang-nhap/page.tsx`
- Create: `app/dang-ky/page.tsx`

- [ ] **Step 1: Implement password helpers**

`lib/password.ts`:

```ts
import bcrypt from "bcryptjs";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
```

- [ ] **Step 2: Implement Auth.js config**

`lib/auth.ts` must use Prisma adapter, Credentials provider, `verifyPassword`, and JWT/session callbacks that expose `id`, `role`, and `isVip`.

- [ ] **Step 3: Implement auth routes**

`app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

`app/api/register/route.ts` must validate email/password/name, hash password, reject duplicate email, create a `USER`, and return `{ ok: true }`.

- [ ] **Step 4: Add middleware guards**

`middleware.ts` must protect `/tai-khoan` and `/admin`; admin paths must require `role === "ADMIN"`.

- [ ] **Step 5: Add login/register forms and pages**

Forms must use field-level validation messages, call Auth.js sign-in or `/api/register`, and redirect to `/tai-khoan` on success. Use shadcn `Card`, `Input`, `Button`, and `Label`.

- [ ] **Step 6: Verify auth compile**

Run:

```powershell
npm run typecheck
```

Expected: TypeScript passes.

- [ ] **Step 7: Commit**

```powershell
git add lib/password.ts lib/auth.ts app/api/auth app/api/register middleware.ts components/auth app/dang-nhap app/dang-ky
git commit -m "feat: add credentials auth"
```

## Task 6: Implement Player Store, Audio Player, And Mini Player

**Files:**
- Create: `stores/player-store.ts`
- Create: `components/player/player-provider.tsx`
- Create: `components/player/audio-player.tsx`
- Create: `components/player/mini-player.tsx`
- Create: `tests/unit/player-store.test.ts`
- Create: `app/api/progress/route.ts`

- [ ] **Step 1: Write player store test**

`tests/unit/player-store.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createPlayerStore } from "@/stores/player-store";

describe("player store", () => {
  it("loads an episode and updates progress", () => {
    const store = createPlayerStore();
    store.getState().loadEpisode({
      episodeId: "ep1",
      seriesSlug: "demo",
      episodeNumber: 1,
      title: "Tap 1",
      seriesTitle: "Demo",
      audioUrl: "https://example.com/audio.mp3",
      coverUrl: ""
    });
    store.getState().setProgress(42, 120);
    expect(store.getState().current?.episodeId).toBe("ep1");
    expect(store.getState().progress.currentSeconds).toBe(42);
  });
});
```

- [ ] **Step 2: Implement Zustand store**

`stores/player-store.ts` must export `createPlayerStore`, `usePlayerStore`, and actions: `loadEpisode`, `togglePlay`, `setPlaying`, `setProgress`, `setRate`, `clear`.

- [ ] **Step 3: Implement provider and mini-player**

`PlayerProvider` is a client wrapper that renders children. `MiniPlayer` subscribes to `current`, `isPlaying`, and `progress`; it stays hidden when no episode is loaded; it renders above mobile bottom nav.

- [ ] **Step 4: Implement full audio player**

`AudioPlayer` accepts episode data, loads it into the store, renders `<audio>`, play/pause, seek, -10s/+10s, speed select, volume slider, progress bar, and missing-audio error.

- [ ] **Step 5: Implement progress API**

`app/api/progress/route.ts` must require session and upsert `ListenProgress` by user/episode.

- [ ] **Step 6: Run player test**

```powershell
npm run test -- tests/unit/player-store.test.ts
```

Expected: test passes.

- [ ] **Step 7: Commit**

```powershell
git add stores components/player app/api/progress tests/unit/player-store.test.ts
git commit -m "feat: add audio player state and controls"
```

## Task 7: Implement Public Catalog, Home, Category, Search, And Detail Pages

**Files:**
- Create/modify: `app/page.tsx`
- Create: `components/series/story-card.tsx`
- Create: `components/series/story-shelf.tsx`
- Create: `components/series/series-filters.tsx`
- Create: `components/series/episode-list.tsx`
- Create: `components/search/search-box.tsx`
- Create: `components/common/empty-state.tsx`
- Create: `app/truyen/page.tsx`
- Create: `app/truyen/[slug]/page.tsx`
- Create: `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`
- Create: `app/the-loai/page.tsx`
- Create: `app/the-loai/[slug]/page.tsx`
- Create: `app/tim-kiem/page.tsx`
- Create: `app/vip/page.tsx`
- Create: `app/cong-dong/page.tsx`

- [ ] **Step 1: Implement reusable catalog components**

`StoryCard` must show cover block, title, producer, status badge, listens, episode count, rating, and `Nghe thu` button. `StoryShelf` must render horizontal scroll shelves. `EpisodeList` must link to `/truyen/[slug]/tap/[episodeNumber]`.

- [ ] **Step 2: Implement homepage**

Homepage must call `getHomeShelves()` and render:

- dark hero with search;
- mobile-first "Tai app" CTA that uses `InstallAppButton`;
- signed-out “Nghe tiep” panel that invites login and explains progress sync;
- “Truyen moi cap nhat” shelf;
- “Dang thinh hanh” shelf;
- “Co the ban se thich” shelf;
- VIP callout.

- [ ] **Step 3: Implement catalog and filters**

`/truyen` must parse search params with `seriesFilterSchema`, call `getSeriesList`, and render filter controls that update URL query.

- [ ] **Step 4: Implement detail and episode pages**

`/truyen/[slug]` must render metadata, follow button area, rating area, tabs for episodes/description/reviews, and related stories. `/truyen/[slug]/tap/[episodeNumber]` must render `AudioPlayer`, episode nav, episode list, and story metadata.

- [ ] **Step 5: Implement category/search/VIP/community**

Category pages use `getCategories` and `getCategoryWithSeries`. Search page uses `q`. VIP page explains mock VIP. Community page uses a simple feedback form UI and seeded content, no backend moderation.

- [ ] **Step 6: Verify public flow**

Run:

```powershell
npm run typecheck
npm run build
```

Expected: both pass.

- [ ] **Step 7: Commit**

```powershell
git add app components/series components/search components/common
git commit -m "feat: add public catalog and playback pages"
```

## Task 8: Implement Follow, Rating, Account Overview, And VIP Display

**Files:**
- Create: `app/api/follow/route.ts`
- Create: `app/api/reviews/route.ts`
- Create: `components/review/rating-stars.tsx`
- Create: `components/review/review-form.tsx`
- Create: `app/tai-khoan/page.tsx`

- [ ] **Step 1: Implement follow API**

`POST /api/follow` creates a follow for signed-in user and `DELETE /api/follow` removes it. Both validate `seriesId`.

- [ ] **Step 2: Implement review API**

`POST /api/reviews` upserts one review per user/series, validates rating 1-5 and optional content, and recalculates `Series.averageRating`.

- [ ] **Step 3: Implement rating UI**

`RatingStars` renders five accessible buttons for interactive mode and a read-only display for cards. `ReviewForm` posts to `/api/reviews`.

- [ ] **Step 4: Implement account page**

`/tai-khoan` requires session and renders profile, VIP status, followed stories, listening history, and resume buttons.

- [ ] **Step 5: Verify account flow**

Run:

```powershell
npm run typecheck
```

Expected: TypeScript passes.

- [ ] **Step 6: Commit**

```powershell
git add app/api/follow app/api/reviews components/review app/tai-khoan
git commit -m "feat: add follow rating and account overview"
```

## Task 9: Implement Admin CRUD And Mock VIP

**Files:**
- Create: `components/admin/admin-nav.tsx`
- Create: `components/admin/series-form.tsx`
- Create: `components/admin/episode-form.tsx`
- Create: `components/admin/user-vip-toggle.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/truyen/page.tsx`
- Create: `app/admin/truyen/new/page.tsx`
- Create: `app/admin/truyen/[id]/edit/page.tsx`
- Create: `app/admin/tap/page.tsx`
- Create: `app/admin/nguoi-dung/page.tsx`
- Create: `app/api/admin/series/route.ts`
- Create: `app/api/admin/series/[id]/route.ts`
- Create: `app/api/admin/episodes/route.ts`
- Create: `app/api/admin/users/[id]/vip/route.ts`

- [ ] **Step 1: Implement admin guard helper**

Add a server helper in `lib/auth.ts` named `requireAdmin()` that returns the session or redirects/notFound for non-admin users.

- [ ] **Step 2: Implement admin layout/navigation**

Admin pages use light surfaces, dense tables, and clear forms. They must not use the dark public shelf style.

- [ ] **Step 3: Implement series CRUD**

Admin series list shows title, slug, status, episode count, and actions. New/edit forms use `seriesInputSchema`. API creates, updates, and deletes series.

- [ ] **Step 4: Implement episode create/list**

Episode admin lists episodes with series, episode number, title, duration, and audio URL. API creates episodes and updates `Series.episodeCount`.

- [ ] **Step 5: Implement user VIP toggle**

Users admin lists email, name, role, and VIP status. VIP route toggles `User.isVip`.

- [ ] **Step 6: Verify admin compile**

Run:

```powershell
npm run typecheck
npm run build
```

Expected: both pass.

- [ ] **Step 7: Commit**

```powershell
git add components/admin app/admin app/api/admin
git commit -m "feat: add admin catalog and vip management"
```

## Task 10: Add Final Tests, Browser Verification, And Polish

**Files:**
- Create: `tests/e2e/smoke.spec.ts`
- Modify: public/admin UI files as needed after browser review

- [ ] **Step 1: Add Playwright smoke test**

`tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("public catalog flow renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /nghe/i })).toBeVisible();
  await page.goto("/truyen");
  await expect(page.getByRole("main")).toBeVisible();
});

test("auth pages render", async ({ page }) => {
  await page.goto("/dang-nhap");
  await expect(page.getByRole("button", { name: /dang nhap/i })).toBeVisible();
  await page.goto("/dang-ky");
  await expect(page.getByRole("button", { name: /dang ky/i })).toBeVisible();
});
```

- [ ] **Step 2: Run full checks**

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected: all pass. If PostgreSQL is unavailable, `build` may fail at database access; switch server queries to tolerate missing DB only for build-time static generation or run a local PostgreSQL instance and repeat.

- [ ] **Step 3: Start dev server**

```powershell
npm run dev
```

Expected: local server starts, normally at `http://localhost:3000`.

- [ ] **Step 4: Manual browser verification**

Check:

- desktop `/`, `/truyen`, `/truyen/[slug]`, `/truyen/[slug]/tap/1`;
- mobile width: bottom nav visible, mini-player above bottom nav, no overlapping text;
- mobile width: "Tai app" action is visible on relevant surfaces and either opens browser install prompt or shows manual install guidance;
- auth pages;
- account guard redirect;
- admin guard redirect for normal user;
- admin access for seeded admin;
- player play/pause/seek/speed UI responds.

- [ ] **Step 5: Visual fidelity pass**

Compare implementation against the chosen visual direction:

- main visual is Audiobook Subscription dark premium;
- player/shelf readability follows Editorial Catalog clarity;
- mobile bottom nav follows Native Mobile PWA choice;
- install/download-app flow is implemented as PWA install handling, not a separate APK download;
- no one-hue dark blue dominance;
- cover cards, player, filters, forms, and admin tables have stable dimensions and no overflow.

- [ ] **Step 6: Commit final polish**

```powershell
git add .
git commit -m "chore: verify and polish first release"
```

## Self-Review

Spec coverage:

- Public homepage, catalog, category, search, detail, episode player: Tasks 6 and 7.
- Auth, account, progress: Tasks 5, 6, and 8.
- Admin CRUD and mock VIP: Task 9.
- Prisma schema and seed: Task 3.
- Visual direction, responsive mobile layout, mobile bottom nav, and install-app option: Tasks 2, 7, and 10.
- SEO/PWA metadata: Task 2 plus page metadata during Task 7.
- Verification: Task 10.

Known implementation risk:

- Local PostgreSQL may not be running. The execution worker should either start one locally, ask for the target database URL, or complete code and mark DB-backed verification as blocked until a database is available.
- Auth.js package naming and callback types may vary by installed latest version. The execution worker must resolve exact TypeScript errors against installed package docs rather than weakening types.

Red-flag scan:

- No forbidden planning markers or unresolved file paths are intentionally left in this plan.

Type consistency:

- Public domain naming uses `Series`, `Episode`, `Category`, `Follow`, `Review`, `ListenProgress`.
- Public URLs are Vietnamese; code paths and function names are English.
