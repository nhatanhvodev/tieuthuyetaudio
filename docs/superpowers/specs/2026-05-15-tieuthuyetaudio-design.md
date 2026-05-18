# Tieu thuyet Audio Design Spec

Date: 2026-05-15
Product name: Tieu thuyet Audio / tieuthuyetaudio
Source inputs: `codex.md`, `deep-research-report.md`, user decisions in Codex session

## 1. Goal

Build a full-stack Vietnamese audiobook and audio-story platform as a responsive, mobile-friendly PWA/webapk-style web app. The first release must feel like a usable listening product, not a placeholder site: users can browse stories, search and filter, open story details, play episodes, follow stories, rate stories, resume listening progress, sign in, and use an account area. Admin users can manage core catalog data and grant mock VIP access.

The app must not copy `truyenaudio25.com` branding, logo, copyrighted content, or unauthorized audio. Demo data must be original or otherwise safe to use.

## 2. Confirmed Decisions

- Scope direction: full-stack, not static-only.
- Product direction: Media-first responsive web app, optimized for mobile first and installable as a PWA.
- Auth and VIP: real auth with user/admin roles; VIP is mock entitlement managed by admin in the first release.
- Public URL style: Vietnamese routes for users, English naming in code.
- Visual direction: Audiobook Subscription as the main look, with clearer catalog/player treatment from Editorial Catalog and mobile bottom navigation from Native Mobile PWA.
- Payment: no real payment provider in the first release.
- Data: seed/demo catalog data only unless the owner provides licensed content.
- WebAPK/download option: mobile users get a clear "Tai app" action. On supported Android browsers, it triggers the PWA install flow that may create a WebAPK-like installed app. On unsupported browsers, it shows concise manual install guidance. A separately signed native APK/TWA package is not part of v1.

## 3. Product Scope

### In Scope For First Release

- Public homepage with hero, search, listening shelves, trending/new/recommended stories, and VIP prompt.
- Story catalog page with filters for category, status, episode count range, and sort.
- Category listing pages.
- Search page with query URL sync and empty/error states.
- Story detail page with cover, metadata, episode list, follow, share, rating, description, and related stories.
- Episode playback using a custom HTML5 audio player.
- Sticky mini-player across routes while playing.
- Listen progress persisted locally and synced for signed-in users.
- Auth: register, login, logout, session handling, protected account/admin routes.
- Account page with profile summary, followed stories, listening history, and VIP status.
- Community/feedback page with a simple feedback form or seeded discussion list.
- Admin: manage series, episodes, categories, users, and mock VIP entitlement.
- Prisma schema and seed data.
- PWA basics: manifest, app icons, installable metadata, mobile app-shell behavior.
- Responsive desktop, tablet, and mobile layouts.
- Mobile install/download option: visible "Tai app" CTA, PWA install prompt handling, fallback instructions, and install-state handling.
- SEO metadata for public catalog and story pages.

### Out Of Scope For First Release

- Real payment gateway and payment webhook.
- Real audio upload/transcoding pipeline.
- Advanced comments/moderation workflows.
- Advanced playlist manager.
- Ads integration.
- Analytics pipeline beyond simple event placeholders.
- Native Android/iOS build and separately signed APK/TWA distribution. The target is responsive web plus PWA install/WebAPK-style browser installation first.

## 4. Information Architecture

Public URLs are Vietnamese. Code folders, model names, and service names use English.

| Public path | Code/domain concept | Purpose |
|---|---|---|
| `/` | home | Main discovery surface |
| `/truyen` | series index | Browse all stories |
| `/truyen/[slug]` | series detail | Story detail and episode list |
| `/truyen/[slug]/tap/[episodeNumber]` | episode/player | Episode listening page |
| `/the-loai` | categories index | Category hub |
| `/the-loai/[slug]` | category detail | Stories by category |
| `/tim-kiem` | search | Search results with `q` query |
| `/tai-khoan` | account | Signed-in user area |
| `/dang-nhap` | login | Login |
| `/dang-ky` | register | Registration |
| `/cong-dong` | community | Feedback/community page |
| `/vip` | vip | VIP information and mock upgrade explanation |
| `/admin` | admin dashboard | Admin entry |
| `/admin/truyen` | admin series | Manage series |
| `/admin/truyen/new` | admin series create | Create series |
| `/admin/truyen/[id]/edit` | admin series edit | Edit series |
| `/admin/tap` | admin episodes | Manage episodes |
| `/admin/nguoi-dung` | admin users | Manage users and VIP mock state |

## 5. Visual System

### Direction

The visual system is primarily an audiobook subscription app:

- Dark premium public shell for the homepage, playback surfaces, and media-led moments.
- Strong cover art, horizontal shelves, and a listening-first hierarchy.
- Catalog and admin areas use clearer surfaces, stronger contrast, and quieter layout from the Editorial Catalog direction.
- Mobile uses a native-like bottom navigation with the mini-player above it.

### Palette

- App background: near black navy for media surfaces.
- Surface: dark slate panels for public media sections.
- Elevated catalog cards: light or high-contrast dark cards depending on page context.
- Primary accent: green/teal for play, progress, active route, and positive actions.
- Secondary accents: amber, cyan, and violet for cover art, category markers, and VIP affordances.
- Admin surfaces: light neutral with dark text, clear borders, and restrained accents.

