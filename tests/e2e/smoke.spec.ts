import { expect, test } from "@playwright/test";

async function installPerformanceCollectors(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const target = window as typeof window & {
      __perfMetrics?: {
        cls: number;
        lcp: number;
        inp: number;
      };
    };

    target.__perfMetrics = { cls: 0, lcp: 0, inp: 0 };

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        target.__perfMetrics!.lcp = Math.max(target.__perfMetrics!.lcp, entry.startTime);
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
        if (!entry.hadRecentInput) {
          target.__perfMetrics!.cls += entry.value ?? 0;
        }
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { startTime: number; processingStart?: number; duration: number }>) {
        const interactionLatency = (entry.processingStart ?? entry.startTime) - entry.startTime + entry.duration;
        target.__perfMetrics!.inp = Math.max(target.__perfMetrics!.inp, interactionLatency);
      }
    }).observe({ type: "event", buffered: true, durationThreshold: 16 } as PerformanceObserverInit & { durationThreshold: number });
  });
}

test("public catalog flow renders", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Tieu thuyet Audio" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Kham pha ngay/i })).toBeVisible();
  await page.goto("/truyen", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Kho truyen" })).toBeVisible();
});

test("sub pages render", async ({ page }) => {
  await page.goto("/truyen/dinh-menh-ben-em", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Dinh Menh Ben Em" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Danh sach tap/i })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /Danh gia/i }).click();
  await expect(page.getByText(/Viet danh gia/i)).toBeVisible();

  await page.goto("/cong-dong", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Gop y va thao luan/i })).toBeVisible();
  await expect(page.getByText(/Cai ung dung/i)).toBeVisible();
});

test("auth pages render", async ({ page }) => {
  await page.goto("/dang-nhap", { waitUntil: "domcontentloaded" });
  const loginForm = page.locator('input[name="password"]').locator("xpath=ancestor::form[1]");
  await expect(loginForm.locator('button[type="submit"]')).toBeVisible();
  await page.goto("/dang-ky", { waitUntil: "domcontentloaded" });
  const registerForm = page.locator('input[name="name"]').locator("xpath=ancestor::form[1]");
  await expect(registerForm.locator('button[type="submit"]')).toBeVisible();
});

test("bad catalog filters fall back safely", async ({ page }) => {
  const response = await page.goto("/truyen?sort=bad", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Kho truyen" })).toBeVisible();
});

test("pwa png icon is available", async ({ request }) => {
  const response = await request.get("/icon-192.png");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("audio player uses one seek slider with one runtime progress readout", async ({ page }) => {
  await page.goto("/truyen/dinh-menh-ben-em/tap/1", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Tap 1: Chuong demo 1/i })).toBeVisible();
  await expect(page.getByRole("slider", { name: "Tien trinh nghe" })).toBeVisible();
  await expect(page.getByRole("slider")).toHaveCount(1);
  await expect(page.locator("p").filter({ hasText: /\d+.*\/.*\d+/ })).toBeVisible();
});

test("homepage local performance stays within guardrails", async ({ page }) => {
  await installPerformanceCollectors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(750);

  const metrics = await page.evaluate(() => {
    const target = window as typeof window & {
      __perfMetrics?: {
        cls: number;
        lcp: number;
        inp: number;
      };
    };
    return target.__perfMetrics ?? { cls: 0, lcp: 0, inp: 0 };
  });

  expect(metrics.lcp).toBeGreaterThan(0);
  expect(metrics.lcp).toBeLessThan(8000);
  expect(metrics.cls).toBeLessThan(0.1);
});

test("reduced motion mode disables animation-heavy behavior and keeps interaction latency low", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await installPerformanceCollectors(page);
  await page.goto("/cong-dong", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Gop y va thao luan/i })).toBeVisible();
  await page.getByRole("button", { name: /^De xuat$/i }).click();

  const details = await page.evaluate(() => {
    const target = window as typeof window & {
      __perfMetrics?: {
        cls: number;
        lcp: number;
        inp: number;
      };
    };
    const bodyStyles = getComputedStyle(document.body);
    return {
      inp: target.__perfMetrics?.inp ?? 0,
      scrollBehavior: bodyStyles.scrollBehavior,
      transitionDuration: bodyStyles.transitionDuration
    };
  });

  expect(details.scrollBehavior).toBe("auto");
  expect(Number.parseFloat(details.transitionDuration)).toBeLessThanOrEqual(0.01);
  expect(details.inp).toBeLessThan(500);
});

test("vitals endpoint accepts a valid payload", async ({ request }) => {
  const response = await request.post("/api/analytics/vitals", {
    data: {
      id: "metric-1",
      name: "LCP",
      value: 1800,
      delta: 1800,
      rating: "good",
      pathname: "/",
      href: "http://localhost:3000/",
      source: "next_web_vitals",
      timestamp: new Date().toISOString()
    }
  });

  expect(response.status()).toBe(202);
});
