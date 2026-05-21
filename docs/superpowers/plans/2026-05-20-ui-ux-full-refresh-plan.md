# UI/UX Full Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all user-facing UI with auth-aware header, enhanced story cards, 5-item mobile nav, mobile mini-player parity, episode swipe nav, skeleton loading, page transitions, and CTA-enabled empty states — all theme-agnostic.

**Architecture:** Server Component (`layout.tsx`) passes `session` prop through `AppFrame` → `SiteHeader`; all new components use DaisyUI CSS variables exclusively (no hard-coded colors); skeleton variants render when data is null/undefined; View Transitions API with `prefers-reduced-motion` fallback.

**Tech Stack:** Next.js 15.5 App Router, React 19, Tailwind CSS v4 + DaisyUI (33 themes), shadcn/ui (Radix primitives), Zustand player-store, Prisma, NextAuth JWT credentials, TypeScript 5.

---

## File Structure Map

| File | Action | Responsibility |
|---|---|---|
| `components/layout/user-menu.tsx` | **CREATE** | User dropdown — avatar, email, role/VIP badge, nav links, sign out |
| `components/series/story-card-skeleton.tsx` | **CREATE** | Skeleton placeholder matching StoryCard dimensions |
| `components/layout/site-header.tsx` | **MODIFY** | Accept `session` prop, render UserMenu or auth buttons |
| `components/layout/app-frame.tsx` | **MODIFY** | Accept and pass `session` prop to SiteHeader |
| `app/layout.tsx` | **MODIFY** | Pass `session` to AppFrame |
| `components/series/story-card.tsx` | **MODIFY** | Add progress bar, auto-badges, skeleton state, fix hover z-index |
| `components/series/story-shelf.tsx` | **MODIFY** | Add skeleton variant when items loading |
| `components/layout/mobile-nav.tsx` | **MODIFY** | 5th item "Cộng đồng", animated pill active indicator, touch ripple |
| `components/player/mini-player.tsx` | **MODIFY** | Replace all hard-coded colors with theme tokens; add mobile seek bar, skip buttons, volume |
| `app/truyen/[slug]/tap/[episodeNumber]/page.tsx` | **MODIFY** | Prev/next navigation buttons, swipe gesture, episode position indicator |
| `components/series/continue-listening-shelf.tsx` | **MODIFY** | Add skeleton variant |
| `components/series/latest-episode-list.tsx` | **MODIFY** | Add skeleton variant |
| `components/series/episode-list.tsx` | **MODIFY** | Add skeleton variant |
| `components/common/empty-state.tsx` | **MODIFY** | Add `icon` and `action` slots (CTA button) |
| `next.config.ts` | **MODIFY** | Enable `viewTransitions` experimental flag |

---

### Task 1: Fix SiteHeader Auth + User Dropdown (P0)

**Files:**
- Create: `components/layout/user-menu.tsx`
- Modify: `components/layout/site-header.tsx:16-95`
- Modify: `components/layout/app-frame.tsx:11-30`
- Modify: `app/layout.tsx:44-73`

- [ ] **Step 1: Create the UserMenu component**

Create `components/layout/user-menu.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Crown, LogOut, User, Clock, BookOpen } from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Session } from "next-auth";

export function UserMenu({ session }: { session: Session }) {
  const user = session.user;
  const initials = (user.name ?? user.email).charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 rounded-full px-2">
          <Avatar className="size-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">{user.name ?? user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2">
            <Avatar className="size-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold leading-none">{user.name ?? user.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {user.isVip ? (
            <Badge variant="accent" className="mt-2">
              <Crown className="mr-1 size-3" />
              VIP
            </Badge>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/tai-khoan" className="cursor-pointer">
            <User className="mr-2 size-4" />
            Tài khoản
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/tai-khoan?tab=history" className="cursor-pointer">
            <Clock className="mr-2 size-4" />
            Lịch sử nghe
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/tai-khoan?tab=follows" className="cursor-pointer">
            <BookOpen className="mr-2 size-4" />
            Truyện đang theo dõi
          </Link>
        </DropdownMenuItem>
        {!user.isVip ? (
          <DropdownMenuItem asChild>
            <Link href="/vip" className="cursor-pointer">
              <Crown className="mr-2 size-4" />
              Nâng cấp VIP
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 size-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Modify SiteHeader to accept session prop and render conditionally**

Edit `components/layout/site-header.tsx` — replace lines 1-15 (imports + navItems) and lines 63-73 (auth buttons section):

Replace the `export function SiteHeader()` declaration (line 16) to accept props:

```tsx
import type { Session } from "next-auth";
import { UserMenu } from "@/components/layout/user-menu";

