# Full Upgrade Implementation Plan (Retention + Discovery + Monetization + UX)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nang cap toan bo san pham tieuthuyetaudio theo roadmap 90 ngay de tang retention, listening minutes, va free-to-VIP conversion.

**Architecture:** Trien khai theo 4 track song song co thu tu phu thuoc: (1) player va listening flow, (2) discovery + recommendation, (3) monetization + paywall, (4) analytics + accessibility + hardening. Moi thay doi uu tien bo sung tren stack hien tai (Next.js App Router, Prisma, Zustand) va giam toi da migration phuc tap.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, Prisma/PostgreSQL, NextAuth, Zustand, Vitest, Playwright.

---

## Status

- [x] Core implementation batches completed for retention/player, discovery/filtering, VIP/upsell, analytics/admin KPI, and accessibility hardening.
- [x] Verification completed: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run build`.
- [ ] Remaining roadmap items still open: story-detail resume CTA, bookmark note editing, recommendation latency validation, soft paywall rules, analytics persistence depth, contrast/reduced-motion verification, deeper performance optimization, CI seed hardening, and finalized monetization model details.

## Scope

- In:
  - Continuous play, sleep timer, continue listening shelf, bookmark/note timeline.
  - Faceted filtering + recommendation v1 + ranking upgrades.
  - VIP proposition upgrade + soft paywall + entitlement checks.
  - Event analytics + KPI dashboard endpoint + Core Web Vitals field metrics.
  - Accessibility hardening (WCAG 2.2 practical checklist for player/nav/forms).
  - Full test pass: lint, typecheck, unit, e2e, build.
- Out:
  - Real payment gateway production integration.
  - Native mobile app (Android/iOS) beyond PWA.
  - AI voice generation or narrator switching engine.

## Action items

### Task 1: Baseline + feature flags
**Files:**
- Create: `lib/features.ts`
- Create: `docs/superpowers/specs/2026-05-17-baseline-metrics.md`
- Modify: `app/layout.tsx`

- [x] Add runtime feature flags for `continuousPlay`, `sleepTimer`, `bookmarks`, `recommendationV1`, `softPaywall`.
- [x] Add a baseline metrics doc capturing current retention/engagement numbers and assumptions.
- [x] Wire feature flags into app shell so each large feature can be turned off safely.
- [x] Run `npm run typecheck`.

### Task 2: Player state model v2
**Files:**
- Modify: `stores/player-store.ts`
- Modify: `components/player/player-provider.tsx`
- Test: `tests/unit/player-store.test.ts`

- [x] Extend store state with queue, currentQueueIndex, timer state, auto-next toggles, bookmark actions.
- [x] Refactor provider to support next episode auto-advance and timer stop behavior.
- [x] Add unit tests for queue transitions, seek boundaries, and timer expiry.
- [x] Run `npm run test -- player-store`.

### Task 3: Continuous play + queue UX
**Files:**
- Modify: `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`
- Modify: `components/series/episode-list.tsx`
- Modify: `components/player/audio-player.tsx`
- Modify: `components/player/mini-player.tsx`
- Test: `tests/e2e/smoke.spec.ts`

- [x] Build queue payload from series episode list on episode page.
- [x] Add `Play next` and `Auto-play` controls to player UI.
- [x] Show next-up metadata in mini-player when near end of episode.
- [x] Add e2e assertions for "episode end -> next episode starts".
- [x] Run `npm run test:e2e`.

### Task 4: Sleep timer
**Files:**
- Modify: `components/player/audio-player.tsx`
- Modify: `components/player/player-provider.tsx`
- Test: `tests/unit/player-store.test.ts`

- [x] Add timer presets (10/20/30/45 minutes, end-of-episode).
- [x] Stop playback and clear timer state on expiry.
- [x] Persist timer settings in client state (session-level).
- [x] Add tests for timer start/cancel/expire.
- [x] Run `npm run test`.

### Task 5: Continue listening surfaces
**Files:**
- Modify: `lib/account/queries.ts`
- Modify: `lib/series/queries.ts`
- Modify: `app/page.tsx`
- Modify: `app/tai-khoan/page.tsx`
- Create: `components/series/continue-listening-shelf.tsx`

- [x] Add query for "most recently active episode per user" with percent completed.
- [x] Add home shelf `Nghe tiep` above other shelves for signed-in users.
- [x] Add resume CTA in account history cards and story detail header.
- [x] Verify no regressions for anonymous users (shelf hidden safely).

### Task 6: Bookmarks + notes timeline
**Files:**
- Modify: `prisma/schema.prisma`
- Create: `app/api/bookmarks/route.ts`
- Modify: `components/player/audio-player.tsx`
- Create: `components/player/bookmark-list.tsx`
- Test: `tests/unit/validators.test.ts`

- [x] Add `Bookmark` model with userId, episodeId, second, note, createdAt.
- [x] Implement CRUD API with auth guard and Zod validation.
- [x] Add timeline list under player for jump-to-saved-position.
- [x] Add create/edit/delete note flows with optimistic UI.
- [x] Run `npm run db:generate`, `npm run typecheck`, `npm run test`.

### Task 7: Faceted filtering upgrade
**Files:**
- Modify: `lib/series/validators.ts`
- Modify: `lib/series/queries.ts`
- Modify: `components/series/series-filters.tsx`
- Modify: `app/truyen/page.tsx`
- Test: `tests/unit/series-queries.test.ts`

- [x] Add filter fields: minEpisodes, maxEpisodes, minRating, hasAudio, sortByCompletion.
- [x] Update Prisma query builder with indexed conditions and stable ordering.
- [x] Upgrade filter UI with mobile-friendly drawers/chips.
- [x] Add unit tests for combined filter cases and edge values.
- [x] Run `npm run test -- series-queries`.

### Task 8: Recommendation v1 + ranking blocks
**Files:**
- Modify: `lib/series/queries.ts`
- Modify: `app/page.tsx`
- Modify: `components/series/story-shelf.tsx`

- [ ] Add recommendation strategy using weighted signals: follows, categories, completion, recency.
- [x] Split homepage rankings into `Trending 24h`, `Trending 7d`, `Rising`.
- [x] Add fallback path for users without history.
- [ ] Validate query latency with realistic seeded data.

### Task 9: VIP proposition + soft paywall
**Files:**
- Modify: `app/vip/page.tsx`
- Create: `components/vip/plan-comparison.tsx`
- Create: `components/vip/contextual-upsell.tsx`
- Modify: `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`
- Modify: `lib/auth.ts`

- [x] Redesign VIP page with free vs VIP matrix and FAQ.
- [x] Add contextual upsell triggers at high-intent moments (after N episodes, on bookmark use).
- [ ] Add soft paywall rules on marked premium episodes (feature-flagged).
- [x] Ensure non-blocking path for demo content and admin testing.

### Task 10: Event instrumentation + KPI endpoints
**Files:**
- Create: `lib/analytics/events.ts`
- Modify: `components/player/player-provider.tsx`
- Modify: `app/api/progress/route.ts`
- Create: `app/api/analytics/kpi/route.ts`
- Create: `app/admin/analytics/page.tsx`

- [x] Emit standardized events: play_start, play_pause, seek, complete_episode, autoplay_next, bookmark_create, upsell_click.
- [x] Persist aggregation-ready fields (userId, seriesId, episodeId, timestamp, sessionId).
- [x] Expose internal KPI endpoint for D1/D7/D30, completion, conversion proxies.
- [x] Build admin analytics page with basic charts/tables.

### Task 11: Accessibility + mobile ergonomics pass
**Files:**
- Modify: `components/player/audio-player.tsx`
- Modify: `components/layout/mobile-nav.tsx`
- Modify: `components/search/search-box.tsx`
- Modify: `components/series/series-filters.tsx`
- Modify: `app/globals.css`

- [x] Ensure focus visibility and focus-not-obscured for keyboard navigation.
- [x] Increase touch target sizes for critical controls (player, nav, filter chips).
- [x] Add/verify ARIA labels and status messages for dynamic UI.
- [ ] Verify color contrast and reduced-motion compatibility.

### Task 12: Performance hardening (Core Web Vitals)
**Files:**
- Modify: `app/page.tsx`
- Modify: `app/truyen/page.tsx`
- Modify: `app/truyen/[slug]/page.tsx`
- Modify: `components/series/story-card.tsx`
- Modify: `next.config.ts`

- [ ] Optimize LCP assets (cover loading priority strategy and responsive image sizing).
- [ ] Reduce hydration cost on heavy interactive blocks.
- [x] Add web-vitals field reporting hook and aggregate p75 targets.
- [ ] Validate LCP/INP/CLS via local and field pipelines.

### Task 13: Regression test expansion
**Files:**
- Modify: `tests/e2e/smoke.spec.ts`
- Create: `tests/e2e/player-retention.spec.ts`
- Modify: `tests/unit/format.test.ts`
- Modify: `tests/unit/series-queries.test.ts`

- [x] Add e2e scenarios for continuous play, timer, paywall states, resume flow.
- [x] Add unit coverage for new validators and ranking math.
- [ ] Ensure deterministic seeded dataset for CI.
- [x] Run `npm run lint && npm run typecheck && npm run test && npm run test:e2e`.

### Task 14: Release gate + rollout checklist
**Files:**
- Create: `docs/superpowers/specs/2026-05-17-release-checklist.md`
- Modify: `README.md`

- [x] Document rollout order by feature flag and rollback actions.
- [x] Define success criteria after launch windows (24h/7d/30d).
- [x] Publish runbook for support/admin troubleshooting.
- [x] Run `npm run build` and capture final verification report.

## Open questions

- Premium access model cho v1 se uu tien cach nao: full subscription, chapter lock, hay hybrid?
- Co yeu cau dong bo bookmark/progress cho guest user qua local-only mode khong?
- Muc KPI target cu the cho 30 ngay dau (D7 retention, completion rate, VIP conversion) la bao nhieu?
