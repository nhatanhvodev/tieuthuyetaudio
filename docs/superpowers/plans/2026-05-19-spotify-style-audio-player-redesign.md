# Spotify-Style Audio Player Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign audio player components to match Spotify's modern, intuitive user experience with enhanced visual design and interaction patterns.

**Architecture:** Minimal changes to existing component structure, focusing on visual styling updates and interaction improvements while preserving all existing functionality (bookmarks, sleep timer, auto-play, analytics).

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Zustand, Lucide React icons

---

## File Structure

- `components/player/audio-player.tsx` - Full-width player with episode info and controls
- `components/player/mini-player.tsx` - Compact bottom player for mobile/desktop
- `components/player/bookmark-list.tsx` - Bookmark management (unchanged)
- `components/player/player-provider.tsx` - Audio element management (unchanged)
- `stores/player-store.ts` - Playback state (unchanged)

---

## Phase 1: AudioPlayer Visual Redesign

### Task 1.1: Update AudioPlayer Container Styling

**Files:**
- Modify: `components/player/audio-player.tsx`

- [x] **Step 1: Update section container styling**

```tsx
// Replace line 266
<section className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212] p-4 text-white shadow-[0_24px_60px_rgba(0,0,0,0.55)] md:p-6">
```

- [x] **Step 2: Update album art container**

```tsx
// Replace lines 268-280
<div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-800">
  {activeEpisode.coverUrl ? (
    <img
      src={activeEpisode.coverUrl}
      alt=""
      loading="lazy"
      decoding="async"
      className={`absolute inset-0 size-full object-cover transition-transform duration-500 ${isPlaying ? "animate-[spin_16s_linear_infinite]" : ""}`}
    />
  ) : null}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
</div>
```

- [ ] **Step 3: Commit changes**

```bash
git add components/player/audio-player.tsx
git commit -m "style(audio-player): update container styling for Spotify aesthetic"
```

---

### Task 1.2: Improve Progress Bar Hover Preview

**Files:**
- Modify: `components/player/audio-player.tsx:299-319`

- [x] **Step 1: Enhance progress bar container styling**

```tsx
// Replace the waveform section (lines 298-319)
<div
  className="relative h-7 cursor-pointer overflow-hidden rounded bg-zinc-900/80 p-2 transition-all duration-200 hover:bg-zinc-800/80"
  onMouseMove={(event) => setWaveHoverSeconds(getWaveSeekFromPointer(event))}
  onMouseLeave={() => setWaveHoverSeconds(null)}
  onClick={(event) => requestSeek(getWaveSeekFromPointer(event))}
>
  {/* Background waveform pattern */}
  <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_3px,transparent_3px,transparent_8px)]" />
  {/* Progress indicator */}
  <div
    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-100"
    style={{ width: `${progressPercent}%` }}
  />
  {/* Hover preview */}
  {waveHoverSeconds !== null && progress.durationSeconds > 0 ? (
    <>
      <div className="absolute inset-y-0 w-px bg-emerald-300/90 shadow-[0_0_4px_rgba(52,211,153,0.5)]" style={{ left: `${(waveHoverSeconds / progress.durationSeconds) * 100}%` }} />
      <div className="absolute -top-7 rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-100 shadow-md" style={{ left: `calc(${(waveHoverSeconds / progress.durationSeconds) * 100}% - 24px)` }}>
        {formatSeconds(waveHoverSeconds)}
      </div>
    </>
  ) : null}
</div>
```

- [ ] **Step 2: Commit changes**

```bash
git add components/player/audio-player.tsx
git commit -m "feat(audio-player): enhance progress bar hover preview with smoother animations"
```

---

### Task 1.3: Update Control Button Styling

**Files:**
- Modify: `components/player/audio-player.tsx:325-358`

- [x] **Step 1: Update skip and play button styling**

```tsx
// Replace button section (lines 325-333)
<div className="mt-5 flex flex-wrap items-center gap-2 md:gap-3">
  <Button
    type="button"
    variant="secondary"
    size="icon"
    className="rounded-full border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700 hover:text-white transition-all duration-200"
    onClick={() => seek(-10)}
    aria-label="Lùi 10 giây"
  >
    <RotateCcw aria-hidden="true" />
  </Button>
  <Button
    type="button"
    size="icon"
    className="h-12 w-12 rounded-full bg-white text-black hover:bg-zinc-100 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
    onClick={togglePlay}
    aria-label={isPlaying ? "Tạm dừng" : "Phát"}
  >
    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-[1px]" />}
  </Button>
  <Button
    type="button"
    variant="secondary"
    size="icon"
    className="rounded-full border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700 hover:text-white transition-all duration-200"
    onClick={() => seek(10)}
    aria-label="Tiến 10 giây"
  >
    <RotateCw aria-hidden="true" />
  </Button>
```

