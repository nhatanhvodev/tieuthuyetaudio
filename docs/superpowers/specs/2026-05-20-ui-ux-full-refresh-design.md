# UI/UX Full Refresh — Tieu thuyet Audio

**Date:** 2026-05-20
**Status:** Design — awaiting implementation planning
**Scope:** Toan bo giao dien nguoi dung (user-facing pages)

---

## Muc tieu

Nang cap toan dien UI/UX cho nguoi dung cuoi, uu tien: card truyen, trai nghiem mobile/PWA, micro-interaction & animation. Tat ca component moi **phai theme-agnostic** — dung CSS variables / Tailwind tokens, tuong thich 33 theme DaisyUI hien co.

## Nguyen tac thiet ke

1. **Theme-agnostic** — Khong hard-code mau sac. Dung `bg-card`, `text-foreground`, `border-border`, `text-accent`, v.v. CSS variables tu DaisyUI.
2. **Mobile-first** — Thiet ke cho man hinh nho truoc, desktop la enhancement.
3. **Progressive enhancement** — Dung View Transitions API khi ho tro, fallback CSS transition.
4. **Reduced motion** — Ton trong `prefers-reduced-motion`, tat animation khi nguoi dung yeu cau.
5. **YAGNI** — Khong them tinh nang chua can. Chi lam nhung gi da spec.

---

## Tong quan cac thay doi

### UX Flow hien tai → muc tieu

```
[Home] → click card → [Series Detail] → click tap → [Episode + Player]
   |                        |
   +-- search               +-- reviews tab
   +-- genre chips          +-- episode list
```

**Sau nang cap:**
- **SiteHeader**: Auth-aware — hien thi user dropdown khi da login
- **StoryCard**: Progress bar, rating stars, skeleton loading, animated hover
- **MobileNav**: 5 items thay vi 4, active indicator animation
- **MiniPlayer mobile**: Seek bar, skip buttons, volume, queue indicator
- **Episode page**: Swipe left/right de chuyen tap
- **Skeleton**: Toan bo shelves & cards co skeleton loading
- **Page transitions**: View Transitions API cho navigation
- **Empty states**: Illustration + CTA ro rang

---

## Chi tiet tung hang muc

### 1. FIX: Auth-aware SiteHeader + User Dropdown

**File:** `components/layout/site-header.tsx`
**Van de:** Component "use client" khong biet session → luon hien nut Dang nhap/Dang ky

**Giai phap:**
- Server component `layout.tsx` da fetch session — truyen xuong `AppFrame` → `SiteHeader`
- `SiteHeader` nhan `session` prop, render theo 2 trang thai:
  - **Chua login**: Nut Dang nhap (ghost) + Dang ky (filled)
  - **Da login**: User dropdown button (avatar + ten) → click mo dropdown menu

**User Dropdown Menu** (dung shadcn/ui DropdownMenu):
- Avatar + email + role/VIP badge
- Link: Tai khoan, Lich su nghe, Truyen dang theo doi
- Link: VIP (neu chua VIP)
- Separator
- Dang xuat (goi signOut)

**Files can thay doi:**
- `components/layout/site-header.tsx` — them session prop, conditional render
- `components/layout/app-frame.tsx` — truyen session vao SiteHeader
- `app/layout.tsx` — da co session, can truyen qua AppFrame
- **MOI** `components/layout/user-menu.tsx` — user dropdown component

**Theme safety:** Dung `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border` — khong hard-code mau.

---

### 2. StoryCard nang cap

**File:** `components/series/story-card.tsx`

**Thay doi:**

a) **Progress bar tren cover** — Neu user da nghe mot phan cua truyen nay, hien thi progress bar ngay tren anh bia (nhu Netflix "Continue Watching"). Data tu `listenProgress`.

b) **Badge he thong moi** — Them cac badge tu dong:
- "Moi" — truyen duoc tao < 7 ngay
- "Hot" — listenCount > nguong (vd 10000)
- "Hoan thanh" — status === COMPLETED (da co Badge variant accent)
- "Dang nghe" — neu co progress

c) **Rating stars** — Da co star + diem. Gi nguyen, chi polish animation.

d) **Skeleton loading** — Khi `series` la null/undefined → render `StoryCardSkeleton` thay vi card that.

e) **Hover animation nang cap**:
- Scale anh cover nhe (da co scale-105)
- Them subtle glow effect tren border
- Title color transition (da co)
- Play button fade-in tu duoi len khi hover (mobile: luon hien thi)

**Files can thay doi:**
- `components/series/story-card.tsx` — them progress, badges, skeleton state
- **MOI** `components/series/story-card-skeleton.tsx` — skeleton card

**Type mo rong:**
```typescript
// Them progress vao StoryCard
type StoryCardProps = {
  series: SeriesWithRelations;
  progress?: { currentSeconds: number; durationSeconds: number } | null;
};
```

---

### 3. MobileNav nang cap

**File:** `components/layout/mobile-nav.tsx`

**Thay doi:**
- Them muc thu 5: "Cong dong" (icon MessageSquare hoac Users)
- Active indicator: animated pill background thay vi border — muot hon khi chuyen tab
- Touch ripple effect khi tap
- `safe-area-inset-bottom` da co → gi nguyen

**Day du 5 items:**
1. Trang chu (Home)
2. Tim kiem (Search)
3. Kho truyen (BookOpen)
4. Cong dong (MessageSquare) — **THEM MOI**
5. Tai khoan (User)

---

### 4. MiniPlayer mobile nang cap

