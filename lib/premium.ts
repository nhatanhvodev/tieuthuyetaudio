import type { UserRole } from "@prisma/client";

export type EpisodeAccessState = "open" | "locked";

export function getEpisodeAccessState({
  featureEnabled,
  isPremiumEpisode,
  isVip,
  role
}: {
  featureEnabled: boolean;
  isPremiumEpisode: boolean;
  isVip: boolean;
  role: UserRole;
}): EpisodeAccessState {
  if (!featureEnabled) return "open";
  if (!isPremiumEpisode) return "open";
  if (isVip) return "open";
  if (role === "ADMIN") return "open";
  return "locked";
}
