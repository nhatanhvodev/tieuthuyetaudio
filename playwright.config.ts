import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run build && npm run start",
    env: {
      AUTH_TRUST_HOST: "true",
      NEXT_PUBLIC_FEATURE_PAYWALL: "true",
      NEXT_PUBLIC_FEATURE_RECOMMENDATION: "true"
    },
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 180_000
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" }
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"], channel: "chrome" }
    }
  ]
});
