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
});