The palette must avoid becoming a single-hue dark blue interface. Cover art and accent colors should add warmth and category distinction.

### Typography

- Use a Vietnamese-friendly sans-serif stack.
- Headings should be bold and compact, but not viewport-scaled.
- Control text, tabs, filters, table cells, player labels, and mobile nav labels must have deliberate font sizes and line heights.
- No negative letter spacing.

### Components

- Header: brand, primary nav, search, auth/account entry.
- Mobile nav: Home, Search, Library, Account.
- Install app button: appears in the mobile header/account/VIP surfaces when installation is available; shows fallback instructions when not available.
- Story card: cover, title, producer/narrator, status, listen count, episode count, rating, quick play.
- Shelf: horizontal row with title, action link, and responsive overflow behavior.
- Player: large/full player on episode page; sticky mini-player across routes.
- Filters: category, status, episode count, sort.
- Forms: auth, series, episode, category, user/VIP management.
- Tables: admin series, episodes, users.
- Empty/error/loading states for catalog, search, account, and admin pages.

## 6. Core Data Model

Use Prisma with PostgreSQL. Required entities:

- `User`: email, name, password hash or auth provider fields, role, VIP mock status.
- `Series`: slug, title, description, cover URL, producer, status, listen count, episode count, average rating.
- `Episode`: series relation, episode number, title, audio URL, duration, listen count.
- `Category`: slug and name.
- `SeriesCategory`: join table.
- `Follow`: user-to-series relation.
- `Review`: user rating and optional text per series.
- `ListenProgress`: user-to-episode progress and completion state.

The schema from `codex.md` is the baseline, with a small addition for mock VIP entitlement on users or a separate subscription/entitlement table. The implementation plan should choose the simpler durable option after checking Auth.js session needs.

## 7. Architecture

### Frontend

- Next.js 15 App Router with TypeScript.
- Server Components for public catalog and detail data where practical.
- Client Components for player, filters, forms, auth interactions, rating, follow, and progress updates.
- Tailwind CSS for layout and tokens.
- shadcn/ui and Radix primitives for accessible dialog, dropdown, tabs, slider, tooltip, popover, select, form primitives, and admin UI.
- Zustand for player state, queue, current episode, playback UI preferences, and local progress cache.

### Backend

- Next.js route handlers or server actions for the first release API surface.
- Prisma as the data access layer.
- Auth.js for credential auth and session handling.
- Zod validation on mutations.
- Admin route guards based on session role.

### Storage

- First release stores `audioUrl` and `coverUrl` as strings pointing to safe demo assets or external permitted URLs.
- Real S3/Cloudinary upload and transcoding are deliberately deferred.

## 8. Main User Flows

### Browse To Listen

1. User lands on `/`.
2. User searches or opens a shelf item.
3. User opens `/truyen/[slug]`.
4. User picks an episode.
5. Episode page opens and starts through explicit play interaction.
6. Sticky mini-player remains visible while browsing other pages.

### Signed-In Progress

1. User signs in.
2. User plays an episode.
3. Progress is cached locally and periodically synced to `ListenProgress`.
4. `/tai-khoan` shows listening history and resume actions.

### Follow And Rating

1. Signed-in user opens a story detail page.
2. User follows or unfollows the story.
3. User submits one rating per story.
4. Aggregate rating is reflected on detail and cards.

### Admin Catalog

1. Admin signs in.
2. Admin opens `/admin`.
3. Admin creates or edits categories, series, and episodes.
4. Admin can grant or remove mock VIP entitlement from a user.

## 9. Error Handling And States

- Public pages must show useful empty states for no stories, no search results, and missing categories.
- Detail pages should return a not-found view for unknown slugs.
- Forms must show field-level validation errors.
- Player must handle missing audio URL, failed load, duration unavailable, and unsupported browser behavior.
- Admin mutations should show success/error feedback and preserve entered data when validation fails.

## 10. Accessibility

- Semantic landmarks for header, main, nav, footer.
- Keyboard-accessible player controls.
- ARIA labels for icon-only player buttons.
- Visible focus states.
- Sufficient contrast in dark media surfaces.
- Mobile touch targets sized for reliable tapping.
- Sliders and progress controls must be operable and understandable with keyboard/screen reader where feasible.

## 11. Testing And Verification

Minimum verification before handoff:

- `npm run lint`
- `npm run build`
- Prisma generate/migration validation appropriate to the chosen setup.
- Manual browser verification for desktop and mobile widths.
- Core flow check: browse -> detail -> play -> mini-player -> search/filter -> login -> account -> admin edit.

Focused tests should cover:

- Data filtering/search helpers.
- Auth guard behavior.
- Follow/review/progress mutation validation.
- Player store state transitions.
- Admin role checks.

## 12. Implementation Boundaries

This spec defines the product and design direction only. Implementation should proceed through a separate plan before coding.

The first implementation should not attempt a perfect clone of any external website or Figma kit. External references are used only for product patterns and visual inspiration.

## 13. Open Constraints

- The workspace was not a git repository during spec creation, so the design spec could not be committed without initializing git.
- The original target website was not verified live in the provided research; all reverse-engineering claims remain assumptions.
- Real payment, real upload, and real transcoding require separate provider decisions.
