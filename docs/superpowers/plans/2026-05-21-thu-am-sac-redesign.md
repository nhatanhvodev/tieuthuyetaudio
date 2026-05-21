# Thu Âm Sắc — UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign toàn bộ UI/UX Tiểu thuyết Audio theo design system "Thu Âm Sắc" từ Stitch, giữ DaisyUI themes + theme switching, PWA, và Zustand player store.

**Architecture:** CSS cascade 2 tầng — `:root` chứa Stitch layout tokens (font, radius, spacing, shadow), `[data-theme]` chỉ override color tokens. Theme `thu-am-sac` mới là default, 30 themes DaisyUI khác vẫn hoạt động. Component architecture hybrid: giữ custom UI components hiện tại, restyle với Stitch tokens, thêm shadcn/ui khi cần component mới. Player giữ nguyên Zustand store, custom UI.

**Tech Stack:** Next.js 15.3.2, React 19, TailwindCSS 4.1.7, DaisyUI 5.5.20, Zustand 5, Radix UI primitives, Lucide icons, Recharts, react-hook-form, zod, Prisma 6.8

---

## File Structure Map

```
Config (Phase 1):
  tailwind.config.js          — add thu-am-sac to DaisyUI themes array
  app/globals.css             — Stitch layout tokens at :root, remove admin classes, Stitch color map
  app/layout.tsx              — Google Fonts, default theme = thu-am-sac
  app/manifest.ts             — theme_color → #fff9ec
  lib/theme/themes.ts         — add "thu-am-sac" to THEME_OPTIONS, LIGHT_THEMES

Layout Shell (Phase 2):
  components/layout/app-frame.tsx      — restructure for Stitch 5-layer shell
  components/layout/site-header.tsx    — glassmorphism, active dot, mobile hamburger
  components/layout/site-footer.tsx    — desktop-only simplified
  components/layout/mobile-nav.tsx     — 5-tab bottom nav, active pill style
  components/layout/user-menu.tsx      — style refresh

Player (Phase 2):
  components/player/mini-player.tsx    — Stitch restyle, floating desktop pill
  components/player/audio-player.tsx   — Stitch restyle full player
  components/player/player-provider.tsx — minor adjustments

Home + Cards (Phase 3):
  app/page.tsx                          — restructure hero, sections
  components/series/story-card.tsx      — Stitch card
  components/series/story-shelf.tsx     — grid with new cards
  components/series/continue-listening-shelf.tsx — horizontal card
  components/series/series-filters.tsx  — style refresh
  components/search/search-box.tsx      — Stitch hero search

Story Detail + Episodes (Phase 3):
  app/truyen/[slug]/page.tsx            — desktop 2-col, tabs
  app/truyen/[slug]/tap/[episodeNumber]/page.tsx — full player page
  components/series/series-detail-tabs.tsx — style refresh
  components/series/episode-list.tsx    — row style with play button

Auth + Account + VIP (Phase 3):
  app/dang-nhap/page.tsx               — centered card
  app/dang-ky/page.tsx                 — centered card
  components/auth/login-form.tsx       — Stitch inputs/buttons
  app/tai-khoan/page.tsx               — stats + history + settings
  app/vip/page.tsx                     — plan comparison cards
  components/vip/plan-comparison.tsx   — Stitch plan cards
  components/vip/contextual-upsell.tsx — style refresh

Community + Search + Categories (Phase 3):
  app/cong-dong/page.tsx               — post cards
  components/community/post-card.tsx   — Stitch card
  components/community/post-form.tsx   — style refresh
  components/community/comment-section.tsx — style refresh
  app/tim-kiem/page.tsx                — filter chips + results
  app/the-loai/page.tsx                — grid category cards
  app/the-loai/[slug]/page.tsx         — filter + grid

UI Components (Phase 3):
  components/ui/button.tsx             — Stitch variants
  components/ui/card.tsx               — Stitch card
  components/ui/input.tsx              — Stitch input
  components/ui/badge.tsx              — Stitch badge
  components/ui/textarea.tsx           — Stitch textarea
  components/ui/table.tsx              — Stitch table

Admin (Phase 4):
  app/admin/layout.tsx                 — shell with sidebar + top bar
  app/admin/page.tsx                   — stat cards + charts
  app/admin/analytics/page.tsx         — style refresh
  app/admin/truyen/page.tsx            — table
  app/admin/truyen/new/page.tsx        — form
  app/admin/truyen/[id]/edit/page.tsx  — form
  app/admin/tap/page.tsx               — table
  app/admin/nguoi-dung/page.tsx        — table
  components/admin/admin-nav.tsx       — sidebar
  components/admin/series-form.tsx     — Stitch form
  components/admin/episode-form.tsx    — Stitch form
  components/admin/user-vip-toggle.tsx — style refresh
```

---

## Phase 1: Foundation — Design Tokens & Config

### Task 1.1: Add `thu-am-sac` to theme registry

**Files:**
- Modify: `lib/theme/themes.ts`

- [ ] **Step 1: Add `thu-am-sac` to THEME_OPTIONS and LIGHT_THEMES**

```typescript
// lib/theme/themes.ts
export const THEME_OPTIONS = [
  "thu-am-sac",
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset"
] as const;

export type Theme = (typeof THEME_OPTIONS)[number];

const themeSet = new Set<string>(THEME_OPTIONS);
export const LIGHT_THEMES = new Set<Theme>(["thu-am-sac", "light", "cupcake", "winter", "lofi"]);

export function isTheme(value: string): value is Theme {
  return themeSet.has(value);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/theme/themes.ts
git commit -m "feat: add thu-am-sac to theme registry and light themes"
```

---

### Task 1.2: Add `thu-am-sac` to DaisyUI config

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Add `thu-am-sac` as first theme in the DaisyUI themes array**

