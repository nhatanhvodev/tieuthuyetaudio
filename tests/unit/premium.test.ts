import { describe, expect, it } from "vitest";
import { getEpisodeAccessState } from "@/lib/premium";

describe("getEpisodeAccessState", () => {
  it("keeps free episodes open even when the paywall flag is enabled", () => {
    expect(
      getEpisodeAccessState({
        featureEnabled: true,
        isPremiumEpisode: false,
        isVip: false,
        role: "USER"
      })
    ).toBe("open");
  });

  it("locks premium episodes for free users when the feature flag is enabled", () => {
    expect(
      getEpisodeAccessState({
        featureEnabled: true,
        isPremiumEpisode: true,
        isVip: false,
        role: "USER"
      })
    ).toBe("locked");
  });

  it("allows admins and VIP users through the premium gate", () => {
    expect(
      getEpisodeAccessState({
        featureEnabled: true,
        isPremiumEpisode: true,
        isVip: true,
        role: "USER"
      })
    ).toBe("open");

    expect(
      getEpisodeAccessState({
        featureEnabled: true,
        isPremiumEpisode: true,
        isVip: false,
        role: "ADMIN"
      })
    ).toBe("open");
  });
});