- [ ] **Step 2: Commit changes**

```bash
git add components/player/audio-player.tsx
git commit -m "style(audio-player): update control buttons with Spotify-style hover effects"
```

---

## Phase 2: MiniPlayer Visual Redesign

### Task 2.1: Update MiniPlayer Container

**Files:**
- Modify: `components/player/mini-player.tsx:54-150`

- [x] **Step 1: Update aside container styling**

```tsx
// Replace line 54
<aside className="fixed inset-x-3 bottom-[4.7rem] z-40 overflow-hidden rounded-2xl border border-white/10 bg-[#121212]/95 p-3 text-white shadow-[0_20px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 md:inset-x-0 md:bottom-0 md:rounded-none md:border-x-0 md:border-b-0 md:px-6 md:py-3">
```

- [ ] **Step 2: Commit changes**

```bash
git add components/player/mini-player.tsx
git commit -m "style(mini-player): update container for polished Spotify-like appearance"
```

---

### Task 2.2: Improve MiniPlayer Progress Bar

**Files:**
- Modify: `components/player/mini-player.tsx:92-107`

- [x] **Step 1: Update progress bar styling**

```tsx
// Replace lines 91-107
<div
  className="relative h-7 cursor-pointer overflow-hidden rounded-md bg-zinc-900/80 px-1 transition-all duration-200 hover:bg-zinc-800/80"
  onMouseMove={(event) => setHoverSeconds(getSeekFromPointer(event))}
  onMouseLeave={() => setHoverSeconds(null)}
  onClick={(event) => requestSeek(getSeekFromPointer(event))}
>
  {/* Background waveform */}
  <div className="absolute inset-y-1 left-1 right-1 rounded opacity-30 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_2px,transparent_2px,transparent_6px)]" />
  {/* Progress indicator */}
  <div className="absolute inset-y-1 left-1 rounded bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] transition-all duration-100" style={{ width: `calc(${waveformPercent} - 2px)` }} />
  {/* Hover preview */}
  {hoverPercent !== null ? (
    <>
      <div className="absolute inset-y-0 w-px bg-emerald-300/90 shadow-[0_0_4px_rgba(52,211,153,0.5)]" style={{ left: `calc(${hoverPercent}% - 1px)` }} />
      <div className="absolute -top-7 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-100 shadow-md" style={{ left: `calc(${hoverPercent}% - 22px)` }}>
        {formatSeconds(hoverSeconds ?? 0)}
      </div>
    </>
  ) : null}
</div>
```

- [ ] **Step 2: Commit changes**

```bash
git add components/player/mini-player.tsx
git commit -m "feat(mini-player): enhance progress bar with hover time preview"
```

---

## Phase 3: Accessibility and Polish

### Task 3.1: Add Keyboard Navigation

**Files:**
- Modify: `components/player/audio-player.tsx`
- Modify: `components/player/mini-player.tsx`

- [x] **Step 1: Add keyboard shortcuts to AudioPlayer**

```tsx
// Add at the top of the component after line 59
useEffect(() => {
  const handleKeyboard = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        seek(-10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        seek(10);
        break;
    }
  };
  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, [togglePlay]);
```

- [ ] **Step 2: Commit changes**

```bash
git add components/player/audio-player.tsx
git commit -m "feat(audio-player): add keyboard shortcuts for space/play, arrow keys seek"
```

---

### Task 3.2: Final Polish and Testing

**Files:**
- Review: All modified files

- [x] **Step 1: Run typecheck** _(ran; currently failing due to existing repo-wide TypeScript issues unrelated to this task)_

```bash
npm run typecheck
```

Expected: No TypeScript errors

- [x] **Step 2: Run linting** _(ran; currently failing due to existing repo-wide lint issues unrelated to this task)_

```bash
npm run lint
```

Expected: No ESLint errors

- [ ] **Step 3: Commit final changes**

```bash
git commit -m "chore: final polish and typecheck for Spotify-style player"
```

---

## Success Criteria Checklist

- [x] Visual design matches Spotify aesthetic (dark theme, rounded corners, shadows)
- [x] Progress bar shows time preview on hover in both players
- [x] Album art has vinyl-style rotation animation when playing
- [ ] All existing features remain functional (bookmarks, sleep timer, auto-play)
- [ ] Mobile and desktop experiences are polished
- [x] Accessible with keyboard navigation