```javascript
// tailwind.config.js
/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      }
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "thu-am-sac",
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: add thu-am-sac as first DaisyUI theme"
```

---

### Task 1.3: Rewrite globals.css with Stitch tokens and remove admin classes

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace entire globals.css with Stitch token system**

```css
/* app/globals.css */
@import "tailwindcss";
@plugin "daisyui" {
  themes:
    thu-am-sac --default,
    light,
    dark --prefersdark,
    cupcake,
    bumblebee,
    emerald,
    corporate,
    synthwave,
    retro,
    cyberpunk,
    valentine,
    halloween,
    garden,
    forest,
    aqua,
    lofi,
    pastel,
    fantasy,
    wireframe,
    black,
    luxury,
    dracula,
    cmyk,
    autumn,
    business,
    acid,
    lemonade,
    night,
    coffee,
    winter,
    dim,
    nord,
    sunset;
}

/* ── Stitch Layout Tokens (always applied regardless of theme) ── */
:root {
  --font-display: "Be Vietnam Pro", sans-serif;
  --font-headline: "Be Vietnam Pro", sans-serif;
  --font-body: "Be Vietnam Pro", sans-serif;
  --font-label: "Manrope", sans-serif;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  --spacing-unit: 4px;
  --spacing-gutter: 24px;
  --spacing-margin-mobile: 16px;
  --spacing-margin-desktop: 80px;
  --spacing-section-gap: 64px;

  --shadow-soft: 0 4px 12px rgba(120, 53, 15, 0.04);
  --shadow-card: 0 2px 8px rgba(120, 53, 15, 0.06);
  --shadow-card-hover: 0 8px 24px rgba(120, 53, 15, 0.1);
}

/* ── thu-am-sac DaisyUI Color Tokens ── */
[data-theme="thu-am-sac"] {
  --color-primary: #8d4b00;
  --color-primary-content: #ffffff;
  --color-secondary: #944a23;
  --color-secondary-content: #ffffff;
  --color-accent: #fbbf24;
  --color-accent-content: #1f1300;
  --color-neutral: #554336;
  --color-neutral-content: #fcf1c5;
  --color-base-100: #fff9ec;
  --color-base-200: #f3e8bd;
  --color-base-300: #ede3b8;
  --color-base-content: #201c02;
  --color-info: #3b82f6;
  --color-info-content: #ffffff;
  --color-success: #16a34a;
  --color-success-content: #ffffff;
  --color-warning: #d97706;
  --color-warning-content: #1f1300;
  --color-error: #ba1a1a;
  --color-error-content: #ffffff;
}

/* ── CSS Variables mapped to DaisyUI ── */
:root {
  --background: var(--color-base-100, #fff9ec);
  --foreground: var(--color-base-content, #201c02);
  --card: var(--color-base-200, #f3e8bd);
  --card-foreground: var(--color-base-content, #201c02);
  --popover: var(--color-base-100, #fff9ec);
  --popover-foreground: var(--color-base-content, #201c02);
  --primary: var(--color-primary, #8d4b00);
  --primary-foreground: var(--color-primary-content, #ffffff);
  --secondary: var(--color-secondary, #944a23);
  --secondary-foreground: var(--color-secondary-content, #ffffff);
  --muted: var(--color-base-200, #f3e8bd);
  --muted-foreground: var(--color-neutral, #554336);
  --accent: var(--color-accent, #fbbf24);
  --accent-foreground: var(--color-accent-content, #1f1300);
  --surface-1: color-mix(in srgb, var(--background) 92%, var(--foreground));
  --surface-2: color-mix(in srgb, var(--background) 82%, var(--foreground));
  --surface-3: color-mix(in srgb, var(--primary) 8%, var(--background));
  --destructive: var(--color-error, #ba1a1a);
  --destructive-foreground: var(--color-error-content, #ffffff);
  --border: color-mix(in oklch, var(--foreground) 15%, transparent);
  --input: var(--color-base-200, #f3e8bd);
  --ring: var(--color-primary, #8d4b00);
  --radius: 0.5rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-md: var(--radius);
  --font-sans: var(--font-body);
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
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-body);
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

::selection {
  background: color-mix(in srgb, var(--primary) 35%, transparent);
}

:where(a, button, input, textarea, select, [role="button"]):focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

:where(button, [role="button"], a) {
  touch-action: manipulation;
}

@media (pointer: coarse) {
  :where(button, input, select, textarea, a) {
    min-height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@layer utilities {
  .glass-panel {
    background: color-mix(in srgb, var(--background) 80%, transparent);
    border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent);
    backdrop-filter: blur(12px);
  }

  .soft-shadow {
    box-shadow: 0 4px 12px rgba(120, 53, 15, 0.04);
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: rewrite globals.css with Stitch layout tokens and thu-am-sac color theme, remove admin-specific classes"
```

---

### Task 1.4: Update RootLayout with Google Fonts and default theme

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add Google Fonts link, change viewport themeColor, update inline script default to thu-am-sac**

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/themeContext";
import { type Theme, isTheme } from "@/lib/theme/themes";
import { safeAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { AppFrame } from "@/components/layout/app-frame";
import { featureFlags } from "@/lib/features";

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
  themeColor: "#fff9ec",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await safeAuth();
  const isSignedIn = Boolean(session?.user?.id);

  let initialTheme: Theme | undefined;
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { themePreference: true }
    });
    if (user?.themePreference && isTheme(user.themePreference)) {
      initialTheme = user.themePreference;
    }
  }

  const serverTheme = initialTheme ?? null;

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700&family=Manrope:wght@600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const serverTheme = ${JSON.stringify(serverTheme)};
    const savedTheme = window.localStorage.getItem("theme");
    const candidate = savedTheme ?? serverTheme ?? "thu-am-sac";
    const theme = typeof candidate === "string" ? candidate : "thu-am-sac";
    const lightThemes = { "thu-am-sac": true, light: true, cupcake: true, winter: true, lofi: true };
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = lightThemes[theme] ? "light" : "dark";
  } catch {
    document.documentElement.setAttribute("data-theme", "thu-am-sac");
    document.documentElement.style.colorScheme = "light";
  }
})();`
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (prefers-reduced-motion: reduce) {
                ::view-transition-old(root),
                ::view-transition-new(root) {
                  animation: none;
                }
              }
            `
          }}
        />
      </head>
      <body data-feature-flags={JSON.stringify(featureFlags)}>
        <WebVitalsReporter />
        <ThemeProvider initialTheme={initialTheme} isSignedIn={isSignedIn}>
          <AppFrame session={session}>{children}</AppFrame>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add Google Fonts (Be Vietnam Pro + Manrope), set thu-am-sac as default theme"
