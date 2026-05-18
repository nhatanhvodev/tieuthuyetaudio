import { describe, expect, it } from "vitest";
import { createPlayerStore } from "@/stores/player-store";

describe("player store", () => {
  it("loads an episode and updates progress", () => {
    const store = createPlayerStore();
    store.getState().loadEpisode({
      episodeId: "ep1",
      seriesSlug: "demo",
      episodeNumber: 1,
      title: "Tap 1",
      seriesTitle: "Demo",
      audioUrl: "https://example.com/audio.mp3",
      coverUrl: ""
    });
    store.getState().setProgress(42, 120);
    expect(store.getState().current?.episodeId).toBe("ep1");
    expect(store.getState().progress.currentSeconds).toBe(42);
  });

  it("advances to the next queued episode", () => {
    const store = createPlayerStore();
    const queue = [
      {
        episodeId: "ep1",
        seriesSlug: "demo",
        episodeNumber: 1,
        title: "Tap 1",
        seriesTitle: "Demo",
        audioUrl: "https://example.com/audio-1.mp3"
      },
      {
        episodeId: "ep2",
        seriesSlug: "demo",
        episodeNumber: 2,
        title: "Tap 2",
        seriesTitle: "Demo",
        audioUrl: "https://example.com/audio-2.mp3"
      }
    ];

    store.getState().loadEpisode(queue[0], { queue, queueIndex: 0 });
    const next = store.getState().playNextInQueue();

    expect(next?.episodeId).toBe("ep2");
    expect(store.getState().current?.episodeId).toBe("ep2");
    expect(store.getState().currentQueueIndex).toBe(1);
    expect(store.getState().isPlaying).toBe(true);
  });

  it("advances correctly even when currentQueueIndex is missing", () => {
    const store = createPlayerStore();
    const queue = [
      {
        episodeId: "ep1",
        seriesSlug: "demo",
        episodeNumber: 1,
        title: "Tap 1",
        seriesTitle: "Demo",
        audioUrl: "https://example.com/audio-1.mp3"
      },
      {
        episodeId: "ep2",
        seriesSlug: "demo",
        episodeNumber: 2,
        title: "Tap 2",
        seriesTitle: "Demo",
        audioUrl: "https://example.com/audio-2.mp3"
      }
    ];

    store.getState().loadEpisode(queue[0], { queue, queueIndex: -1 });
    const next = store.getState().playNextInQueue();

    expect(next?.episodeId).toBe("ep2");
    expect(store.getState().current?.episodeId).toBe("ep2");
  });

  it("clamps seek request in duration range", () => {
    const store = createPlayerStore();
    store.getState().loadEpisode({
      episodeId: "ep1",
      seriesSlug: "demo",
      episodeNumber: 1,
      title: "Tap 1",
      seriesTitle: "Demo",
      audioUrl: "https://example.com/audio.mp3",
      coverUrl: ""
    });

    store.getState().setProgress(0, 120);
    store.getState().requestSeek(200);
    expect(store.getState().seekRequest).toBe(120);

    store.getState().requestSeek(-20);
    expect(store.getState().seekRequest).toBe(0);
  });

  it("handles sleep timer lifecycle", () => {
    const store = createPlayerStore();
    store.getState().startSleepTimerMinutes(20);
    expect(store.getState().sleepTimer.mode).toBe("minutes");
    expect(store.getState().sleepTimer.minutes).toBe(20);
    expect(store.getState().sleepTimer.expiresAt).not.toBeNull();

    store.getState().cancelSleepTimer();
    expect(store.getState().sleepTimer.mode).toBe("off");
    expect(store.getState().sleepTimer.expiresAt).toBeNull();

    store.getState().setPlaying(true);
    store.getState().startSleepTimerEndOfEpisode();
    expect(store.getState().sleepTimer.mode).toBe("end_of_episode");

    store.getState().expireSleepTimer();
    expect(store.getState().isPlaying).toBe(false);
    expect(store.getState().sleepTimer.mode).toBe("off");
  });
});
