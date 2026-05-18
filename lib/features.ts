export type FeatureFlags = {
  continuousPlay: boolean;
  sleepTimer: boolean;
  recommendation: boolean;
  bookmarks: boolean;
  paywall: boolean;
};

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function readFlag(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return TRUE_VALUES.has(value.trim().toLowerCase());
}

export const featureFlags: FeatureFlags = {
  continuousPlay: readFlag(process.env.NEXT_PUBLIC_FEATURE_CONTINUOUS_PLAY, true),
  sleepTimer: readFlag(process.env.NEXT_PUBLIC_FEATURE_SLEEP_TIMER, true),
  recommendation: readFlag(process.env.NEXT_PUBLIC_FEATURE_RECOMMENDATION, false),
  bookmarks: readFlag(process.env.NEXT_PUBLIC_FEATURE_BOOKMARKS, true),
  paywall: readFlag(process.env.NEXT_PUBLIC_FEATURE_PAYWALL, false)
};

export function isFeatureEnabled(flag: keyof FeatureFlags) {
  return featureFlags[flag];
}