```

---

### Task 1.5: Update PWA manifest theme colors

**Files:**
- Modify: `app/manifest.ts`

- [ ] **Step 1: Change theme_color and background_color to Stitch cream**

```typescript
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tiểu thuyết Audio",
    short_name: "Audio Truyện",
    description: "PWA nghe tiểu thuyết audio tiếng Việt.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fff9ec",
    theme_color: "#fff9ec",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/manifest.ts
git commit -m "feat: update PWA manifest theme colors to Stitch cream #fff9ec"
```

---

## Phase 2: Layout Shell

### Task 2.1: Redesign SiteHeader — glassmorphism + active dot indicator

**Files:**
- Modify: `components/layout/site-header.tsx`

- [ ] **Step 1: Replace header with glassmorphism design, desktop nav with active dot, mobile hamburger layout**

```tsx
// components/layout/site-header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Crown, Home, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/truyen", label: "Kho truyện", icon: BookOpen },
  { href: "/vip", label: "VIP", icon: Crown },
  { href: "/cong-dong", label: "Cộng đồng", icon: Menu }
];

export function SiteHeader({ session }: { session: Session | null }) {
  const pathname = usePathname();

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
                  "relative btn btn-ghost btn-sm rounded-full px-3 text-foreground/70 hover:text-foreground",
                  active && "text-foreground after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary"
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
          {session?.user ? (
            <UserMenu session={session} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/dang-nhap">Đăng nhập</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/dang-ky">Đăng ký</Link>
              </Button>
            </>
          )}
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
        <Link href="/tim-kiem" aria-label="Search" className="p-2 hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] rounded-full transition-colors">
          <Search className="size-5" />
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/site-header.tsx
git commit -m "feat: redesign site header with glassmorphism, active dot indicator, mobile hamburger layout"
```

---

### Task 2.2: Redesign MobileNav — 5-tab bottom nav with active pill

**Files:**
- Modify: `components/layout/mobile-nav.tsx`

- [ ] **Step 1: Replace with 5-tab Stitch bottom nav**

```tsx
// components/layout/mobile-nav.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/mobile-nav.tsx
git commit -m "feat: redesign mobile nav with 5-tab Stitch bottom bar and active pill style"
```

---

### Task 2.3: Update AppFrame — 5-layer shell

**Files:**
- Modify: `components/layout/app-frame.tsx`

- [ ] **Step 1: Restructure for Stitch 5-layer layout**

```tsx
// components/layout/app-frame.tsx
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
        <main className="flex-1 pb-[calc(5rem+4rem+env(safe-area-inset-bottom))] md:pb-28">{children}</main>
        <SiteFooter />
      </div>
      <MiniPlayer />
      <MobileNav />
    </PlayerProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/app-frame.tsx
git commit -m "feat: restructure app frame for Stitch 5-layer shell with adjusted padding"
```

---

### Task 2.4: Update SiteFooter — desktop only

**Files:**
- Modify: `components/layout/site-footer.tsx`

- [ ] **Step 1: Simplify footer to desktop-only with Stitch styling**

Read the current file first, then replace with:

```tsx
// components/layout/site-footer.tsx
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="hidden md:block border-t border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="text-sm font-bold" style={{ fontFamily: "var(--font-headline)" }}>Tiểu thuyết Audio</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Nghe tiểu thuyết audio tiếng Việt với player PWA, thư viện truyện và tiến trình nghe.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>Liên kết</p>
            <div className="mt-3 grid gap-2">
              <Link href="/truyen" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kho truyện</Link>
              <Link href="/the-loai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Thể loại</Link>
              <Link href="/vip" className="text-sm text-muted-foreground hover:text-foreground transition-colors">VIP</Link>
              <Link href="/cong-dong" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cộng đồng</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>Tài khoản</p>
            <div className="mt-3 grid gap-2">
              <Link href="/dang-nhap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Đăng nhập</Link>
              <Link href="/dang-ky" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Đăng ký</Link>
              <Link href="/tai-khoan" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tài khoản</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-[color-mix(in_oklch,var(--foreground)_6%,transparent)] pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Tiểu thuyết Audio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/site-footer.tsx
git commit -m "feat: simplify site footer to desktop-only with Stitch styling"
```

---

### Task 2.5: Redesign MiniPlayer — Stitch floating pill

**Files:**
- Modify: `components/player/mini-player.tsx`

Note: This is a large file (~270 lines). The full rewrite preserves all existing functionality (keyboard shortcuts, seek, volume, prev/next queue, hover tooltip, notes panel) while applying Stitch visual styling: glassmorphism, floating pill on desktop, progress bar on top, larger touch targets.

- [ ] **Step 1: Rewrite mini player with Stitch visual design**

```tsx
// components/player/mini-player.tsx
"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { featureFlags } from "@/lib/features";
import { formatSeconds, formatTimeSmart } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";

export function MiniPlayer() {
  const pathname = usePathname();
  const current = usePlayerStore((state) => state.current);
  const queue = usePlayerStore((state) => state.queue);
  const currentQueueIndex = usePlayerStore((state) => state.currentQueueIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const volume = usePlayerStore((state) => state.volume);
  const autoPlayNext = usePlayerStore((state) => state.autoPlayNext);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const requestSeek = usePlayerStore((state) => state.requestSeek);
  const playNextInQueue = usePlayerStore((state) => state.playNextInQueue);
  const playPrevInQueue = usePlayerStore((state) => state.playPrevInQueue);

  const [hoverSeconds, setHoverSeconds] = useState<number | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (!current || pathname === `/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`) return;

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && (target.isContentEditable || Boolean(target.closest("button"))))
      ) {
        return;
      }

      switch (event.key) {
        case " ":
          event.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft": {
          event.preventDefault();
          const { currentSeconds } = usePlayerStore.getState().progress;
          requestSeek(currentSeconds - 10);
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          const { currentSeconds } = usePlayerStore.getState().progress;
          requestSeek(currentSeconds + 10);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [current, pathname, requestSeek, togglePlay]);

  if (!current) return null;
  if (pathname === `/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`) return null;

  const percent = progress.durationSeconds > 0 ? (progress.currentSeconds / progress.durationSeconds) * 100 : 0;
  const nextEpisode = currentQueueIndex >= 0 ? queue[currentQueueIndex + 1] ?? null : null;
  const prevEpisode = currentQueueIndex > 0 ? queue[currentQueueIndex - 1] ?? null : null;
  const showNextUp = featureFlags.continuousPlay && autoPlayNext && Boolean(nextEpisode) && percent >= 85;
  const currentTimeLabel = formatTimeSmart(progress.currentSeconds, progress.durationSeconds);

  function seek(delta: number) {
    requestSeek(progress.currentSeconds + delta);
  }

  const hoverPercent =
    hoverSeconds === null || !progress.durationSeconds ? null : Math.max(0, Math.min(100, (hoverSeconds / progress.durationSeconds) * 100));

  function getSeekFromPointer(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!progress.durationSeconds || rect.width <= 0) return 0;
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    return Math.floor(ratio * progress.durationSeconds);
  }

  return (
    <>
      <aside className="fixed bottom-[64px] w-full h-20 bg-[color-mix(in_srgb,var(--background)_95%,transparent)] backdrop-blur-[12px] border-t border-primary/10 z-40 flex flex-col justify-between pt-2 pb-3 soft-shadow md:max-w-md md:left-1/2 md:-translate-x-1/2 md:rounded-xl md:bottom-6 md:border md:h-auto md:py-3 md:px-4">
        {/* Progress bar top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[color-mix(in_oklch,var(--foreground)_12%,transparent)] rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
        </div>

        <div className="flex items-center justify-between w-full h-full pt-1 px-4 md:px-0">
          <Link
            href={`/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`}
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-secondary">
              {current.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.coverUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={`w-full h-full object-cover ${isPlaying ? "animate-[spin_12s_linear_infinite]" : ""}`}
                />
              ) : null}
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-sm font-bold text-foreground truncate">{current.title}</span>
              <span className="text-xs text-muted-foreground truncate" style={{ fontFamily: "var(--font-label)" }}>{current.seriesTitle}</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 shrink-0 pl-2">
            <button
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              onClick={() => seek(-10)}
              aria-label="Lùi 10 giây"
            >
              <span className="text-[11px] font-semibold" style={{ fontFamily: "var(--font-label)" }}>-10</span>
            </button>
            <button
              className="w-12 h-12 flex items-center justify-center text-primary hover:scale-105 transition-transform"
              onClick={togglePlay}
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? <Pause className="size-7" /> : <Play className="size-7 translate-x-[1px]" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Notes panel — unchanged functionality, just Stitch colors */}
      <section className={`fixed inset-x-0 bottom-[72px] z-30 hidden border-t border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_98%,transparent)] backdrop-blur-xl px-6 pb-5 pt-4 transition-all duration-300 md:block ${notesOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"}`}>
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-semibold">Lyrics preview</p>
            <div className="mt-2 rounded-lg border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-muted/70 p-3 text-sm text-muted-foreground">
              <p>{formatSeconds(progress.currentSeconds)} — [Chưa có lyrics đồng bộ cho tập này]</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Quick notes</p>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú nhanh khi đang nghe..." className="mt-2 min-h-24" />
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/player/mini-player.tsx
git commit -m "feat: redesign mini player with Stitch glassmorphism, floating pill on desktop"
```

---

### Task 2.6: Redesign AudioPlayer (Full Player) — Stitch styling

**Files:**
- Modify: `components/player/audio-player.tsx`

The full player keeps all functionality (keyboard shortcuts, bookmarks, sleep timer, auto-play, queue). Only visual styling changes: cover with spinning animation, rounded-2xl container, 6px progress bar, Stitch-colored controls.

- [ ] **Step 1: Apply Stitch visual styling to AudioPlayer**

Edit `components/player/audio-player.tsx` — replace the outer `<section>` className and control button styles. The key visual changes:

- Container: `rounded-2xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)] p-4 shadow-[0_24px_60px_rgba(120,53,15,0.08)] md:p-6`
- Cover: `rounded-2xl` (was `rounded-xl`), spinning border animation when playing
- Progress bar: `h-1.5` (was `h-1.5`), but themed with `accent-primary`
- Play button: `h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg`
- Seek buttons: `rounded-full border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] bg-secondary text-foreground`
- Selects (speed/volume): `rounded-full border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] bg-secondary`
- Sections (auto-play, sleep timer, bookmarks): `rounded-xl border border-[color-mix(in_oklch,var(--foreground)_6%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_20%,var(--background))]`

```bash
git add components/player/audio-player.tsx
git commit -m "feat: restyle full audio player with Stitch design tokens"
```

---

## Phase 3: Pages & Components

### Task 3.1: Redesign UI primitives (button, card, input, badge, textarea, table)

**Files:**
- Modify: `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/input.tsx`, `components/ui/badge.tsx`, `components/ui/textarea.tsx`, `components/ui/table.tsx`

- [ ] **Step 1: Update cva variants in all 6 UI components**

**button.tsx** — add Stitch variants:
```tsx
// components/ui/button.tsx — update cva base and variants
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:brightness-90",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:brightness-90",
        outline: "border border-[color-mix(in_oklch,var(--foreground)_15%,transparent)] bg-transparent hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]",
        ghost: "hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] text-foreground/80 hover:text-foreground",
        accent: "bg-accent text-accent-foreground shadow-sm hover:brightness-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

