# Spec: Thu Âm Sắc — UI/UX Redesign Toàn Diện

**Date:** 2026-05-21
**Status:** Approved
**Source:** Google Stitch project "Tái thiết kế Tiểu thuyết Audio" (ID: 8789063210233692368)

## Overview

Redesign toàn bộ UI/UX Tiểu thuyết Audio dựa trên design system "Thu Âm Sắc" từ Stitch. Giữ DaisyUI themes + theme switching, kết hợp shadcn/ui + react-modern-audio-player, giữ PWA.

## Design Pillars

1. **Minimalist-Tactile** — Layout sạch, ấm áp, "digital library" mùa thu
2. **Cozy autumn palette** — Cream nền, cam primary, nâu secondary, vàng tertiary
3. **Be Vietnam Pro** — Body font chính, Manrope cho labels/metadata
4. **Rounded shapes** — Bo góc 8px mặc định, 16px cho cards
5. **Glassmorphism** — Header + player blur nền
6. **Soft ambient shadows** — Không border cứng, dùng shadow nhẹ tint nâu

---

## Section 1: Design Token & Theme System

### Architecture

Stitch "Thu Âm Sắc" là theme DaisyUI mới (`thu-am-sac`), đồng thời là theme mặc định. 30 themes DaisyUI khác giữ lại — người dùng switch theme thì màu sắc thay đổi, layout/font/spacing/radius luôn theo Stitch.

```
CSS Cascade:
  :root  ← Stitch layout tokens (font, radius, spacing, shadow)
  [data-theme="thu-am-sac"]  ← DaisyUI color tokens (primary, base-100, etc.)
  [data-theme="dark"]        ← override colors only
  ...30 themes...
```

### Color Map (Stitch → DaisyUI)

| Stitch Token | DaisyUI Variable | Stitch Hex |
|---|---|---|
| primary | `--color-primary` | `#8d4b00` |
| primary-content | `--color-primary-content` | `#ffffff` |
| secondary | `--color-secondary` | `#944a23` |
| secondary-content | `--color-secondary-content` | `#ffffff` |
| accent | `--color-accent` | `#fbbf24` |
| accent-content | `--color-accent-content` | `#1f1300` |
| base-100 | `--color-base-100` | `#fff9ec` |
| base-200 | `--color-base-200` | `#f3e8bd` |
| base-300 | `--color-base-300` | `#ede3b8` |
| base-content | `--color-base-content` | `#201c02` |
| neutral | mapped from Stitch neutral | `#554336` |
| error | `--color-error` | `#ba1a1a` |

### Font Tokens

| Token | Font | Weight | Size/Line |
|---|---|---|---|
| display-lg | Be Vietnam Pro | 700 | 48px/56px |
| headline-lg | Be Vietnam Pro | 700 | 32px/40px |
| headline-lg-mobile | Be Vietnam Pro | 700 | 24px/32px |
| title-md | Be Vietnam Pro | 600 | 18px/24px |
| body-lg | Be Vietnam Pro | 400 | 16px/28px |
| body-sm | Be Vietnam Pro | 400 | 14px/20px |
| label-md | Manrope | 600 | 12px/16px, 0.05em |

### Spacing Scale

- Unit: 4px
- Gutter: 24px
- Margin mobile: 16px
- Margin desktop: 80px
- Section gap: 64px (desktop), 48px (mobile)

### Radius Scale

- DEFAULT: 0.25rem (4px)
- lg: 0.5rem (8px) — buttons, inputs
- xl: 0.75rem (12px)
- full: 9999px — chips, badges

### Implementation

1. **`tailwind.config.js`** — thêm `thu-am-sac` theme vào mảng DaisyUI themes
2. **`app/globals.css`** — CSS variables Stitch layout tokens ở `:root`, map DaisyUI color vars
3. **`app/layout.tsx`** — Google Fonts link cho Be Vietnam Pro + Manrope, default theme = `thu-am-sac`
4. **`lib/theme/themes.ts`** — type `Theme` thêm `"thu-am-sac"`

---

## Section 2: Layout Structure

### Shell (AppFrame)

5 layer vertical:
```
┌── SiteHeader (sticky, z-30, glassmorphism) ──┐
├── <main> (flex-1) ────────────────────────────┤
├── Global Player (fixed bottom-16, z-40) ──────┤
└── BottomNav (mobile, fixed bottom-0, z-50) ───┘
```

- `<main>` padding-bottom = player height + nav height + safe-area
- Desktop: player floating pill (`max-w-md`, centered, rounded-xl, bottom-6), không có bottom nav

### SiteHeader

