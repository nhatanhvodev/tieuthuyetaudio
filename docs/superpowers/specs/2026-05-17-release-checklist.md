# Release Checklist

Date: 2026-05-17
Scope: upgraded web player, discovery surfaces, VIP upsell, KPI monitoring, and vitals instrumentation

## Preconditions

Release only when all of the following are true:

1. `npm run typecheck` passes on the release commit.
2. `npm run build` passes on the release commit.
3. The admin team can access `/admin/analytics`.
4. Runtime env values for feature flags are reviewed intentionally, not left implicit.
5. The release owner knows which features stay off by default:
   - `NEXT_PUBLIC_FEATURE_RECOMMENDATION=false`
   - `NEXT_PUBLIC_FEATURE_PAYWALL=false`

## Rollout order

Use this order to minimize blast radius:

1. Deploy the build with `analytics` and `vitals` ingestion active first.
2. Keep `recommendation` and `paywall` disabled on the first deploy.
3. Enable `continuousPlay` if player QA is green in production-like smoke checks.
4. Enable `sleepTimer` after player playback remains stable.
5. Observe `Nghe tiep` and ranking shelves for signed-in and anonymous users.
6. Enable VIP page and contextual upsell surfaces after confirming no navigation regressions.
7. Confirm bookmark create/jump/delete flows for a signed-in user before broad announcement.
8. Evaluate `recommendation` in a later release window after query latency and content quality checks.
9. Keep `paywall` off until monetization rules are separately verified.

## Rollback notes

Fast rollback levers:

1. Disable feature flags and redeploy:
   - `NEXT_PUBLIC_FEATURE_CONTINUOUS_PLAY=false`
   - `NEXT_PUBLIC_FEATURE_SLEEP_TIMER=false`
   - `NEXT_PUBLIC_FEATURE_RECOMMENDATION=false`
   - `NEXT_PUBLIC_FEATURE_PAYWALL=false`
2. If bookmark creation or deletion regresses, set `NEXT_PUBLIC_FEATURE_BOOKMARKS=false` and redeploy.
3. If playback behavior regresses, turn off `continuousPlay` before touching other features.
4. If timer behavior regresses, turn off `sleepTimer` only; do not roll back the full player unless playback itself is broken.
5. If discovery CTR or query latency regresses, keep the new shelves but disable `recommendation`.
6. If the vitals endpoint is noisy or malformed, leave it as a `202` no-op and patch the reporter in the next deploy.

## Success criteria windows

### First 24 hours

- No blocker reports for play, pause, seek, or episode transition
- No sign of a broad increase in server errors during normal listening flows
- `/api/analytics/vitals` receives valid payloads
- `/admin/analytics` remains readable by admins
- Completion proxy and tracked listening are not materially worse than the previous day

### First 7 days

- D1 retention proxy is flat or improving
- Tracked listening hours per active user are flat or improving
- Continue-listening usage is visible in signed-in traffic
- Upsell surfaces do not create a measurable drop in episode starts

### First 30 days

- D7 retention proxy improves versus the pre-release baseline window
- Completion proxy improves or remains stable after player changes
- VIP proxy metrics are stable or improving if upsell remains enabled
- Recommendation stays off unless quality and latency checks are acceptable

## Support runbook

Use these checks before escalating:

1. Inspect `body[data-feature-flags]` in the rendered page to confirm the active runtime flags.
2. Confirm the player issue is reproducible with the same episode and browser family.
3. Check whether the problem disappears when `continuousPlay` or `sleepTimer` is disabled.
4. For analytics questions, compare `/admin/analytics` with the last captured release snapshot.
5. For vitals wiring, send a valid `POST` payload to `/api/analytics/vitals` and confirm the endpoint returns `202`.

## Out of scope for this release

These items should not be treated as release blockers for the current slice:

- Persistent vitals storage or aggregation backend
- Production payment gateway integration
- Fully enabled soft paywall behavior