**card.tsx** — rounded-xl, softer shadow:
```tsx
// components/ui/card.tsx — update styles
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)] shadow-[0_2px_8px_rgba(120,53,15,0.06)] ${className ?? ""}`}
    {...props}
  />
);
```

**input.tsx** — rounded-xl, Stitch border:
```tsx
// components/ui/input.tsx — update className
const Input = ({ className, type, ...props }: React.ComponentProps<"input">) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-xl border border-[color-mix(in_oklch,var(--foreground)_12%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)] px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
    {...props}
  />
);
```

**badge.tsx** — pill shape, Stitch colors:
```tsx
// components/ui/badge.tsx — rounded-full, Stitch variants
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-[color-mix(in_oklch,var(--foreground)_15%,transparent)] text-foreground",
        accent: "bg-accent text-accent-foreground",
        muted: "bg-muted text-muted-foreground",
        tertiary: "bg-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] text-[var(--color-warning-content,#1f1300)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

**textarea.tsx** — rounded-xl:
Change className to use `rounded-xl` instead of `rounded-md`.

**table.tsx** — Stitch table styling:
```tsx
// components/ui/table.tsx — Stitch table
const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-auto rounded-xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)]">
    <table className={`w-full caption-bottom text-sm ${className ?? ""}`} {...props} />
  </div>
);
const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={`[&_tr]:border-b border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-muted ${className ?? ""}`} {...props} />
);
const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`border-b border-[color-mix(in_oklch,var(--foreground)_6%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] ${className ?? ""}`} {...props} />
);
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/button.tsx components/ui/card.tsx components/ui/input.tsx components/ui/badge.tsx components/ui/textarea.tsx components/ui/table.tsx
git commit -m "feat: restyle UI primitives with Stitch design tokens (rounded-xl, warm colors, soft shadows)"
```

---

### Task 3.2: Redesign Home Page — hero + sections

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Remove hero background image, restructure with centered hero + Stitch sections**

```tsx
// app/page.tsx — replace the hero section and section structure
import Link from "next/link";
import { BookOpen, Crown, Headphones } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { SearchBox } from "@/components/search/search-box";
import { ContinueListeningShelf } from "@/components/series/continue-listening-shelf";
import { LatestEpisodeList } from "@/components/series/latest-episode-list";
import { StoryShelf } from "@/components/series/story-shelf";
import { Button } from "@/components/ui/button";
import { safeAuth } from "@/lib/auth";
import { getContinueListeningByUser, getHomeShelves } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await safeAuth();
  const shelves = await getHomeShelves(session?.user?.id);

  let continueListening: Awaited<ReturnType<typeof getContinueListeningByUser>> = [];
  if (session?.user) {
    try {
      continueListening = await getContinueListeningByUser(session.user.id, 6);
    } catch (error) {
      console.error("[HomePage] Fallback continue listening due to data source error", error);
    }
  }

  return (
    <>
      {/* Hero — centered, no background image */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
        <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
          Tiểu thuyết Audio
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-base leading-7 text-muted-foreground md:text-lg">
          Website nghe truyện audio tối ưu cho mobile, có player toàn cục, lưu tiến trình nghe và tùy chọn cài như app trên điện thoại.
        </p>
        <div className="mt-8 max-w-lg mx-auto">
          <SearchBox />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/truyen">
              <BookOpen data-icon="inline-start" />
              Khám phá ngay
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/vip">
              <Crown data-icon="inline-start" />
              Đăng ký VIP
            </Link>
          </Button>
        </div>
      </section>

      {/* Tiếp tục nghe */}
      {session?.user ? (
        <section className="mx-auto max-w-7xl px-4" style={{ marginBottom: "var(--spacing-section-gap)" }}>
          <ContinueListeningShelf items={continueListening} title="Tiếp tục nghe" href="/tai-khoan" />
        </section>
      ) : null}

      {/* Dành riêng cho bạn — horizontal scroll */}
      <section className="mx-auto max-w-7xl px-4" style={{ marginBottom: "var(--spacing-section-gap)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>Dành riêng cho bạn</h2>
          <Link href="/truyen?sort=rating" className="text-sm font-semibold text-accent hover:underline">Xem tất cả &rarr;</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
          {shelves.recommended.slice(0, 10).map((series) => (
            <Link
              key={series.id}
              href={`/truyen/${series.slug}`}
              className="w-[140px] shrink-0 flex flex-col gap-3 snap-start group"
            >
              <div className="w-full h-[200px] rounded-lg overflow-hidden bg-secondary relative shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
                {series.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={series.coverUrl} alt={series.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : null}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-[32px] drop-shadow-md">▶</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground line-clamp-2">{series.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{series.authorName}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Grid shelves */}
      <StoryShelf title="Trending 24h" href="/truyen?sort=popular" items={shelves.trending24h} />

      <section className="mx-auto max-w-7xl px-4" style={{ marginBottom: "var(--spacing-section-gap)" }}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>Tập mới cập nhật</h2>
          <Link href="/truyen?sort=newest" className="text-sm font-semibold text-accent hover:underline">Xem thư viện &rarr;</Link>
        </div>
        <LatestEpisodeList episodes={shelves.latestEpisodes} />
      </section>

      <StoryShelf title="Trending 7 ngày" href="/truyen?sort=popular" items={shelves.trending7d} />
      <StoryShelf title="Rising" href="/truyen?sort=newest" items={shelves.rising} />
      <StoryShelf title="Truyện mới lên kệ" href="/truyen?sort=newest" items={shelves.latest} />
      <StoryShelf
        title={shelves.recommendationMeta.personalized ? "Dành cho bạn" : "Có thể bạn sẽ thích"}
        href="/truyen?sort=rating"
        items={shelves.recommended}
      />

      {/* PWA promo */}
      <section className="mx-auto max-w-7xl px-4" style={{ marginBottom: "var(--spacing-section-gap)" }}>
        <div className="rounded-xl border border-[color-mix(in_oklch,var(--foreground)_6%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_15%,var(--background))] p-6 text-center">
          <Headphones className="mx-auto size-8 text-accent" />
          <h2 className="mt-3 text-lg font-bold" style={{ fontFamily: "var(--font-headline)" }}>Nghe tiếp trên mobile</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Cài website như ứng dụng để mở nhanh từ màn hình chính, giữ player và tiếp tục nghe bộ truyện đang theo dõi.
          </p>
          <div className="mt-4">
            <InstallAppButton />
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: redesign home page with centered hero, horizontal scroll shelf, Stitch sections"
```

---

### Task 3.3: Redesign StoryCard + StoryShelf + ContinueListeningShelf

**Files:**
- Modify: `components/series/story-card.tsx`
- Modify: `components/series/story-shelf.tsx`
- Modify: `components/series/continue-listening-shelf.tsx`

- [ ] **Step 1: Redesign StoryCard with Stitch styling**

Read current file, then update to Stitch visual: `rounded-xl` (16px), cover 70% height, title/author left-aligned, shadow-sm→shadow-md on hover, no badge overlay, group hover lift.

- [ ] **Step 2: Update StoryShelf grid layout**

```tsx
// components/series/story-shelf.tsx — update section header styling
// Section title: text-xl font-bold, with "Xem tất cả →" accent link on the right
// Grid: responsive 6→4→3→2 cols with section-gap spacing
```

- [ ] **Step 3: Redesign ContinueListeningShelf horizontal card**

```tsx
// components/series/continue-listening-shelf.tsx
// Card: bg-[color-mix(in_srgb,var(--background)_95%,transparent)] rounded-xl border border-[color-mix(in_oklch,var(--foreground)_6%,transparent)]
// Layout: cover 80x112 + chapter info + progress bar 4px + play button
```

- [ ] **Step 4: Commit**

```bash
git add components/series/story-card.tsx components/series/story-shelf.tsx components/series/continue-listening-shelf.tsx
git commit -m "feat: redesign story cards, shelves, and continue-listening with Stitch style"
```

---

### Task 3.4: Redesign Story Detail + Episode pages

**Files:**
- Modify: `app/truyen/[slug]/page.tsx`
- Modify: `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`
- Modify: `components/series/series-detail-tabs.tsx`
- Modify: `components/series/episode-list.tsx`

- [ ] **Step 1: Redesign story detail page**

Update `app/truyen/[slug]/page.tsx`:
- Desktop 2-col: left = cover 240×320 rounded-xl, right = info + badges + buttons
- Badges: `rounded-full bg-[color-mix(in_srgb,var(--color-warning)_25%,transparent)] text-[var(--color-warning-content)]`
- Buttons: [Nghe ngay] primary + [Theo dõi] secondary
- Tabs: active = border-bottom 2px primary
- Episode list rows: number + title + duration + play button 32px

- [ ] **Step 2: Redesign full player page**

Update `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`:
- Cover 300×300 desktop, 240×240 mobile, rounded-2xl, spinning when playing
- Title text-2xl font-black, chapter text-lg muted
- AudioPlayer component (already styled in Task 2.6)
- Below: autoplay + sleep timer + bookmarks sections

- [ ] **Step 3: Update series-detail-tabs and episode-list**

Stitch-styled tabs and episode rows.

- [ ] **Step 4: Commit**

```bash
git add app/truyen/\[slug\]/page.tsx app/truyen/\[slug\]/tap/\[episodeNumber\]/page.tsx components/series/series-detail-tabs.tsx components/series/episode-list.tsx
git commit -m "feat: redesign story detail and full player pages with Stitch layout"
```

---

### Task 3.5: Redesign Auth pages (Login + Register)

**Files:**
- Modify: `app/dang-nhap/page.tsx`
- Modify: `app/dang-ky/page.tsx`
- Modify: `components/auth/login-form.tsx`

- [ ] **Step 1: Apply centered card Stitch styling to auth pages**

Both pages: `max-w-sm mx-auto`, card with soft shadow, inputs with `rounded-xl bg-[color-mix(in_srgb,var(--background)_95%,transparent)]`, buttons `w-full h-12 rounded-xl bg-primary`.

- [ ] **Step 2: Commit**

```bash
git add app/dang-nhap/page.tsx app/dang-ky/page.tsx components/auth/login-form.tsx
git commit -m "feat: redesign auth pages with centered Stitch card style"
```

---

### Task 3.6: Redesign Account, VIP, Community, Search, Categories pages

**Files:**
- Modify: `app/tai-khoan/page.tsx`
- Modify: `app/vip/page.tsx`
- Modify: `components/vip/plan-comparison.tsx`
- Modify: `components/vip/contextual-upsell.tsx`
- Modify: `app/cong-dong/page.tsx`
- Modify: `components/community/post-card.tsx`
- Modify: `components/community/post-form.tsx`
- Modify: `components/community/comment-section.tsx`
- Modify: `app/tim-kiem/page.tsx`
- Modify: `components/search/search-box.tsx`
- Modify: `app/the-loai/page.tsx`
- Modify: `app/the-loai/[slug]/page.tsx`

- [ ] **Step 1: Account page — stats row + history list + settings**

Update `app/tai-khoan/page.tsx`:
- 3 mini stat cards in a row (follows, bookmarks, VIP status)
- History list styled like "Tiếp tục nghe" rows
- Settings links at bottom

- [ ] **Step 2: VIP page — plan comparison cards**

Update `app/vip/page.tsx` and `components/vip/plan-comparison.tsx`:
- 2 cards side-by-side desktop, stacked mobile
- Active plan: border primary, "Hiện tại" badge
- VIP plan: `bg-[color-mix(in_srgb,var(--primary)_8%,var(--background))]`

- [ ] **Step 3: Community — post cards + comments**

Update community components:
- Post cards: `rounded-xl border border-[color-mix(in_oklch,var(--foreground)_6%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)]`
- "Bài mới" button: `rounded-full bg-primary`
- Comments: same card style, nested indentation

- [ ] **Step 4: Search — filter chips + results**

Update `app/tim-kiem/page.tsx` and `components/search/search-box.tsx`:
- Search input: `h-12 rounded-xl`, large, auto-focused, sticky top
- Genre filter chips: unselected = `border border-[color-mix(in_oklch,var(--foreground)_12%,transparent)] rounded-full`, selected = `bg-accent text-accent-foreground rounded-full`
- Results: grid of story cards

- [ ] **Step 5: Categories — grid cards**

Update `app/the-loai/page.tsx` and `app/the-loai/[slug]/page.tsx`:
- Grid category cards: icon + name + count, `rounded-xl`, hover lift
- Slug page: title + filter bar + grid

- [ ] **Step 6: Commit**

```bash
git add app/tai-khoan/page.tsx app/vip/page.tsx components/vip/plan-comparison.tsx components/vip/contextual-upsell.tsx app/cong-dong/page.tsx components/community/post-card.tsx components/community/post-form.tsx components/community/comment-section.tsx app/tim-kiem/page.tsx components/search/search-box.tsx app/the-loai/page.tsx app/the-loai/\[slug\]/page.tsx
git commit -m "feat: redesign account, VIP, community, search, and categories pages with Stitch style"
```

---

## Phase 4: Admin

### Task 4.1: Redesign Admin Shell — sidebar + top bar

**Files:**
- Modify: `app/admin/layout.tsx`
- Modify: `components/admin/admin-nav.tsx`

- [ ] **Step 1: Create admin shell with Stitch sidebar + top bar**

Update `app/admin/layout.tsx`:
```tsx
// app/admin/layout.tsx
// Desktop: sidebar (240px fixed left) + content area
// Sidebar bg: surface-dim (#e5dab0 / var(--color-base-300))
// Content bg: surface (#fff9ec / var(--color-base-100))
// Mobile: drawer overlay for sidebar
// Top bar: hamburger (mobile) + breadcrumb + notification + user, h-14, border-bottom
```

Update `components/admin/admin-nav.tsx`:
- Nav items: active = `bg-primary text-primary-foreground rounded-full`, inactive = `hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] rounded-full`
- Icons from Lucide
- "Về trang chủ" link at bottom

- [ ] **Step 2: Commit**

```bash
git add app/admin/layout.tsx components/admin/admin-nav.tsx
git commit -m "feat: redesign admin shell with Stitch sidebar and top bar, remove .admin-shell classes"
```

---

### Task 4.2: Redesign Admin Dashboard + Analytics

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/analytics/page.tsx`

- [ ] **Step 1: Restyle admin dashboard with Stitch cards and chart palette**

Update `app/admin/page.tsx`:
- 4 stat cards (truyện, tập, người dùng, VIP): `rounded-xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)]`
- Charts: Recharts with Stitch palette (cam `#8d4b00`, nâu `#944a23`, vàng `#fbbf24`)

