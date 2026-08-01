import { test, expect } from "@playwright/test";

test("app loads and renders the title", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");

  await expect(page).toHaveTitle("Contribution Limits Tool");
  await expect(page.getByRole("heading", { name: "Contribution Limits Tool" })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
