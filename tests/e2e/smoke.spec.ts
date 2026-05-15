import { expect, test } from "@playwright/test";

test("public catalog flow renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Nghe tiep cau chuyen dang do" })).toBeVisible();
  await page.goto("/truyen");
  await expect(page.getByRole("main")).toBeVisible();
});

test("auth pages render", async ({ page }) => {
  await page.goto("/dang-nhap");
  await expect(page.getByRole("button", { name: /dang nhap/i })).toBeVisible();
  await page.goto("/dang-ky");
  await expect(page.getByRole("button", { name: /dang ky/i })).toBeVisible();
});