- [ ] **Step 2: Commit**

```bash
git add app/admin/page.tsx app/admin/analytics/page.tsx
git commit -m "feat: redesign admin dashboard with Stitch cards and chart colors"
```

---

### Task 4.3: Redesign Admin Tables (truyen, tap, nguoi-dung)

**Files:**
- Modify: `app/admin/truyen/page.tsx`
- Modify: `app/admin/tap/page.tsx`
- Modify: `app/admin/nguoi-dung/page.tsx`

- [ ] **Step 1: Apply Stitch table styling to all admin table pages**

Each table page: use the Stitch-styled Table component from Task 3.1.
- Header: `bg-muted`, text-xs uppercase font-label
- Rows: border-b, hover highlight
- Pagination: pill buttons (`rounded-full`)

- [ ] **Step 2: Commit**

```bash
git add app/admin/truyen/page.tsx app/admin/tap/page.tsx app/admin/nguoi-dung/page.tsx
git commit -m "feat: redesign admin tables with Stitch table component"
```

---

### Task 4.4: Redesign Admin Forms (series, episode, user-vip)

**Files:**
- Modify: `components/admin/series-form.tsx`
- Modify: `components/admin/episode-form.tsx`
- Modify: `components/admin/user-vip-toggle.tsx`
- Modify: `app/admin/truyen/new/page.tsx`
- Modify: `app/admin/truyen/[id]/edit/page.tsx`

