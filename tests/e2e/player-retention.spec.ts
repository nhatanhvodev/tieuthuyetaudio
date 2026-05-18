import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/dang-nhap", { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill(email);
  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill(password);
  const loginForm = passwordInput.locator("xpath=ancestor::form[1]");
  const submitButton = loginForm.locator('button[type="submit"]');
  await submitButton.click();

  try {
    await page.waitForURL("**/tai-khoan", { timeout: 5000 });
  } catch {
    await passwordInput.press("Enter");
    await page.waitForURL("**/tai-khoan");
  }

  await page.waitForLoadState("networkidle");
}

test("continuous play advances to next episode in queue", async ({ page }) => {
  await page.goto("/truyen/dinh-menh-ben-em/tap/1", { waitUntil: "domcontentloaded" });

  await expect(page.getByLabel("Auto-play")).toBeChecked();
  await expect(page.getByRole("button", { name: "Play next" })).toBeEnabled();

  const initialSrc = await page.evaluate(() => {
    const audio = document.querySelector("audio");
    if (!audio) throw new Error("audio element not found");
    return audio.getAttribute("src");
  });

  await page.evaluate(() => {
    const audio = document.querySelector("audio");
    if (!audio) throw new Error("audio element not found");
    audio.dispatchEvent(new Event("ended"));
  });

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const audio = document.querySelector("audio");
        if (!audio) throw new Error("audio element not found");
        return audio.getAttribute("src");
      })
    )
    .not.toBe(initialSrc);
});

test("sleep timer supports presets and end-of-episode mode", async ({ page }) => {
  await page.goto("/truyen/dinh-menh-ben-em/tap/1", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("button", { name: "10 phut" })).toBeVisible();
  await expect(page.getByRole("button", { name: "20 phut" })).toBeVisible();
  await expect(page.getByRole("button", { name: "30 phut" })).toBeVisible();
  await expect(page.getByRole("button", { name: "45 phut" })).toBeVisible();
  await page.getByRole("button", { name: "20 phut" }).click();
  await page.getByRole("button", { name: "Den het tap" }).click();

  await page.evaluate(() => {
    const audio = document.querySelector("audio");
    if (!audio) throw new Error("audio element not found");
    audio.dispatchEvent(new Event("ended"));
  });

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const audio = document.querySelector("audio");
        if (!audio) throw new Error("audio element not found");
        return audio.paused;
      })
    )
    .toBe(true);
});

test("home shows continue listening shelf and personalized recommendations for signed in user", async ({ page }) => {
  test.slow();

  await login(page, "user@tieuthuyetaudio.local", "User@123456");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Nghe tiep", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Danh cho ban", exact: true })).toBeVisible();
});

test("soft paywall locks premium episodes for free users", async ({ page }) => {
  test.slow();

  await login(page, "user@tieuthuyetaudio.local", "User@123456");
  await page.goto("/truyen/dinh-menh-ben-em/tap/5", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Mo VIP de nghe tron ven tap nay/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Xem quyen loi VIP/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /^Phat$/i })).toHaveCount(0);
});

test("admin can still access premium episodes when paywall is enabled", async ({ page }, testInfo) => {
  test.slow();
  test.skip(testInfo.project.name === "mobile-chrome", "Desktop e2e plus premium entitlement unit tests cover the admin path.");

  await login(page, "admin@tieuthuyetaudio.local", "Admin@123456");
  await page.goto("/truyen/dinh-menh-ben-em/tap/5", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("slider", { name: "Tien trinh nghe" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Mo VIP de nghe tron ven tap nay/i })).toHaveCount(0);
});