**Desktop:** Logo + Nav links + Search + Auth + Theme toggle
- Header: `bg-surface/80 backdrop-blur-md`, border-b `outline-variant/10`
- Active nav link: chấm tròn cam 4px dưới text (`::after`)
- Nav links: `btn btn-ghost btn-sm rounded-full`

**Mobile:** Hamburger + Title + Search icon
- 3 phần đều nhau, icon buttons 2 bên

### BottomNav (Mobile)

5 tabs: Trang chủ | Thư viện | Thể loại | Cộng đồng | Cá nhân
- Active: `bg-primary-container text-on-primary-container rounded-full px-4 py-1`
- Inactive: `text-on-surface-variant`
- h-16, border-top `outline-variant/20`, shadow trên

### Global Player (Mini)

- h-20, `bg-surface/95 backdrop-blur-[12px]`, border-top `primary/10`
- Progress bar 4px cam absolute top
- Cover 48x48 + title/chapter text + -10s button + play/pause (48px)
- Desktop: floating (`max-w-md`, centered, rounded-xl, bottom-6, border)
- Tap → navigate to full player page

### SiteFooter

- Desktop only, simplified links + copyright
- Mobile: no footer (bottom nav replaces it)

### Files
- `components/layout/app-frame.tsx`
- `components/layout/site-header.tsx`
- `components/layout/mobile-nav.tsx`
- `components/player/mini-player.tsx`
- `components/layout/site-footer.tsx`

---

## Section 3: Home Page & Content Cards

### Hero (guest/authenticated)

- Không ảnh nền lớn. Layout text-centered: headline + desc + search bar lớn + 2 CTA buttons
- Search: `h-12 rounded-xl bg-surface-container-lowest`, border `outline-variant`
- CTA: [Khám phá ngay] primary + [Đăng ký VIP] secondary

### "Tiếp tục nghe" (authenticated only)

Horizontal card: cover 80×112 + chapter info + progress bar 4px + play button
- `bg-surface-container-lowest rounded-xl`, border `outline-variant/10`
- Component: `ContinueListeningShelf` → refactor card style

### "Dành riêng cho bạn" (horizontal scroll)

Vertical cards 140×200 cover, scroll snap-x:
- Cover rounded-lg, hover: overlay `bg-black/20` + `play_circle` icon 32px
- Card lift: `group-hover:-translate-y-1` + shadow tăng
- Title line-clamp-2 + author line-clamp-1
- Container: `flex gap-4 overflow-x-auto hide-scrollbar snap-x`

### Story Shelves (grid)

Grid responsive: 6→4→3→2 cols. Dùng `StoryShelf` component hiện tại.
- Card style mới: cover 70% chiều cao, title/author left-aligned
- Rounded-xl (16px), shadow-sm → shadow-md on hover
- Không badge genre đè ảnh

### Section Spacing

- Mỗi section: `section-gap` (64px desktop, 48px mobile)
- Header: `font-title-md` + "Xem tất cả →" link accent bên phải

### Files
- `app/page.tsx` — restructure sections
- `components/series/story-card.tsx` — Stitch card
- `components/series/story-shelf.tsx` — grid
- `components/series/continue-listening-shelf.tsx` — horizontal card
- `components/search/search-box.tsx` — style mới

---

## Section 4: Story Detail & Episode Player

### Story Detail (`/truyen/[slug]`)

Desktop 2-cột:
- **Trái:** Cover 240×320, rounded-xl
- **Phải:** Title + author + rating stars + stats + genre badges + action buttons
- Badges: pill shape, `bg-tertiary-container text-on-tertiary-container`
- Buttons: [Nghe ngay] primary + [Theo dõi] secondary

**Tabs:** Mô tả | Danh sách tập | Đánh giá
- Active tab: border-bottom 2px primary
- Mô tả: line-height 1.75
- Danh sách tập: row với số tập + tiêu đề + thời lượng + nút play 32px

### Full Player (`/truyen/[slug]/tap/[episodeNumber]`)

- Cover art 300×300 (desktop), 240×240 (mobile), rounded-2xl, spinning animation when playing
- Title text-2xl font-black, chapter text-lg muted
- Progress bar dày 6px
- Seek buttons: -30, -10, play/pause, +10, +30
- Speed select + volume select
- Auto-play toggle + Sleep timer section
- Bookmarks section (collapsible)
- Next episode preview

**react-modern-audio-player integration:**
- Wrap thư viện, custom theme map vào Stitch colors
- Progress, seek, speed, volume dùng từ thư viện
- Bookmarks, sleep timer, auto-play: custom UI
- Zustand store vẫn quản lý state (loadEpisode, togglePlay, requestSeek, etc.)