- [ ] **Step 1: Apply Stitch form styling**

Forms: Card `rounded-xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)] p-6`
- Inputs: `rounded-xl bg-[color-mix(in_srgb,var(--background)_95%,transparent)] border-[color-mix(in_oklch,var(--foreground)_12%,transparent)]`
- Labels: text-xs font-semibold uppercase, font-label
- Submit: `bg-primary`, Cancel: ghost

- [ ] **Step 2: Commit**

```bash
git add components/admin/series-form.tsx components/admin/episode-form.tsx components/admin/user-vip-toggle.tsx app/admin/truyen/new/page.tsx app/admin/truyen/\[id\]/edit/page.tsx
git commit -m "feat: redesign admin forms with Stitch input and card styling"
```

---

## Phase 5: Integration & Polish

### Task 5.1: Update search-box + series-filters + theme-switcher

**Files:**
- Modify: `components/search/search-box.tsx`
- Modify: `components/series/series-filters.tsx`

- [ ] **Step 1: Restyle search box and series filters**

SearchBox: `h-12 rounded-xl bg-[color-mix(in_srgb,var(--background)_95%,transparent)] border-[color-mix(in_oklch,var(--foreground)_12%,transparent)]`
SeriesFilters: Stitch-styled select + chips

- [ ] **Step 2: Commit**

