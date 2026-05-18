# Baseline Metrics Snapshot

Date: 2026-05-17
Owner: Codex implementation follow-up
Scope: retention/player, discovery, VIP/upsell, KPI snapshot, accessibility pass, and Core Web Vitals field reporting bootstrap

## Purpose

This document captures the current known baseline for the upgraded app without inventing production numbers.
Where field data does not exist yet, this document records the source of truth, rollout assumptions, and target thresholds.

## Current product baseline

Implemented and present in the codebase:

- Continuous play queue in the web player
- Sleep timer presets and end-of-episode stop behavior
- Continue listening shelf for signed-in users
- Faceted series filtering and ranking shelves (`Trending 24h`, `Trending 7d`, `Rising`)
- VIP comparison page and contextual upsell surfaces
- Admin KPI snapshot page backed by `/api/analytics/kpi`
- Accessibility hardening pass on focus states, labels, and touch targets
- Core Web Vitals field reporting bootstrap via a client reporter and `/api/analytics/vitals`

Feature flag defaults from `lib/features.ts`:

- `NEXT_PUBLIC_FEATURE_CONTINUOUS_PLAY=true`
- `NEXT_PUBLIC_FEATURE_SLEEP_TIMER=true`
- `NEXT_PUBLIC_FEATURE_RECOMMENDATION=false`
- `NEXT_PUBLIC_FEATURE_BOOKMARKS=true`
- `NEXT_PUBLIC_FEATURE_PAYWALL=false`

## Verification baseline

Known assumptions at the time this snapshot was written:

- The implementation plan records a prior full local verification pass on 2026-05-17.
- This document does not treat earlier verification as a standing guarantee for future deploys.
- Release decisions must be based on a fresh run from the release branch or release commit.

Minimum commands to rerun before rollout:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

## KPI baseline status

Current internal KPI source:

- Endpoint: `/api/analytics/kpi`
- Audience: admin only
- Data shape: retention proxies (`D1`, `D7`, `D30`), tracked listening hours, completion rate, total users, VIP user count

What is known now:

- KPI plumbing exists and is queryable by admins.
- The current KPI model is still a proxy model, not a warehouse-backed analytics pipeline.
- No durable baseline values should be copied into release reporting until a fresh post-release snapshot is taken.

What is not yet established:

- Production D1/D7/D30 baseline numbers
- Stable free-to-VIP conversion baseline
- Longitudinal recommendation impact baseline

## Core Web Vitals baseline status

Current field reporting source:

- Client hook: `useReportWebVitals`
- Ingestion endpoint: `/api/analytics/vitals`
- Storage: none yet; endpoint is ingestion-safe and no-op-safe

Current state:

- The app can now emit field vitals from real browsers without requiring a schema migration.
- This is an instrumentation-first baseline, not a measured p75 baseline yet.

Target thresholds for first release window:

- `LCP <= 2.5s` at p75
- `INP <= 200ms` at p75
- `CLS <= 0.10` at p75
- `FCP <= 1.8s` at p75
- `TTFB <= 0.8s` at p75

## Risk and interpretation notes

- Because paywall remains disabled by default, monetization numbers should be interpreted without gated premium access unless the flag is explicitly enabled.
- Bookmarks are now enabled by default, so retention measurements should account for saved-position and notes usage where signed-in traffic exists.
- Recommendation remains off by default, so homepage ranking changes are limited to the non-personalized shelves already shipped.
- The vitals endpoint is intentionally minimal. It proves reporting wiring and request shape, but it is not yet a reporting backend.

## Refresh procedure

Use this checklist when replacing this baseline with live numbers:

1. Run the full verification suite on the release commit.
2. Capture one admin KPI snapshot immediately before rollout.
3. Capture another KPI snapshot at `+24h`, `+7d`, and `+30d`.
4. Confirm `/api/analytics/vitals` is receiving valid payloads from production traffic.
5. Replace `unknown` or `not established` entries only with measured values and note the sample window.
