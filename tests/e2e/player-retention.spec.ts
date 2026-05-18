import { expect, test } from "@playwright/test";

test("continuous play advances to next episode in queue", async ({ page }) => {
  await page.goto("/truyen/dinh-menh-ben-em/tap/1", { waitUntil: "domcontentloaded" });

  await expect(page.getByLabel("Auto-play")).toBeChecked();
  await expect(page.getByRole("button", { name: "Play next" })).toBeEnabled();

  const initialSrc = await page.evaluate(() => {
    const audio = document.querySelector("audio");
    if (!audio) throw new Error("audio element not found");
    return audio.currentSrc;
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
        return audio.currentSrc;
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

test("home shows continue listening shelf for signed in user", async ({ page }) => {
  test.slow();

  await page.request.get("/api/auth/providers");
  await page.request.get("/api/auth/csrf");
  await page.request.get("/tai-khoan", { failOnStatusCode: false });
  await page.goto("/dang-nhap", { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill("user@tieuthuyetaudio.local");
  await page.locator('input[name="password"]').fill("User@123456");
  const loginForm = page.locator('input[name="password"]').locator("xpath=ancestor::form[1]");
  await loginForm.locator('button[type="submit"]').click();

  await page.waitForURL("**/tai-khoan");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Nghe tiep", exact: true })).toBeVisible();
});