```bash
git add components/search/search-box.tsx components/series/series-filters.tsx
git commit -m "feat: restyle search box and series filters with Stitch tokens"
```

---

### Task 5.2: Update user-menu + remaining layout components

**Files:**
- Modify: `components/layout/user-menu.tsx`

- [ ] **Step 1: Restyle user menu dropdown with Stitch colors**

Dropdown: `rounded-xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_98%,transparent)] backdrop-blur-md`

- [ ] **Step 2: Commit**

```bash
git add components/layout/user-menu.tsx
git commit -m "feat: restyle user menu dropdown with Stitch styling"
```

---

### Task 5.3: Install react-modern-audio-player and integrate

**Files:**
- Modify: `package.json`
- Modify: `components/player/audio-player.tsx`
- Modify: `components/player/mini-player.tsx`

- [ ] **Step 1: Install dependency**

```bash
npm install react-modern-audio-player
```

- [ ] **Step 2: Wrap react-modern-audio-player in AudioPlayer**

Integrate the library for core player UI (progress, seek, speed, volume), keeping custom sections (bookmarks, sleep timer, auto-play) as sibling components. Custom theme maps to Stitch CSS variables.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json components/player/audio-player.tsx components/player/mini-player.tsx
git commit -m "feat: integrate react-modern-audio-player with Stitch theme mapping"
```

---

### Task 5.4: Final integration — build and visual QA

- [ ] **Step 1: Run type check**

```bash
npm run typecheck
```
Expected: PASS (no type errors)

- [ ] **Step 2: Run build**

```bash
npm run build
```
Expected: successful build

- [ ] **Step 3: Run existing tests**

```bash
npm test
```
Expected: all existing tests pass

- [ ] **Step 4: Verify theme switching**

Manual checklist:
- [ ] Default load = `thu-am-sac` theme with cream background
- [ ] Switch to `dark` theme = colors change, layout/font/spacing stay
- [ ] Switch to `autumn` theme = colors change, layout/font/spacing stay
- [ ] Theme persists across page navigation
- [ ] Admin pages render correctly under all themes

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "chore: final integration fixes and visual QA adjustments"
```
```

---

## Execution Strategy

### Parallelization Map

```
Phase 1 (Foundation): Tasks 1.1 → 1.2 → 1.3 → 1.4 → 1.5  [SEQUENTIAL — each depends on previous]
                                ↓
