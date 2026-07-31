import { buildState, expect, test } from "../fixtures/test-fixtures";

const viewports = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

for (const [name, size] of Object.entries(viewports)) {
  test(`dashboard renders without horizontal overflow at ${name} width`, async ({
    page,
    seedState,
  }) => {
    await page.setViewportSize(size);
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));
    await page.goto("/#/dashboard");

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  });
}

test("respects prefers-color-scheme: dark", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  const backgroundColor = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(backgroundColor).toBe("rgb(16, 21, 28)");
});

test("respects prefers-color-scheme: light", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  const backgroundColor = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(backgroundColor).toBe("rgb(247, 248, 250)");
});
