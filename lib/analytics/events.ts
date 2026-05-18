import { z } from "zod";

export const playerEventNames = [
  "play_start",
  "play_pause",
  "seek",
  "complete_episode",
  "autoplay_next",
  "bookmark_create",
  "upsell_click"
] as const;

export const playerEventNameSchema = z.enum(playerEventNames);

export type PlayerEventName = (typeof playerEventNames)[number];

export const analyticsPayloadSchema = z.object({
  eventName: playerEventNameSchema.optional(),
  occurredAt: z.string().datetime().optional(),
  source: z.string().trim().min(1).default("web_player"),
  sessionId: z.string().trim().min(1).optional(),
  episodeId: z.string().trim().min(1),
  seriesId: z.string().trim().min(1).optional(),
  seriesSlug: z.string().trim().min(1).optional(),
  episodeNumber: z.number().int().positive().optional(),
  currentSeconds: z.number().int().min(0),
  durationSeconds: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
  completionPercent: z.number().min(0).max(100).optional(),
  listeningDeltaSeconds: z.number().int().min(0).optional(),
  nextEpisodeId: z.string().trim().min(1).optional(),
  nextEpisodeNumber: z.number().int().positive().optional(),
  autoPlayEnabled: z.boolean().optional()
});

export type AnalyticsPayload = z.input<typeof analyticsPayloadSchema>;
export type AnalyticsEventPayload = z.output<typeof analyticsPayloadSchema>;

function normalizePayload(payload: AnalyticsPayload): AnalyticsPayload {
  return {
    ...payload,
    occurredAt: payload.occurredAt ?? new Date().toISOString()
  };
}

export function emitAnalyticsPayload(payload: AnalyticsPayload, endpoint = "/api/progress") {
  if (typeof window === "undefined") return;

  const normalized = normalizePayload(payload);
  const body = JSON.stringify(normalized);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(endpoint, blob)) {
      return;
    }
  }

  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  });
}

export function buildPlayerEventPayload(
  payload: Omit<AnalyticsPayload, "eventName" | "occurredAt" | "source"> & {
    eventName: PlayerEventName;
    source?: string;
  }
): AnalyticsPayload {
  return {
    source: payload.source ?? "web_player",
    occurredAt: new Date().toISOString(),
    ...payload
  };
}
