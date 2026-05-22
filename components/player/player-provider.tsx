"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildPlayerEventPayload, emitAnalyticsPayload } from "@/lib/analytics/events";
import { featureFlags } from "@/lib/features";
import { usePlayerStore } from "@/stores/player-store";

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}`;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const current = usePlayerStore((state) => state.current);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const rate = usePlayerStore((state) => state.rate);
  const volume = usePlayerStore((state) => state.volume);
  const autoPlayNext = usePlayerStore((state) => state.autoPlayNext);
  const sleepTimer = usePlayerStore((state) => state.sleepTimer);
  const seekRequest = usePlayerStore((state) => state.seekRequest);
  const progress = usePlayerStore((state) => state.progress);
  const playNextInQueue = usePlayerStore((state) => state.playNextInQueue);
  const setPlaying = usePlayerStore((state) => state.setPlaying);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const expireSleepTimer = usePlayerStore((state) => state.expireSleepTimer);
  const [error, setError] = useState("");

  const playbackStateRef = useRef<{ episodeId: string | null; wasPlaying: boolean }>({
    episodeId: null,
    wasPlaying: false
  });
  const sessionIdRef = useRef<string>(createSessionId());
  const lastPersistedProgressRef = useRef<number>(0);

  const buildBasePayload = useCallback(
    (currentSeconds: number, durationSeconds: number) => {
      if (!current) return null;
      const completionPercent = durationSeconds > 0 ? Math.min(100, Math.round((currentSeconds / durationSeconds) * 1000) / 10) : undefined;

      return {
        episodeId: current.episodeId,
        seriesSlug: current.seriesSlug,
        episodeNumber: current.episodeNumber,
        currentSeconds,
        durationSeconds,
        completed: durationSeconds > 0 && currentSeconds >= durationSeconds - 5,
        completionPercent,
        sessionId: sessionIdRef.current,
        autoPlayEnabled: autoPlayNext
      };
    },
    [current, autoPlayNext]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    audio.playbackRate = rate;
    audio.volume = volume;
    if (isPlaying) {
      audio.play().catch(() => {
        setPlaying(false);
        setError("Trinh duyet chan tu dong phat. Hay bam phat lai.");
      });
    } else {
      audio.pause();
    }
  }, [current, isPlaying, rate, setPlaying, volume]);

  useEffect(() => {
    if (!current) {
      playbackStateRef.current = { episodeId: null, wasPlaying: false };
      return;
    }

    if (playbackStateRef.current.episodeId !== current.episodeId) {
      playbackStateRef.current = { episodeId: current.episodeId, wasPlaying: false };
    }

    const { wasPlaying } = playbackStateRef.current;

    if (isPlaying && !wasPlaying) {
      const payload = buildBasePayload(progress.currentSeconds, progress.durationSeconds);
      if (payload) {
        emitAnalyticsPayload(
          buildPlayerEventPayload({
            eventName: "play_start",
            ...payload
          })
        );
      }
    }

    if (!isPlaying && wasPlaying) {
      const payload = buildBasePayload(progress.currentSeconds, progress.durationSeconds);
      if (payload) {
        emitAnalyticsPayload(
          buildPlayerEventPayload({
            eventName: "play_pause",
            ...payload
          })
        );
      }
    }

    playbackStateRef.current.wasPlaying = isPlaying;
  }, [current, isPlaying, progress.currentSeconds, progress.durationSeconds, buildBasePayload]);

  useEffect(() => {
    lastPersistedProgressRef.current = 0;
  }, [current?.episodeId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || seekRequest === null) return;
    audio.currentTime = seekRequest;
    setProgress(seekRequest, audio.duration || 0);

    const payload = buildBasePayload(Math.floor(seekRequest), Math.floor(audio.duration || 0));
    if (payload) {
      emitAnalyticsPayload(
        buildPlayerEventPayload({
          eventName: "seek",
          ...payload
        })
      );
    }
  }, [seekRequest, setProgress, buildBasePayload]);

  useEffect(() => {
    if (!current || progress.currentSeconds < 5) return;

    const timeout = window.setTimeout(() => {
      const listeningDeltaSeconds = Math.max(0, progress.currentSeconds - lastPersistedProgressRef.current);
      lastPersistedProgressRef.current = progress.currentSeconds;
      const payload = buildBasePayload(progress.currentSeconds, progress.durationSeconds);
      if (!payload) return;

      emitAnalyticsPayload({
        ...payload,
        listeningDeltaSeconds
      });
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [current, progress.currentSeconds, progress.durationSeconds, buildBasePayload]);

  useEffect(() => {
    if (!featureFlags.sleepTimer) return;
    if (sleepTimer.mode !== "minutes" || !sleepTimer.expiresAt) return;
    const expiresAt = sleepTimer.expiresAt;

    const interval = window.setInterval(() => {
      if (Date.now() >= expiresAt) {
        expireSleepTimer();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [sleepTimer.mode, sleepTimer.expiresAt, expireSleepTimer]);

  const handleEnded = useCallback(() => {
    const payload = buildBasePayload(progress.currentSeconds, progress.durationSeconds);
    if (payload) {
      emitAnalyticsPayload(
        buildPlayerEventPayload({
          eventName: "complete_episode",
          ...payload,
          completed: true,
          completionPercent: 100
        })
      );
    }

    if (featureFlags.sleepTimer && sleepTimer.mode === "end_of_episode") {
      expireSleepTimer();
      return;
    }

    if (featureFlags.continuousPlay && autoPlayNext) {
      const nextEpisode = playNextInQueue();
      if (nextEpisode && payload) {
        emitAnalyticsPayload(
          buildPlayerEventPayload({
            eventName: "autoplay_next",
            ...payload,
            nextEpisodeId: nextEpisode.episodeId,
            nextEpisodeNumber: nextEpisode.episodeNumber
          })
        );
        return;
      }
    }

    setPlaying(false);
  }, [
    autoPlayNext,
    buildBasePayload,
    expireSleepTimer,
    playNextInQueue,
    progress.currentSeconds,
    progress.durationSeconds,
    setPlaying,
    sleepTimer.mode
  ]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [handleEnded]);

  return (
    <>
      {children}
      <audio
        ref={audioRef}
        src={current?.audioUrl}
        onError={() => setError("Khong tai duoc audio. Vui long thu tap khac.")}
        onLoadedMetadata={(event) => setProgress(event.currentTarget.currentTime, event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime, event.currentTarget.duration || 0)}
      />
      {error ? (
        <div className="fixed bottom-32 left-3 right-3 z-50 rounded-md border bg-card p-3 text-sm text-destructive shadow-lg md:left-auto md:right-4 md:w-[420px]">
          {error}
        </div>
      ) : null}
    </>
  );
}
