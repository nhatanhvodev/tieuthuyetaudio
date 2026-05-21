import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT_ROOT = path.resolve(process.cwd(), "test-screenshots", "user-redesign");

async function ensureDirectory(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function capture(page: import("@playwright/test").Page, outputDir: string, name: string) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    fullPage: true
  });
}

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/dang-nhap", { waitUntil: "domcontentloaded" });
  const passwordInput = page.locator('main input[name="password"]').first();
  await passwordInput.fill(password);
  const loginForm = passwordInput.locator("xpath=ancestor::form[1]");
  await loginForm.locator('input[name="email"]').fill(email);
  await loginForm.locator('button[type="submit"]').click();

  try {
    await page.waitForURL("**/tai-khoan", { timeout: 7000 });
  } catch {
    await passwordInput.press("Enter");
    try {
      await page.waitForURL("**/tai-khoan", { timeout: 7000 });
    } catch {
      return false;
    }
  }

  await page.waitForLoadState("networkidle");
  return true;
}

test("capture all user-facing screens for desktop and mobile redesign", async ({ page }, testInfo) => {
  test.setTimeout(300_000);

  const deviceFolder = testInfo.project.name === "mobile-chrome" ? "mobile" : "desktop";
  const outputDir = path.join(OUTPUT_ROOT, deviceFolder);
  await ensureDirectory(outputDir);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
  await capture(page, outputDir, "01-home");

  await page.goto("/truyen", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
  await capture(page, outputDir, "02-catalog");

  await page.goto("/truyen/dinh-menh-ben-em", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
  await capture(page, outputDir, "03-story-detail");

  await page.goto("/truyen/dinh-menh-ben-em/tap/1", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
  await capture(page, outputDir, "04-episode-player");

  await page.goto("/tim-kiem", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
  await capture(page, outputDir, "05-search");

  await page.goto("/the-loai", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
  await capture(page, outputDir, "06-categories");

  const firstCategoryLink = page.locator('a[href^="/the-loai/"]').first();
  if ((await firstCategoryLink.count()) > 0) {
    await firstCategoryLink.click();
    await page.waitForLoadState("networkidle");
    await capture(page, outputDir, "07-category-detail");
  }

  await page.goto("/cong-dong", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
  await capture(page, outputDir, "08-community-default");

  const suggestionTab = page.getByRole("button", { name: /de xuat/i });
  if ((await suggestionTab.count()) > 0) {
    await suggestionTab.first().click();
    await capture(page, outputDir, "09-community-suggestions");
  } else {
    await capture(page, outputDir, "09-community-fallback");
  }

  await page.goto("/vip", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
  await capture(page, outputDir, "10-vip");

  await page.goto("/dang-nhap", { waitUntil: "domcontentloaded" });
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await capture(page, outputDir, "11-login");

  await page.goto("/dang-ky", { waitUntil: "domcontentloaded" });
  await expect(page.locator('input[name="name"]')).toBeVisible();
  await capture(page, outputDir, "12-register");

  await page.goto("/tai-khoan", { waitUntil: "domcontentloaded" });
  let loggedIn = page.url().includes("/tai-khoan");
  if (!loggedIn) {
    loggedIn = await login(page, "user@tieuthuyetaudio.local", "User@123456");
  }

  if (loggedIn) {
    if (!page.url().includes("/tai-khoan")) {
      await page.goto("/tai-khoan", { waitUntil: "domcontentloaded" });
    }
    await capture(page, outputDir, "13-account");

    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
    await capture(page, outputDir, "14-home-signed-in");

    await page.goto("/truyen/dinh-menh-ben-em/tap/5", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    await capture(page, outputDir, "15-premium-locked-episode");
  } else {
    await page.goto("/tai-khoan", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    await capture(page, outputDir, "13-account-fallback");

    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
    await capture(page, outputDir, "14-home-fallback");

    await page.goto("/truyen/dinh-menh-ben-em/tap/5", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    await capture(page, outputDir, "15-premium-locked-episode-fallback");
  }
});
