# Spotify-Style Audio Player Redesign Specification

## 1. Overview

This document outlines the redesign of the audio player to match the Spotify user experience, focusing on modern UI patterns, improved user interaction, and a refined visual design.

## 2. Current State Analysis

### 2.1 Existing Components

- **AudioPlayer** (`components/player/audio-player.tsx`): Main player with episode info, progress bar, controls, bookmarks, sleep timer
- **MiniPlayer** (`components/player/mini-player.tsx`): Compact player for bottom of screen with queue navigation
- **PlayerProvider** (`components/player/player-provider.tsx`): Audio element management and analytics tracking
- **PlayerStore** (`stores/player-store.ts`): Zustand store managing playback state

### 2.2 Current Features Preserved

- Episode information display (cover, title, series)
- Progress bar with time display
- Play/pause, skip forward/backward
- Playback speed controls (0.75x - 2x)
- Volume controls
- Sleep timer
- Auto-play next episode
- Bookmark system

## 3. Design Goals (Spotify-like Experience)

### 3.1 Visual Design
- **Dark theme** as primary background (#121212)
- **Circular album art** with vinyl-style rotation animation when playing
- **Minimal progress bar** with subtle hover preview
- **Large central play button** on main player
- **Clean typography** with clear hierarchy

### 3.2 Interaction Patterns
- **Swipe-to-seek** on progress bar
- **Hover time preview** on both full and mini players
- **Smooth animations** for all state transitions
- **Contextual next episode** preview when nearing end (85%+)

## 4. Component Specifications

### 4.1 AudioPlayer Component

```typescript
// Key visual elements
<section className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212] p-4 text-white shadow-[0_24px_60px_rgba(0,0,0,0.55)] md:p-6">
  <div className="grid gap-5 md:grid-cols-[220px_1fr]">
    {/* Album Art Column */}
    <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-800">
      <img className={`absolute inset-0 size-full object-cover ${isPlaying ? "animate-[spin_16s_linear_infinite]" : ""}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
    </div>

    {/* Controls Column */}
    <div>
      {/* Episode Info */}
      <p className="text-sm text-zinc-400">Series Title</p>
      <p className="text-2xl font-black">{Episode Title}</p>

      {/* Progress Bar */}
      <div className="relative h-7 cursor-pointer">
        {/* Waveform visualization */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(...)]" />
        <div className="absolute inset-y-0 left-0 bg-emerald-400" style={{width: `${progressPercent}%`}} />
        {/* Hover preview */}
        {waveHoverSeconds && (
          <>
            <div className="absolute w-px bg-emerald-300" style={{left: `${hoverPosition}%`}} />
            <div className="absolute -top-7 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px]">
              {formatSeconds(waveHoverSeconds)}
            </div>
          </>
        )}
      </div>

      {/* Control Buttons */}
      <div>
        <button className="rounded-full">Back 10s</button>
        <button className="h-12 w-12 rounded-full bg-white text-black">Play/Pause</button>
        <button className="rounded-full">Forward 10s</button>
        {/* Speed selector */}
        {/* Volume selector */}
      </div>

      {/* Sleep Timer */}
      {/* Bookmarks */}
    </div>
  </div>
</section>
```

### 4.2 MiniPlayer Component

```typescript
// Compact bottom player
<aside className="fixed inset-x-3 bottom-[4.7rem] z-40 overflow-hidden rounded-2xl border border-white/10 bg-[#121212]/95 p-3 text-white shadow-[0_20px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl">
  <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
    {/* Left: Episode Info */}
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
        <img className="absolute inset-0 size-full object-cover" />
      </div>
      <Link href={`/truyen/${current.seriesSlug}/tap/${current.episodeNumber}`}>
        <p className="truncate text-sm font-semibold text-white">{current.title}</p>
        <p className="truncate text-xs text-zinc-300">{current.seriesTitle}</p>
      </Link>
    </div>

    {/* Center: Progress + Controls */}
    <div className="flex min-w-[380px] flex-col items-center">
      <div className="flex items-center gap-2">
        <button className="h-9 w-9 rounded-full">Prev</button>
        <button className="h-9 w-9 rounded-full">Play/Pause</button>
        <button className="h-9 w-9 rounded-full">Next</button>
      </div>
      <div className="mt-2 w-full relative h-7 cursor-pointer">
        <div className="absolute inset-y-1 left-1 right-1 rounded bg-[...] opacity-30" />
        <div className="absolute inset-y-1 left-1 rounded bg-emerald-400" style={{width: waveformPercent}} />
      </div>
    </div>

    {/* Right: Volume + Extras */}
    <div className="ml-auto flex items-center gap-3">
      <span className="text-[11px] text-zinc-300">{progressText}</span>
      <input type="range" className="h-1.5 w-24" />
    </div>
  </div>
</aside>
```

## 5. Data Flow Architecture

### 5.1 State Management (Zustand)
- `current`: Currently playing episode
- `queue`: List of queued episodes
- `isPlaying`: Playback state
- `rate`: Playback speed (0.75-2x)
- `volume`: Volume level (0-1)
- `progress`: { currentSeconds, durationSeconds }
- `autoPlayNext`: Auto-play setting
- `sleepTimer`: Timer configuration

### 5.2 Component Communication
```
PlayerProvider (audio element)
    │
    ├── AudioPlayer (full view)
    │   └── Uses: usePlayerStore
    │
    └── MiniPlayer (compact view)
        └── Uses: usePlayerStore
```

## 6. Implementation Plan (High-level)

### Phase 1: Visual Redesign
- Update progress bar styling to match Spotify's minimal design
- Implement hover time preview
- Add vinyl-style album art rotation
- Update color scheme and shadows

### Phase 2: Interaction Improvements
- Smooth animations for play/pause states
- Enhanced progress bar interaction
- Mobile-responsive touch targets

### Phase 3: Feature Integration
- Keep all existing functionality (bookmarks, sleep timer, auto-play)
- Ensure accessibility with proper ARIA labels
- Add keyboard shortcuts

## 7. Success Criteria

- [ ] Visual design matches Spotify aesthetic
- [ ] Progress bar shows time preview on hover
- [ ] Album art rotates smoothly when playing
- [ ] All existing features remain functional
- [ ] Mobile and desktop experiences are polished
- [ ] Accessible with keyboard navigation

## 8. Notes

- Keep existing feature flags for gradual rollout
- Maintain backward compatibility with bookmark system
- Analytics events should continue working