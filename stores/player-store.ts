import { create } from "zustand";
import { createStore } from "zustand/vanilla";

export type PlayerEpisode = {
  episodeId: string;
  seriesSlug: string;
  episodeNumber: number;
  title: string;
  seriesTitle: string;
  audioUrl: string;
  coverUrl?: string | null;
};

type PlayerProgress = {
  currentSeconds: number;
  durationSeconds: number;
};

export type SleepTimerMode = "off" | "minutes" | "end_of_episode";

export type SleepTimerState = {
  mode: SleepTimerMode;
  minutes: number | null;
  expiresAt: number | null;
};

type LoadEpisodeOptions = {
  queue?: PlayerEpisode[];
  queueIndex?: number;
  autoPlay?: boolean;
};

export type PlayerState = {
  current: PlayerEpisode | null;
  queue: PlayerEpisode[];
  currentQueueIndex: number;
  isPlaying: boolean;
  autoPlayNext: boolean;
  rate: number;
  volume: number;
  progress: PlayerProgress;
  sleepTimer: SleepTimerState;
  seekRequest: number | null;
  loadEpisode: (episode: PlayerEpisode, options?: LoadEpisodeOptions) => void;
  setQueue: (queue: PlayerEpisode[], currentEpisodeId?: string) => void;
  playNextInQueue: () => PlayerEpisode | null;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setAutoPlayNext: (enabled: boolean) => void;
  setProgress: (currentSeconds: number, durationSeconds: number) => void;
  requestSeek: (seconds: number) => void;
  startSleepTimerMinutes: (minutes: number) => void;
  startSleepTimerEndOfEpisode: () => void;
  cancelSleepTimer: () => void;
  expireSleepTimer: () => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  clear: () => void;
};

const initialState = {
  current: null,
  queue: [] as PlayerEpisode[],
  currentQueueIndex: -1,
  isPlaying: false,
  autoPlayNext: true,
  rate: 1,
  volume: 1,
  progress: {
    currentSeconds: 0,
    durationSeconds: 0
  },
  sleepTimer: {
    mode: "off" as SleepTimerMode,
    minutes: null,
    expiresAt: null
  },
  seekRequest: null
};

function createPlayerState(set: (partial: PlayerState | Partial<PlayerState> | ((state: PlayerState) => PlayerState | Partial<PlayerState>)) => void, get: () => PlayerState): PlayerState {
  return {
    ...initialState,
    loadEpisode: (episode, options) =>
      set((state) => {
        const queue = options?.queue ?? state.queue;
        const queueIndex = options?.queueIndex ?? queue.findIndex((item) => item.episodeId === episode.episodeId);
        return {
          current: episode,
          queue,
          currentQueueIndex: queueIndex,
          isPlaying: Boolean(options?.autoPlay),
          progress: { currentSeconds: 0, durationSeconds: 0 },
          seekRequest: null
        };
      }),
    setQueue: (queue, currentEpisodeId) =>
      set((state) => {
        const matchEpisodeId = currentEpisodeId ?? state.current?.episodeId ?? "";
        return {
          queue,
          currentQueueIndex: queue.findIndex((item) => item.episodeId === matchEpisodeId)
        };
      }),
    playNextInQueue: () => {
      const state = get();
      const resolvedCurrentIndex =
        state.currentQueueIndex >= 0
          ? state.currentQueueIndex
          : state.current
            ? state.queue.findIndex((item) => item.episodeId === state.current?.episodeId)
            : -1;
      const nextIndex = resolvedCurrentIndex + 1;
      const nextEpisode = state.queue[nextIndex] ?? null;
      if (!nextEpisode) {
        set({ isPlaying: false });
        return null;
      }

      set({
        current: nextEpisode,
        currentQueueIndex: nextIndex,
        isPlaying: true,
        progress: { currentSeconds: 0, durationSeconds: 0 },
        seekRequest: null
      });

      return nextEpisode;
    },
    togglePlay: () => set((state) => ({ isPlaying: Boolean(state.current) && !state.isPlaying })),
    setPlaying: (isPlaying) => set((state) => ({ isPlaying: Boolean(state.current) && isPlaying })),
    setAutoPlayNext: (enabled) => set({ autoPlayNext: enabled }),
    setProgress: (currentSeconds, durationSeconds) =>
      set({
        progress: {
          currentSeconds: Math.max(0, Math.floor(currentSeconds || 0)),
          durationSeconds: Math.max(0, Math.floor(durationSeconds || 0))
        }
      }),
    requestSeek: (seconds) =>
      set((state) => ({
        seekRequest: Math.max(0, Math.min(state.progress.durationSeconds || seconds, seconds))
      })),
    startSleepTimerMinutes: (minutes) =>
      set(() => {
        const safeMinutes = Math.max(1, Math.floor(minutes));
        return {
          sleepTimer: {
            mode: "minutes",
            minutes: safeMinutes,
            expiresAt: Date.now() + safeMinutes * 60 * 1000
          }
        };
      }),
    startSleepTimerEndOfEpisode: () =>
      set({
        sleepTimer: {
          mode: "end_of_episode",
          minutes: null,
          expiresAt: null
        }
      }),
    cancelSleepTimer: () =>
      set({
        sleepTimer: {
          mode: "off",
          minutes: null,
          expiresAt: null
        }
      }),
    expireSleepTimer: () =>
      set({
        isPlaying: false,
        sleepTimer: {
          mode: "off",
          minutes: null,
          expiresAt: null
        }
      }),
    setRate: (rate) => set({ rate }),
    setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    clear: () => set(initialState)
  };
}

export function createPlayerStore() {
  return createStore<PlayerState>((set, get) => createPlayerState(set, get));
}

export const usePlayerStore = create<PlayerState>((set, get) => createPlayerState(set, get));