### Mini ↔ Full Transition

- Tap mini player → route đến full player page
- Mini player ẩn khi đang ở full player page
- Transition: CSS slide

### Files
- `app/truyen/[slug]/page.tsx`
- `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`
- `components/series/series-detail-tabs.tsx`
- `components/series/episode-list.tsx`
- `components/player/audio-player.tsx` — wrap react-modern-audio-player
- `components/player/mini-player.tsx` — integrate library mini mode

---

## Section 5: Auth, Community, VIP, Account, Search, Categories

### Auth Pages

Centered card (max-w-sm), soft shadow:
- Logo/icon 64×64
- Inputs: `bg-surface-container-lowest`, bordered `outline-variant`, rounded-xl
- Button: full-width `bg-primary`, h-12, rounded-xl
- Mobile: no card wrap, full-width inputs

### Community (`/cong-dong`)

- Post cards: `bg-surface-container-lowest`, border `outline-variant/10`, rounded-xl
- Like/comment counts với icons
- "Bài mới" button: `bg-primary rounded-full`
- Post detail: full content + comments (refactor style only)

### VIP (`/vip`)

- Plan comparison: 2 cards cạnh nhau desktop, stacked mobile
- Active plan: border primary, badge "Hiện tại"
- VIP plan: nền `primary-container` nhạt
- Dùng `plan-comparison.tsx` có sẵn, refactor style

### Account (`/tai-khoan`)

- Stats row: 3 mini cards (follows, bookmarks, VIP)
- History list: row style như "Tiếp tục nghe"
- Settings links ở bottom

### Search (`/tim-kiem`)

- Input lớn, auto-focused, sticky top
- Genre filter chips: unselected = transparent + border, selected = `bg-tertiary-container`
- Results: grid story cards

### Categories (`/the-loai`, `/the-loai/[slug]`)

- Grid category cards: icon + name + count, rounded-xl, hover lift
- Slug page: title + filter bar + grid story cards

### Files
- `app/dang-nhap/page.tsx`, `app/dang-ky/page.tsx`
- `components/auth/login-form.tsx`, `components/auth/register-form.tsx`
- `app/cong-dong/page.tsx`, `components/community/*.tsx`
- `app/vip/page.tsx`, `components/vip/*.tsx`
- `app/tai-khoan/page.tsx`, `components/account/*.tsx`
- `app/tim-kiem/page.tsx`, `components/search/search-box.tsx`
- `app/the-loai/page.tsx`, `app/the-loai/[slug]/page.tsx`

---

## Section 6: Admin Dashboard

### Admin Shell

