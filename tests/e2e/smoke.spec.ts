import { expect, test } from "@playwright/test";

test("public catalog flow renders", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Tieu thuyet Audio" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Kham pha ngay/i })).toBeVisible();
  await page.goto("/truyen", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Kho truyện" })).toBeVisible();
});

test("sub pages render", async ({ page }) => {
  await page.goto("/truyen/dinh-menh-ben-em", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Định Mệnh Bên Em" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Danh sach tap|Danh sách tập/i })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /Danh gia|Đánh giá/i }).click();
  await expect(page.getByText(/Viet danh gia|Viết đánh giá/i)).toBeVisible();

  await page.goto("/cong-dong", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Gop y va thao luan|Góp ý và thảo luận/i })).toBeVisible();
  await expect(page.getByText(/Cai ung dung|Cài ứng dụng/i)).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "Kho truyện" })).toBeVisible();
});

test("pwa png icon is available", async ({ request }) => {
  const response = await request.get("/icon-192.png");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("audio player uses one seek slider with one runtime progress readout", async ({ page }) => {
  await page.goto("/truyen/dinh-menh-ben-em/tap/1", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Tập 1: Chương demo 1/i })).toBeVisible();
  await expect(page.getByRole("slider", { name: "Tien trinh nghe" })).toBeVisible();
  await expect(page.getByRole("slider")).toHaveCount(1);
  await expect(page.locator("p").filter({ hasText: /\d+.*\/.*\d+/ })).toBeVisible();
});