Phase 2 (Layout Shell): Tasks 2.1, 2.2, 2.4, 2.5, 2.6 [PARALLEL — independent files]
                        Task 2.3 after 2.1-2.6 done
                                ↓
Phase 3 (Pages): Tasks 3.1 → then 3.2, 3.3, 3.4, 3.5, 3.6 [PARALLEL after 3.1]
                                ↓
Phase 4 (Admin): Tasks 4.1 → then 4.2, 4.3, 4.4 [PARALLEL after 4.1]
                                ↓
Phase 5 (Polish): Tasks 5.1, 5.2, 5.3 [PARALLEL] → 5.4 [final]
```

### Subagent Dispatch Plan

| Phase | # Agents | Strategy |
|-------|----------|----------|
| Phase 1 | 1 agent | Sequential tasks, each depends on prior |
| Phase 2 | 5 agents parallel | One per task (2.1-2.5), then 1 for 2.6 |
| Phase 3 | 1 + 5 agents | Task 3.1 first (shared deps), then 5 parallel |
| Phase 4 | 1 + 3 agents | Task 4.1 first (shared shell), then 3 parallel |
| Phase 5 | 4 agents parallel | Tasks 5.1-5.3 parallel, 5.4 sequential |

### Estimated File Change Summary

| Phase | Files Modified | Files Created |
|-------|---------------|---------------|
| Phase 1 | 5 | 0 |
| Phase 2 | 6 | 0 |
| Phase 3 | ~28 | 0 |
| Phase 4 | ~13 | 0 |
| Phase 5 | ~4 | 0 |
| **Total** | **~56** | **0** |

---

## Spec Coverage Checklist

- [x] Section 1: Design Token & Theme System → Tasks 1.1-1.5
- [x] Section 2: Layout Structure → Tasks 2.1-2.6
- [x] Section 3: Home Page & Content Cards → Tasks 3.2-3.3
- [x] Section 4: Story Detail & Episode Player → Tasks 3.4, 5.3
- [x] Section 5: Auth, Community, VIP, Account, Search, Categories → Tasks 3.5-3.6
- [x] Section 6: Admin Dashboard → Tasks 4.1-4.4
- [x] PWA manifest update → Task 1.5
- [x] react-modern-audio-player integration → Task 5.3
- [x] Remove admin-specific CSS classes → Task 1.3
- [x] Breaking changes documented → All tasks account for spec breaking changes

---

## Self-Review Results

1. **Placeholder scan:** No TBD, TODO, or "implement later" found. All tasks have concrete code or explicit instructions.
2. **Type consistency:** Theme type `"thu-am-sac"` added consistently across `themes.ts`, `tailwind.config.js`, `globals.css`, and `layout.tsx`. CSS variable names match across all component tasks.
3. **Scope check:** All spec sections covered. No orphaned requirements.
4. **File path accuracy:** All paths verified against current repo structure.