**File:** `components/player/mini-player.tsx`

**Hien tai mobile:** Chi co cover + ten tap + 1 nut Play/Pause. Thieu tram trong.

**Thay doi mobile layout:**
```
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░ │ ← mini seek bar
│ ┌────┐  Ten tap                       │
│ │    │  Ten truyen           [<] [>] [▶] │
│ └────┘                                  │
└─────────────────────────────────────────┘
```

- Mini seek bar (touch-friendly, 40px high vuot)
- Skip back 10s / Skip forward 30s (hoac prev/next tap)
- Play/Pause
- Vuot len de mo full player → sau nay se lam bottom sheet

**Fix mau sac:** Xoa het `#121212`, `emerald-*`, `white`, `zinc-*` — thay bang tokens:
- `bg-card/95` thay cho `bg-[#121212]/95`
- `border-border/20` thay cho `border-white/10`
- `text-foreground` thay cho `text-white`
- Progress bar dung `bg-primary` hoac `bg-accent`

---

### 5. Episode page — Swipe chuyen tap

**File:** `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`

**Thay doi:**
- Them navigation buttons: `← Tap truoc | Tap tiep theo →` o duoi player
- Swipe gesture detection cho mobile (touch events hoac library nhe)
- Animated transition khi chuyen tap
- Hien thi tong so tap + vi tri hien tai (vd: "Tap 5 / 20")

**Next/Prev navigation logic:**
- Da co `queue` array tu `episode.series.episodes`
- Tim current index trong queue → prev = queue[index-1], next = queue[index+1]
- Render Link buttons + swipe handler

---

### 6. Skeleton Loading System

**File moi:** `components/ui/skeleton.tsx` (da co, can mo rong)
**Files can thay doi:**
- `components/series/story-shelf.tsx` — them skeleton variant
- `components/series/continue-listening-shelf.tsx` — them skeleton variant
- `components/series/latest-episode-list.tsx` — them skeleton variant
- `components/series/episode-list.tsx` — them skeleton variant

**Thiet ke skeleton:**
- Dung `animate-pulse` cua Tailwind
- Kich thuoc gan dung voi content that (title ~ 80% width, subtitle ~ 60%)
- Khong skeleton qua 3s — co empty state neu fetch lau
- StoryCardSkeleton: cover placeholder aspect-[3/4] + 3 text lines
- EpisodeRowSkeleton: thumbnail circle + 2 text lines + button

---

### 7. Page Transitions

Kich hoat View Transitions API cho navigation giua cac trang chinh.

**File:** `next.config.ts` — them experimental config (da co Next 15.5)
**File:** `app/layout.tsx` — wrap content voi transition

**Ap dung cho:**
- Trang chu → Chi tiet truyen
- Chi tiet truyen → Tap
- Kho truyen → Chi tiet truyen

**Fallback:** CSS `@view-transition` fallback + `motion-reduce` query. Tu dong disable khi user chon `prefers-reduced-motion`.

---

### 8. Empty States nang cap

**Files can thay doi:**
- `components/common/empty-state.tsx` — them slots cho illustration, CTA buttons

**Moi empty state se co:**
1. Icon/illustration lon hon (dung lucide-react icons)
2. Title ro rang (da co)
3. Description (da co)
4. **THEM MOI**: Optional CTA button slot (vd: "Kham pha truyen", "Dang ky ngay")

---

## Thu tu trien khai

Moi buoc la 1 subtask doc lap, co the test ngay sau khi hoan thanh:

| # | Hang muc | Muc do | File chinh |
|---|----------|--------|------------|
| 1 | Fix SiteHeader auth + User dropdown | P0 | site-header, app-frame, layout, user-menu (new) |
| 2 | StoryCard nang cap + skeleton | P1 | story-card, story-card-skeleton (new), story-shelf |
| 3 | MobileNav nang cap | P1 | mobile-nav |
| 4 | MiniPlayer mobile upgrade + theme fix | P1 | mini-player |
| 5 | Episode swipe nav | P2 | episode page |
| 6 | Skeleton system (shelves, lists) | P2 | story-shelf, continue-listening, episode-list, latest-episode |
| 7 | Page transitions | P2 | next.config, layout |
| 8 | Empty states upgrade | P3 | empty-state |

---

## Yeu cau ky thuat

### Khong hard-code mau
```tsx
// ❌ Sai
className="bg-[#121212] text-white"

// ✅ Dung
className="bg-card text-card-foreground"
```

### CSS Variables su dung
Tat ca component moi dung cac Tailwind tokens:
- `bg-background`, `bg-card`, `bg-secondary`
- `text-foreground`, `text-muted-foreground`, `text-accent`
- `border-border`, `border-input`
- `bg-primary`, `text-primary-foreground`

### Motion safety
```tsx
// Tat ca animation phai co:
className="transition motion-reduce:transition-none"
// hoac
className="animate-* motion-reduce:animate-none"
```

### Testing moi component
- Dark mode / Light mode (it nhat 3 theme)
- Mobile viewport (375px)
- Desktop viewport (1280px)
- prefers-reduced-motion: reduce
- Khong crash khi data null/undefined

---

## Tham khao

- **Everand** — Carousel + actionable home screen + robust player
- **ABUK** — Warm cinematic cards, subtle shadows, micro-margins
- **Libro.fm** — Playlist-based discovery, wishlist, personalization
- **Fabel** — Modular shelf design, varied height based on content
- **Audible Library** — Lenses pattern for auto-categorization