- Sidebar (240px, fixed desktop) + content area
- Nền sidebar: `surface-dim` (#e5dab0)
- Nền content: `surface` (#fff9ec)
- Cards: `bg-surface-container-lowest`, border `outline-variant/20`, rounded-xl
- Bỏ `.admin-shell`, `.admin-dark` classes → dùng CSS variables Stitch nhất quán
- Dark mode: map qua DaisyUI dark colors, không CSS riêng

### Admin Sidebar

- Nav items: active = `bg-primary-container rounded-full`, inactive = `hover:bg-surface-container rounded-full`
- Icons từ Lucide
- Link "Về trang chủ" ở bottom
- Mobile: drawer overlay

### Admin Top Bar

- Hamburger (mobile) + Breadcrumb + Notification + User
- h-14, border-bottom nhẹ

### Dashboard (`/admin`)

- 4 stat cards (truyện, tập, người dùng, VIP)
- Charts: Recharts với palette Stitch (cam primary, nâu secondary, vàng tertiary)
- Quick-action cards

### Tables

- `bg-surface-container-lowest`, rounded-xl
- Header: `bg-surface-container`, label-md uppercase
- Rows: border-b `outline-variant/10`, hover `bg-surface-container-high`
- Pagination: pill buttons

### Forms

- Card `bg-surface-container-lowest`, rounded-xl, p-6
- Inputs: `bg-surface`, border `outline-variant`, rounded-xl
- Labels: `font-label-md`
- Submit: `bg-primary`, Cancel: ghost

### Files
- `app/admin/layout.tsx` — shell mới
- `components/admin/admin-nav.tsx` — sidebar
- `app/admin/page.tsx`, `app/admin/analytics/page.tsx`
- `app/admin/truyen/page.tsx`, `app/admin/tap/page.tsx`
- `app/admin/nguoi-dung/page.tsx`, `app/admin/the-loai/page.tsx`
- `components/admin/*.tsx` — tables, forms, dialogs
- `app/globals.css` — remove admin-specific classes

---

## Technical Decisions

### shadcn/ui Integration

- **Hybrid approach:** Giữ custom UI components hiện tại, thêm shadcn/ui cho components mới cần (Dialog, Select, Dropdown, Tabs nếu cần)
- Chỉ refactor những chỗ cần để match Stitch
- shadcn/ui components được theme qua CSS variables đã định nghĩa

### react-modern-audio-player Integration

- Dùng cho cả Mini Player và Full Player UI
- Custom theme map vào Stitch colors
- Giữ nguyên Zustand player store làm state management
- Bookmarks, sleep timer, queue: custom UI sections bọc quanh player thư viện
- Keyboard shortcuts giữ nguyên

### PWA

- Giữ nguyên `app/manifest.ts` configuration
- Cập nhật theme_color → `#fff9ec` (Stitch background)
- Service worker từ Next.js mặc định

### DaisyUI Themes

- `thu-am-sac` là theme mặc định
- 30 themes DaisyUI khác vẫn hoạt động qua data-theme
- ThemeSwitcher component giữ nguyên logic (localStorage + DB sync)
- Khi switch theme, chỉ colors thay đổi, layout tokens giữ nguyên

### Breaking Changes

1. Bỏ `.admin-shell`, `.admin-dark` CSS classes → dùng CSS variables
2. Header từ `bg-background/88` → glassmorphism `bg-surface/80 backdrop-blur-md`
3. Hero page bỏ ảnh nền lớn + gradient overlay
4. Bottom nav từ top (mobile header area?) → fixed bottom
5. Admin theme system thay đổi hoàn toàn

---

## Files Summary

### New files
- (none expected — all are modifications of existing files)

### Modified files (complete list)
| Category | Files |
|---|---|
| Config | `tailwind.config.js`, `app/globals.css`, `app/layout.tsx` |
| Theme | `lib/theme/themes.ts`, `components/theme/theme-switcher.tsx` |
| Layout | `components/layout/app-frame.tsx`, `site-header.tsx`, `site-footer.tsx`, `mobile-nav.tsx` |
| Player | `components/player/audio-player.tsx`, `mini-player.tsx`, `player-provider.tsx` |
| Home | `app/page.tsx` |
| Cards | `components/series/story-card.tsx`, `story-shelf.tsx`, `continue-listening-shelf.tsx` |
| Detail | `app/truyen/[slug]/page.tsx`, `app/truyen/[slug]/tap/[episodeNumber]/page.tsx` |
| Detail comps | `components/series/series-detail-tabs.tsx`, `episode-list.tsx`, `series-filters.tsx` |
| Auth | `app/dang-nhap/page.tsx`, `app/dang-ky/page.tsx`, `components/auth/login-form.tsx`, `register-form.tsx` |
| Community | `app/cong-dong/page.tsx`, `components/community/post-card.tsx`, `post-form.tsx`, `comment-section.tsx` |
| VIP | `app/vip/page.tsx`, `components/vip/plan-comparison.tsx`, `contextual-upsell.tsx` |
| Account | `app/tai-khoan/page.tsx`, `components/account/account-page-client.tsx` |
| Search | `app/tim-kiem/page.tsx`, `components/search/search-box.tsx` |
| Categories | `app/the-loai/page.tsx`, `app/the-loai/[slug]/page.tsx` |
| UI comps | `components/ui/button.tsx`, `card.tsx`, `input.tsx`, `badge.tsx`, `textarea.tsx`, `table.tsx` |
| Admin shell | `app/admin/layout.tsx`, `app/admin/page.tsx` |
| Admin comps | `components/admin/admin-nav.tsx`, `analytics-charts.tsx`, `pagination-controls.tsx` |
| Admin pages | `app/admin/truyen/page.tsx`, `app/admin/tap/page.tsx`, `app/admin/nguoi-dung/page.tsx`, `app/admin/the-loai/page.tsx`, `app/admin/analytics/page.tsx` |
| Admin forms | `components/admin/series-form.tsx`, `episode-form.tsx`, `user-vip-toggle.tsx` |
| Manifest | `app/manifest.ts` — update theme_color |
| Dependencies | `package.json` — add react-modern-audio-player |

---

## Dependencies to Add

```
react-modern-audio-player  (latest)
```

shadcn/ui components as needed (dialog, select, tabs — many already have Radix equivalents in project)

---

## Out of Scope

- Backend/API changes
- Database schema changes
- New features (bookmarks, sleep timer, etc. — already implemented)
- E2E tests for new UI (can be added later)
- i18n / multi-language
