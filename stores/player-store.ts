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

export type PlayerState = {
  current: PlayerEpisode | null;
  isPlaying: boolean;
  rate: number;
  volume: number;
  progress: PlayerProgress;
  loadEpisode: (episode: PlayerEpisode) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setProgress: (currentSeconds: number, durationSeconds: number) => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  clear: () => void;
};

const initialState = {
  current: null,
  isPlaying: false,
  rate: 1,
  volume: 1,
  progress: {
    currentSeconds: 0,
    durationSeconds: 0
  }
};

export function createPlayerStore() {
  return createStore<PlayerState>((set) => ({
    ...initialState,
    loadEpisode: (episode) =>
      set({
        current: episode,
        isPlaying: false,
        progress: { currentSeconds: 0, durationSeconds: 0 }
      }),
    togglePlay: () => set((state) => ({ isPlaying: Boolean(state.current) && !state.isPlaying })),
    setPlaying: (isPlaying) => set((state) => ({ isPlaying: Boolean(state.current) && isPlaying })),
    setProgress: (currentSeconds, durationSeconds) =>
      set({
        progress: {
          currentSeconds: Math.max(0, Math.floor(currentSeconds || 0)),
          durationSeconds: Math.max(0, Math.floor(durationSeconds || 0))
        }
      }),
    setRate: (rate) => set({ rate }),
    setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    clear: () => set(initialState)
  }));
}

export const usePlayerStore = create<PlayerState>((set) => ({
  ...initialState,
  loadEpisode: (episode) =>
    set({
      current: episode,
      isPlaying: false,
      progress: { currentSeconds: 0, durationSeconds: 0 }
    }),
  togglePlay: () => set((state) => ({ isPlaying: Boolean(state.current) && !state.isPlaying })),
  setPlaying: (isPlaying) => set((state) => ({ isPlaying: Boolean(state.current) && isPlaying })),
  setProgress: (currentSeconds, durationSeconds) =>
    set({
      progress: {
        currentSeconds: Math.max(0, Math.floor(currentSeconds || 0)),
        durationSeconds: Math.max(0, Math.floor(durationSeconds || 0))
      }
    }),
  setRate: (rate) => set({ rate }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  clear: () => set(initialState)
}));
