"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePlayerStore, type PlayerEpisode } from "@/stores/player-store";
import { formatDuration } from "@/lib/format";

export function AudioPlayer({ episode }: { episode: PlayerEpisode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState("");
  const current = usePlayerStore((state) => state.current);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const rate = usePlayerStore((state) => state.rate);
  const volume = usePlayerStore((state) => state.volume);
  const progress = usePlayerStore((state) => state.progress);
  const loadEpisode = usePlayerStore((state) => state.loadEpisode);
  const setPlaying = usePlayerStore((state) => state.setPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const setRate = usePlayerStore((state) => state.setRate);
  const setVolume = usePlayerStore((state) => state.setVolume);

  useEffect(() => {
    if (current?.episodeId !== episode.episodeId) loadEpisode(episode);
  }, [current?.episodeId, episode, loadEpisode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
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
  }, [isPlaying, rate, setPlaying, volume]);

  function seek(delta: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
  }

  function onSlider(value: string) {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Number(value);
    audio.currentTime = next;
    setProgress(next, audio.duration || progress.durationSeconds);
  }

  const percent = progress.durationSeconds > 0 ? (progress.currentSeconds / progress.durationSeconds) * 100 : 0;

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-2xl shadow-black/20 md:p-6">
      <audio
        ref={audioRef}
        src={episode.audioUrl}
        onError={() => setError("Khong tai duoc audio demo. Vui long thu tap khac.")}
        onLoadedMetadata={(event) => setProgress(event.currentTarget.currentTime, event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime, event.currentTarget.duration || 0)}
        onEnded={() => setPlaying(false)}
      />
      <div className="grid gap-5 md:grid-cols-[180px_1fr]">
        <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-400 via-teal-400 to-violet-500" />
        <div className="flex min-w-0 flex-col justify-center">
          <p className="text-sm text-muted-foreground">{episode.seriesTitle}</p>
          <h1 className="mt-1 text-2xl font-black md:text-4xl">{episode.title}</h1>
          <div className="mt-6">
            <Progress value={percent} />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{formatDuration(progress.currentSeconds)}</span>
              <span>{formatDuration(progress.durationSeconds)}</span>
            </div>
            <input
              aria-label="Tien trinh nghe"
              type="range"
              min={0}
              max={progress.durationSeconds || 0}
              value={progress.currentSeconds}
              onChange={(event) => onSlider(event.target.value)}
              className="mt-3 w-full accent-teal-300"
            />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" size="icon" onClick={() => seek(-10)} aria-label="Lui 10 giay">
              <RotateCcw aria-hidden="true" />
            </Button>
            <Button type="button" size="lg" onClick={togglePlay}>
              {isPlaying ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
              {isPlaying ? "Tam dung" : "Phat"}
            </Button>
            <Button type="button" variant="secondary" size="icon" onClick={() => seek(10)} aria-label="Tien 10 giay">
              <RotateCw aria-hidden="true" />
            </Button>
            <select
              aria-label="Toc do phat"
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="h-10 rounded-md border bg-input px-3 text-sm"
            >
              {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <option key={speed} value={speed}>{speed}x</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 aria-hidden="true" />
              <input
                aria-label="Am luong"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="w-24 accent-teal-300"
              />
            </label>
          </div>
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