export function SiteHeader({ session }: { session: Session | null }) {
```

Replace the auth buttons block (lines 63-73):

```tsx
        <div className="flex items-center justify-end gap-2">
          {session?.user ? (
            <UserMenu session={session} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/dang-nhap">Đăng nhập</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/dang-ky">Đăng ký</Link>
              </Button>
            </>
          )}
          <div className="hidden lg:block">
            <ThemeSwitcher />
          </div>
        </div>
```

- [ ] **Step 3: Modify AppFrame to accept and pass session**

Edit `components/layout/app-frame.tsx`:

```tsx
import type { Session } from "next-auth";

export function AppFrame({ children, session }: { children: ReactNode; session: Session | null }) {
  // ... rest unchanged except:
  return (
    <PlayerProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader session={session} />
        {/* ... rest unchanged */}
```

- [ ] **Step 4: Modify RootLayout to pass session to AppFrame**

Edit `app/layout.tsx` — change the AppFrame usage (line 69):

```tsx
<AppFrame session={session}>{children}</AppFrame>
```

- [ ] **Step 5: Run dev server and verify**

Run: `npm run dev`
Test manually at `http://localhost:3000`:
- When NOT logged in: Đăng nhập + Đăng ký buttons visible
- When logged in (đăng nhập qua /dang-nhap): UserMenu with avatar, dropdown works
- Dropdown: Tài khoản, Lịch sử nghe, Truyện đang theo dõi, Nâng cấp VIP (if not VIP), Đăng xuất
- Đăng xuất redirects to /

- [ ] **Step 6: Commit**

```bash
git add components/layout/user-menu.tsx components/layout/site-header.tsx components/layout/app-frame.tsx app/layout.tsx
git commit -m "feat: auth-aware SiteHeader with UserMenu dropdown

SiteHeader now accepts session prop. When logged in, shows avatar dropdown
with account links, VIP status badge, and sign out. When logged out, shows
Đăng nhập/Đăng ký buttons. Fixes P0 bug where auth buttons showed even
after login."
```

---

### Task 2: StoryCard Upgrade + Skeleton

**Files:**
- Create: `components/series/story-card-skeleton.tsx`
- Modify: `components/series/story-card.tsx:1-57`

- [ ] **Step 1: Create StoryCardSkeleton component**

Create `components/series/story-card-skeleton.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function StoryCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/80 bg-card/85 p-2.5">
      <Skeleton className="aspect-[3/4] w-full rounded-md" />
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <Skeleton className="mt-1 h-9 w-full rounded-md" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Upgrade StoryCard — add progress bar, auto-badges, skeleton state, fix hover z-index**

Edit `components/series/story-card.tsx` — full rewrite:

```tsx
import Link from "next/link";
import { Headphones, Play, Star } from "lucide-react";
import { CoverImage } from "@/components/common/cover-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoryCardSkeleton } from "@/components/series/story-card-skeleton";
import type { SeriesWithRelations } from "@/lib/series/queries";
import { formatCount, formatStatus } from "@/lib/format";

function getAutoBadges(series: SeriesWithRelations): string[] {
  const badges: string[] = [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (new Date(series.createdAt) >= sevenDaysAgo) badges.push("Mới");
  if (series.listenCount >= 10000) badges.push("Hot");
  return badges;
}

function Cover({
  title,
  coverUrl,
  progress
}: {
  title: string;
  coverUrl?: string | null;
  progress?: { currentSeconds: number; durationSeconds: number } | null;
}) {
  const percent =
    progress && progress.durationSeconds > 0
      ? Math.min(100, (progress.currentSeconds / progress.durationSeconds) * 100)
      : 0;

  return (
    <div className="relative flex aspect-[3/4] items-end overflow-hidden rounded-md bg-secondary shadow-lg shadow-black/25">
      <CoverImage
        src={coverUrl}
        alt={title}
        sizes="(max-width: 640px) 70vw, (max-width: 768px) 40vw, (max-width: 1024px) 25vw, 16vw"
        className="pointer-events-none absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none"
      />
      {percent > 0 ? (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/50">
          <div
            className="h-full bg-accent transition-all duration-150"
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      <p className="relative line-clamp-3 p-3 text-sm font-black leading-tight text-white">{title}</p>
    </div>
  );
}

type StoryCardProps = {
  series?: SeriesWithRelations | null;
  progress?: { currentSeconds: number; durationSeconds: number } | null;
};

export function StoryCard({ series, progress }: StoryCardProps) {
  if (!series) return <StoryCardSkeleton />;

  const firstEpisode = series.episodes[0];
  const autoBadges = getAutoBadges(series);

  return (
    <article className="group min-w-0 rounded-xl border border-border/80 bg-card/85 p-2.5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg hover:shadow-black/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link href={`/truyen/${series.slug}`} aria-label={series.title}>
        <Cover title={series.title} coverUrl={series.coverUrl} progress={progress} />
      </Link>
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={series.status === "COMPLETED" ? "accent" : "secondary"}>
            {formatStatus(series.status)}
          </Badge>
          {autoBadges.map((badge) => (
            <Badge key={badge} variant="outline" className="border-accent/50 text-accent">
              {badge}
            </Badge>
          ))}
          {progress ? <Badge variant="secondary">Đang nghe</Badge> : null}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star aria-hidden="true" className="size-3.5" /> {series.averageRating.toFixed(1)}
          </span>
        </div>
        <Link
          href={`/truyen/${series.slug}`}
          className="line-clamp-2 min-h-10 text-[15px] font-bold leading-5 group-hover:text-accent transition-colors motion-reduce:transition-none"
        >
          {series.title}
        </Link>
        <p className="truncate text-sm text-muted-foreground">{series.producer ?? "Xuong Audio"}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Headphones aria-hidden="true" className="size-3.5" /> {formatCount(series.listenCount)}
          </span>
          <span>{series.episodeCount} tap</span>
        </div>
        <Button asChild size="sm" className="mt-1 w-full">
          <Link
            href={firstEpisode ? `/truyen/${series.slug}/tap/${firstEpisode.episodeNumber}` : `/truyen/${series.slug}`}
          >
            <Play data-icon="inline-start" />
            Nghe thu
          </Link>
        </Button>
      </div>
    </article>
  );
}

export { StoryCardSkeleton } from "@/components/series/story-card-skeleton";
```

Key changes from original:
- `pointer-events-none` added to CoverImage className to fix hover interception bug
- Progress bar overlay on cover when `progress` prop is provided
- Auto-badges: "Mới" (created < 7 days), "Hot" (>= 10000 listens), "Đang nghe" (has progress)
- `series` prop is now optional (`series?`) — renders `StoryCardSkeleton` when null/undefined
- All transitions have `motion-reduce:transition-none`

- [ ] **Step 3: Update StoryShelf to pass progress data (for "Continue Listening" context)**

No changes needed to `story-shelf.tsx` itself — it still passes `series` directly. Progress-aware rendering is handled by the StoryCard accepting the `progress` prop. When used in a "Continue Listening" shelf, the parent passes progress. The generic StoryShelf shelves pass no progress (cards show without progress bar — correct behavior).

Note: The `ContinueListeningShelf` uses its own card layout, not StoryCard. If we want to unify that later, it's a separate effort. For now, StoryCard's progress bar works when `progress` is passed by any parent.

- [ ] **Step 4: Run dev server and verify**

Run: `npm run dev`

Test at `http://localhost:3000`:
- Homepage: Story cards render with badges (Mới/Hot if applicable)
- Hover on desktop: card lifts, border glows, image scales (pointer-events-none fix means no interception)
- Reduced motion: no animation when `prefers-reduced-motion: reduce`
- Card with `series={null}` renders StoryCardSkeleton

- [ ] **Step 5: Commit**

```bash
git add components/series/story-card.tsx components/series/story-card-skeleton.tsx
git commit -m "feat: upgrade StoryCard with progress bar, auto-badges, skeleton state, hover fix

- Added progress bar overlay on cover (like Netflix Continue Watching)
- Auto-badges: Mới (< 7 days), Hot (>= 10K listens), Đang nghe (has progress)
- StoryCardSkeleton renders when series is null/undefined
- Fixed hover bug: CoverImage now has pointer-events-none to prevent
  interception of parent link hover events
- All animations respect prefers-reduced-motion"
```

---

### Task 3: MobileNav Upgrade (P1)

**Files:**
- Modify: `components/layout/mobile-nav.tsx:1-47`

- [ ] **Step 1: Rewrite MobileNav with 5 items, animated pill indicator, touch ripple**

Edit `components/layout/mobile-nav.tsx`:

```tsx
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
```

Key changes:
- 5 items (was 4): added "Cộng đồng" with MessageSquare icon
- `grid-cols-5` (was `grid-cols-4`)
- Active indicator: top pill bar (`bg-accent`) instead of border — cleaner
- `rounded-xl` (was `rounded-md`) for touch-friendly hit area
- `active:scale-95` for touch ripple feedback
- `motion-reduce:transition-none` added

- [ ] **Step 2: Run dev server and verify mobile**

Run: `npm run dev`

Test at `http://localhost:3000` (mobile viewport 375px):
- MobileNav shows 5 items: Trang chủ, Tìm kiếm, Kho truyện, Cộng đồng, Tài khoản
- Active page shows accent pill bar on top + card background
- Tapping shows scale ripple
- Reduced motion: no animation

- [ ] **Step 3: Commit**

```bash
git add components/layout/mobile-nav.tsx
git commit -m "feat: upgrade MobileNav with 5th item Cộng đồng, animated pill indicator

- Added 5th nav item: Cộng đồng (MessageSquare icon)
- Active tab shows top accent pill bar instead of border ring
- Touch ripple effect with active:scale-95
- grid-cols-5 for equal spacing
- All animations respect prefers-reduced-motion"
```

---

### Task 4: MiniPlayer Mobile Upgrade + Theme Fix (P1)

**Files:**
- Modify: `components/player/mini-player.tsx:1-208`

- [ ] **Step 1: Replace all hard-coded colors with theme tokens**

This is the single largest code change. All hard-coded color classes must be replaced:

| Before (hard-coded) | After (theme token) |
|---|---|
| `bg-[#121212]/95` | `bg-card/95` |
| `text-white` | `text-card-foreground` |
| `border-white/10` | `border-border/20` |
| `bg-emerald-400` | `bg-accent` |
| `bg-zinc-800` | `bg-secondary` |
| `bg-zinc-900` | `bg-muted` |
| `bg-zinc-900/80` | `bg-muted/80` |
| `bg-zinc-800/80` | `bg-secondary/80` |
| `text-zinc-300` | `text-muted-foreground` |
| `text-zinc-100` | `text-foreground` |
| `border-zinc-700` | `border-border` |
| `border-zinc-800` | `border-border` |
| `bg-[#0f0f0f]/98` | `bg-card/98` |
| `bg-emerald-500/10` | `bg-accent/10` |
| `text-emerald-400` | `text-accent` |
| `accent-emerald-400` | `accent-current` |

Edit `components/player/mini-player.tsx` — replace all occurrences using the table above.

Specific lines to change:
- Line 94: `className="fixed inset-x-3 bottom-[4.7rem] z-40 overflow-hidden rounded-2xl border border-white/10 bg-[#121212]/95 p-3 text-white ..."` → `className="fixed inset-x-3 bottom-[4.7rem] z-40 overflow-hidden rounded-2xl border border-border/20 bg-card/95 p-3 text-card-foreground ..."`
- Line 95: `from-emerald-500/10 via-transparent to-fuchsia-500/10` → `from-accent/10 via-transparent to-fuchsia-500/10`
- Line 99: `bg-zinc-800` → `bg-secondary`
- Lines 103-108: `className="absolute inset-0 size-full object-cover ${...}"` → keep same (no color change needed)
- Line 112: `text-white` → `text-card-foreground`
- Line 113: `text-zinc-300` → `text-muted-foreground`
- Line 114: `text-emerald-400` → `text-accent`
- Lines 120-128: replace `border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700` → `border-border bg-secondary text-card-foreground hover:bg-muted`
- Line 131: `bg-zinc-900/80 ... hover:bg-zinc-800/80` → `bg-muted/80 ... hover:bg-secondary/80`
- Line 137: `bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]` → `bg-accent shadow-[0_0_8px_var(--color-accent)]`
- Line 141: `bg-emerald-300/90` → `bg-accent/90`
- Line 142: `bg-zinc-800 text-zinc-100` → `bg-secondary text-foreground`
- Line 152: `text-zinc-300` → `text-muted-foreground`
- Line 153: `text-zinc-300` → `text-muted-foreground`
- Line 163: `accent-emerald-400` → `accent-current`
- Line 166: `text-zinc-300 hover:bg-zinc-800` → `text-muted-foreground hover:bg-secondary`
- Lines 174, 176-178: `bg-zinc-800` → `bg-secondary`, `text-white` → `text-card-foreground`
- Lines 181-183: `text-white` → `text-card-foreground`, `text-zinc-300` → `text-muted-foreground`
- Line 184: `bg-white text-black hover:bg-zinc-200` → `bg-primary text-primary-foreground hover:brightness-90`
- Line 191: `border-white/10 bg-[#0f0f0f]/98 text-white` → `border-border/20 bg-card/98 text-card-foreground`
- Line 195: `border-zinc-800 bg-zinc-900/70 text-zinc-300` → `border-border bg-muted/70 text-muted-foreground`
- Line 197: `text-zinc-500` → `text-muted-foreground`
- Line 202: `border-zinc-800 bg-zinc-900 text-zinc-100` → `border-border bg-muted text-foreground`

- [ ] **Step 2: Add mobile seek bar, skip buttons, and volume**

Replace the mobile-only section (lines 172-188) with the expanded mobile layout:

```tsx
        <div className="md:hidden">
          <div className="mb-2">
            <div
              className="relative h-10 cursor-pointer overflow-hidden rounded-md bg-muted/80 px-1 transition-all duration-200 hover:bg-secondary/80"
              onTouchMove={(event) => {
                const touch = event.touches[0];
                const rect = (event.target as HTMLElement).closest("[data-seek-bar]")?.getBoundingClientRect();
                if (!rect || !progress.durationSeconds) return;
                const ratio = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
                setHoverSeconds(Math.floor(ratio * progress.durationSeconds));
              }}
              onTouchEnd={(event) => {
                if (hoverSeconds !== null) requestSeek(hoverSeconds);
                setHoverSeconds(null);
              }}
              onMouseMove={(event) => setHoverSeconds(getSeekFromPointer(event))}
              onMouseLeave={() => setHoverSeconds(null)}
              onClick={(event) => requestSeek(getSeekFromPointer(event))}
              data-seek-bar
            >
              <div
                className="absolute inset-y-1 left-1 rounded bg-accent shadow-[0_0_8px_var(--color-accent)] transition-all duration-100"
                style={{ width: `calc(${waveformPercent} - 2px)` }}
              />
              {hoverPercent !== null ? (
                <div
                  className="absolute inset-y-0 w-px bg-accent/90"
                  style={{ left: `calc(${hoverPercent}% - 1px)` }}
                />
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {current.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.coverUrl} alt="" loading="lazy" decoding="async" className={`absolute inset-0 size-full object-cover ${isPlaying ? "animate-[spin_12s_linear_infinite]" : ""}`} />
              ) : null}
            </div>
            <Link href={`/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`} className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-card-foreground">{current.title}</p>
              <p className="truncate text-xs text-muted-foreground">{current.seriesTitle}</p>
            </Link>
            <Button type="button" variant="secondary" size="icon" className="h-9 w-9 rounded-full border-border bg-secondary text-card-foreground hover:bg-muted" onClick={() => playPrevInQueue()} disabled={!prevEpisode} aria-label="Tập trước">
              <SkipBack aria-hidden="true" className="size-4" />
            </Button>
            <Button type="button" size="icon" className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:brightness-90" onClick={togglePlay} aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
              {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </Button>
            <Button type="button" variant="secondary" size="icon" className="h-9 w-9 rounded-full border-border bg-secondary text-card-foreground hover:bg-muted" onClick={() => playNextInQueue()} disabled={!nextEpisode} aria-label="Tập tiếp theo">
              <SkipForward aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
```

- [ ] **Step 3: Run dev server and verify**

Run: `npm run dev`

Test at `http://localhost:3000`:
- Navigate to a series and play an episode (the MiniPlayer appears at bottom)
- Mobile viewport (375px): MiniPlayer shows seek bar, skip back/forward buttons, play/pause, cover, title
- Desktop viewport: existing layout still works, now with theme tokens
- Switch themes via ThemeSwitcher: MiniPlayer colors change with theme
- Dark theme: MiniPlayer legible (not white-on-white or black-on-black)

- [ ] **Step 4: Commit**

```bash
git add components/player/mini-player.tsx
git commit -m "feat: theme-agnostic MiniPlayer with mobile seek bar and skip buttons

- Replaced all hard-coded colors (bg-[#121212], text-white, bg-emerald-400,
  bg-zinc-*, text-zinc-*, etc.) with theme tokens (bg-card, text-foreground,
  bg-accent, bg-secondary, text-muted-foreground, border-border, etc.)
- Mobile layout now includes: mini seek bar (touch-friendly 40px), skip
  back/skip forward buttons, play/pause — parity with desktop
- Touch events for mobile seek bar (onTouchMove/onTouchEnd)
- Works across all 33 DaisyUI themes"
```

---

### Task 5: Episode Swipe Navigation (P2)

**Files:**
- Modify: `app/truyen/[slug]/tap/[episodeNumber]/page.tsx:1-186`

- [ ] **Step 1: Add prev/next navigation and episode position indicator**

Edit `app/truyen/[slug]/tap/[episodeNumber]/page.tsx` — add after the breadcrumb nav (line 106) and wrap the player section with navigation:

Add import at top (after line 7):

```tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
```

Find the `queue` array and current index. Add after the `currentEpisodePayload` definition (after line 96):

```tsx
  const currentQueueIndex = queue.findIndex(
    (item) => item.episodeNumber === activeEpisodeNumber
  );
  const prevEpisode = currentQueueIndex > 0 ? queue[currentQueueIndex - 1] : null;
  const nextEpisode =
    currentQueueIndex >= 0 && currentQueueIndex < queue.length - 1
      ? queue[currentQueueIndex + 1]
      : null;
  const episodePosition = `${activeEpisodeNumber} / ${episode.series.episodes.length}`;
```

Now add the nav buttons wrapper. Replace the `<AudioPlayer` section (line 148) and its surrounding div:

```tsx
            <div className="space-y-4">
              <AudioPlayer
                episode={currentEpisodePayload}
                queue={queue}
                canManageBookmarks={canManageBookmarks}
                initialBookmarks={initialBookmarks}
              />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {prevEpisode ? (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/truyen/${episode.series.slug}/tap/${prevEpisode.episodeNumber}`}
                      >
                        <ChevronLeft className="mr-1 size-4" />
                        Tập trước
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="mr-1 size-4" />
                      Tập trước
                    </Button>
                  )}
                  {nextEpisode ? (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/truyen/${episode.series.slug}/tap/${nextEpisode.episodeNumber}`}
                      >
                        Tập tiếp theo
                        <ChevronRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Tập tiếp theo
                      <ChevronRight className="ml-1 size-4" />
                    </Button>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  Tập {episodePosition}
                </span>
              </div>
            </div>
```

- [ ] **Step 2: Add touch swipe gesture detection**

Create a client component `components/player/episode-swipe-wrapper.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";

export function EpisodeSwipeWrapper({
  children,
  prevHref,
  nextHref
}: {
  children: ReactNode;
  prevHref?: string;
  nextHref?: string;
}) {
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      onTouchStart={(e) => {
        touchStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }}
      onTouchEnd={(e) => {
        if (!touchStart.current) return;
        const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
        const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
        touchStart.current = null;

        // Only trigger if horizontal swipe dominates vertical scroll
        if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

        if (deltaX > 0 && prevHref) {
          router.push(prevHref);
        } else if (deltaX < 0 && nextHref) {
          router.push(nextHref);
        }
      }}
    >
      {children}
    </div>
  );
}
```

Wrap the content in the episode page with this component. But since the episode page is a server component, we need to create a client wrapper. Add to the main content area:

In `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`, import and wrap the main `<section>` content:

```tsx
import { EpisodeSwipeWrapper } from "@/components/player/episode-swipe-wrapper";

// ...inside the return, wrap the content after breadcrumb:
      <EpisodeSwipeWrapper
        prevHref={prevEpisode ? `/truyen/${episode.series.slug}/tap/${prevEpisode.episodeNumber}` : undefined}
        nextHref={nextEpisode ? `/truyen/${episode.series.slug}/tap/${nextEpisode.episodeNumber}` : undefined}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* ... rest of content */}
        </div>
      </EpisodeSwipeWrapper>
```

- [ ] **Step 3: Run dev server and verify**

Run: `npm run dev`

Test at `http://localhost:3000/truyen/[slug]/tap/[1]`:
- "Tập trước" button disabled on first episode
- "Tập tiếp theo" button links to next episode
- Episode position shows "Tập 1 / 20"
- On mobile: swipe right → previous episode, swipe left → next episode
- Vertical scroll does NOT trigger swipe
- Keyboard navigation: still works via MiniPlayer keyboard shortcuts

- [ ] **Step 4: Commit**

```bash
git add app/truyen/\[slug\]/tap/\[episodeNumber\]/page.tsx components/player/episode-swipe-wrapper.tsx
git commit -m "feat: episode swipe navigation with prev/next buttons

- Added Tập trước / Tập tiếp theo navigation buttons below player
- Episode position indicator ('Tập 5 / 20')
- Touch swipe gesture detection via EpisodeSwipeWrapper client component
- Swipe requires 60px horizontal delta and horizontal dominance over vertical
- Both buttons disabled at queue boundaries"
```

---

### Task 6: Skeleton System (P2)

**Files:**
- Modify: `components/series/story-shelf.tsx:5-20`
- Modify: `components/series/continue-listening-shelf.tsx:9-56`
- Modify: `components/series/episode-list.tsx:18-67`
- Read: `components/series/latest-episode-list.tsx`

- [ ] **Step 1: Read latest-episode-list.tsx**

Read the file to understand its structure before writing the skeleton variant.

- [ ] **Step 2: Add StoryShelf skeleton variant**

Edit `components/series/story-shelf.tsx` — add a `loading` prop:

```tsx
import Link from "next/link";
import { StoryCard, StoryCardSkeleton } from "@/components/series/story-card";
import type { SeriesWithRelations } from "@/lib/series/queries";

export function StoryShelf({
  title,
  href,
  items,
  loading
}: {
  title: string;
  href?: string;
  items: SeriesWithRelations[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black">{title}</h2>
        </div>
        <div className="grid grid-flow-col auto-cols-[70%] gap-4 overflow-x-auto pb-2 sm:auto-cols-[40%] md:grid-flow-row md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StoryCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    // ... existing return unchanged
  );
}
```

- [ ] **Step 3: Add ContinueListeningShelf skeleton variant**

Edit `components/series/continue-listening-shelf.tsx` — add a `loading` prop:

At top of function, add:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Add loading to props:
export function ContinueListeningShelf({
  items,
  title = "Nghe tiep",
  href,
  loading
}: {
  items: ContinueListeningItem[];
  title?: string;
  href?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black">{title}</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card/90 p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-14 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
                <Skeleton className="size-9 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-2 w-full rounded" />
              <Skeleton className="mt-2 h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ... rest unchanged
```

- [ ] **Step 4: Add EpisodeList skeleton variant**

Edit `components/series/episode-list.tsx` — add a `loading` prop:

At top of function, add:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Add loading to props:
export function EpisodeList({
  slug,
  episodes,
  coverUrl,
  currentEpisodeNumber,
  loading
}: {
  slug: string;
  episodes: Episode[];
  coverUrl?: string | null;
  currentEpisodeNumber?: number;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border bg-card/90 p-2.5">
            <Skeleton className="size-14 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
            </div>
            <Skeleton className="size-9 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  // ... rest unchanged
```

- [ ] **Step 5: Add LatestEpisodeList skeleton variant**

Read the file first, then add the same `loading` prop pattern.

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Inside LatestEpisodeList component, add early return:
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black">{title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border bg-card/90 p-3">
              <Skeleton className="size-16 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
```

- [ ] **Step 6: Run dev server and verify**

Run: `npm run dev`

Test at `http://localhost:3000`:
- Initial load: skeleton shelves visible briefly before data loads
- Pass `loading={true}` manually to verify skeleton shapes match real content
- Skeleton pulse animation works
- Reduced motion: pulse animation disabled

- [ ] **Step 7: Commit**

```bash
git add components/series/story-shelf.tsx components/series/continue-listening-shelf.tsx components/series/episode-list.tsx components/series/latest-episode-list.tsx
git commit -m "feat: skeleton loading system for shelves and episode lists

- StoryShelf, ContinueListeningShelf, EpisodeList, LatestEpisodeList
  now accept loading prop to render skeleton placeholders
- Skeleton dimensions match real content: card aspect-[3/4], episode
  rows with thumbnail + 2 text lines, continue-listening rows
- Uses existing Skeleton component (animate-pulse bg-muted)
- All animations respect prefers-reduced-motion"
```

---

### Task 7: Page Transitions (P2)

**Files:**
- Modify: `next.config.ts:1-11`
- Modify: `app/layout.tsx:44-73`

- [ ] **Step 1: Enable View Transitions API in next.config.ts**

Edit `next.config.ts`:

```tsx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
    viewTransition: true
  },
  serverExternalPackages: ["@prisma/client"]
};

export default nextConfig;
```

- [ ] **Step 2: Add transition names to key page elements in layout**

Edit `app/layout.tsx` — add a CSS animation for view transitions to the `<head>` script or a new `<style>` tag. Add after line 64 (closing `</script>`):

```tsx
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @view-transition {
                navigation: auto;
              }
              @media (prefers-reduced-motion: reduce) {
                ::view-transition-old(root),
                ::view-transition-new(root) {
                  animation: none;
                }
              }
            `
          }}
        />
```

- [ ] **Step 3: Run dev server and verify transitions**

Run: `npm run dev`

Test at `http://localhost:3000`:
- Navigate Home → Series Detail: smooth cross-fade
- Navigate Series Detail → Episode: smooth cross-fade
- Browse → Series Detail: smooth cross-fade
- Enable `prefers-reduced-motion: reduce` in DevTools: no animations

- [ ] **Step 4: Commit**

```bash
git add next.config.ts app/layout.tsx
git commit -m "feat: enable View Transitions API for page navigation

- Added viewTransition experimental flag in next.config.ts
- Injected @view-transition CSS with navigation: auto
- prefers-reduced-motion disables transition animations
- Applies to all inter-page navigation automatically"
```

---

### Task 8: Empty States Upgrade (P3)

**Files:**
- Modify: `components/common/empty-state.tsx:1-15`

- [ ] **Step 1: Rewrite EmptyState with icon and action slots**

Edit `components/common/empty-state.tsx`:

```tsx
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="text-center">
      <CardHeader>
        {icon ? (
          <div className="mx-auto mb-3 text-muted-foreground">{icon}</div>
        ) : null}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-24 items-center justify-center rounded-md bg-secondary/60">
          {action ?? (
            <p className="text-sm text-muted-foreground">
              Không có dữ liệu để hiển thị
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Run dev server and verify**

Run: `npm run dev`

Find an empty state (search with no results, empty follows list, etc.) to verify:
- Icon renders at top when provided
- Action CTA button renders in the content area when provided
- Existing callers (title + description only) still work

- [ ] **Step 3: Commit**

```bash
git add components/common/empty-state.tsx
git commit -m "feat: upgrade EmptyState with icon and action CTA slots

- icon prop for illustration (lucide-react icon or custom element)
- action prop for CTA button or link
- Backward compatible: existing callers with title+description still work
- Theme-agnostic: uses bg-secondary, text-muted-foreground tokens"
```

---

## Verification Checklist

After all tasks are complete, run the mobile test script:

```bash
node scripts/mobile-test.mjs
```

Expected results:
- **SiteHeader auth**: `Đăng nhập=false, Đăng ký=false` (or "User menu present: true" when logged in)
- **StoryCard**: Cards render with Mới/Hot badges, no hover crash
- **MobileNav**: 5 items including "Cộng đồng"
- **MiniPlayer**: Seek bar visible on mobile, skip buttons present, colors match theme
- **Episode page**: Prev/Next buttons visible, position indicator shows
- **Skeleton**: No visual jank — cards hold skeleton shape during load
- **Page transitions**: Smooth cross-fade when navigating
- **Empty states**: CTA button visible
- **Zero hard-coded colors** in new/modified components
- **Reduced motion**: All animations disabled when `prefers-reduced-motion: reduce`
- **33 themes**: No broken colors on any theme

## Reverting Hard-Coded Colors: MiniPlayer Complete Token Map

For audit purposes, here is every hard-coded color replaced in Task 4:

| Line | Before | After |
|---|---|---|
| 94 | `border-white/10 bg-[#121212]/95 text-white` | `border-border/20 bg-card/95 text-card-foreground` |
| 95 | `from-emerald-500/10` | `from-accent/10` |
| 99 | `bg-zinc-800` | `bg-secondary` |
| 112 | `text-white` | `text-card-foreground` |
| 113 | `text-zinc-300` | `text-muted-foreground` |
| 114 | `text-emerald-400` | `text-accent` |
| 120,123,126 | `border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700` | `border-border bg-secondary text-card-foreground hover:bg-muted` |
| 131 | `bg-zinc-900/80 hover:bg-zinc-800/80` | `bg-muted/80 hover:bg-secondary/80` |
| 137 | `bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]` | `bg-accent shadow-[0_0_8px_var(--color-accent)]` |
| 141 | `bg-emerald-300/90` | `bg-accent/90` |
| 142 | `bg-zinc-800 text-zinc-100` | `bg-secondary text-foreground` |
| 152,153 | `text-zinc-300` | `text-muted-foreground` |
| 163 | `accent-emerald-400` | `accent-current` |
| 166 | `text-zinc-300 hover:bg-zinc-800` | `text-muted-foreground hover:bg-secondary` |
| 174,176 | `bg-zinc-800` | `bg-secondary` |
| 178 | `text-white` | `text-card-foreground` |
| 181,183 | `text-white` / `text-zinc-300` | `text-card-foreground` / `text-muted-foreground` |
| 184 | `bg-white text-black hover:bg-zinc-200` | `bg-primary text-primary-foreground hover:brightness-90` |
| 191 | `border-white/10 bg-[#0f0f0f]/98 text-white` | `border-border/20 bg-card/98 text-card-foreground` |
| 195 | `border-zinc-800 bg-zinc-900/70 text-zinc-300` | `border-border bg-muted/70 text-muted-foreground` |
| 197 | `text-zinc-500` | `text-muted-foreground` |
| 202 | `border-zinc-800 bg-zinc-900 text-zinc-100` | `border-border bg-muted text-foreground` |
