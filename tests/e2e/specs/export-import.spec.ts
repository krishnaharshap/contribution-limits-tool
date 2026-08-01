import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportStateAsJson } from "../../../src/utils/exportImport";
import { buildState, contribution, expect, test } from "../fixtures/test-fixtures";
import { SummaryPage } from "../pages/SummaryPage";

test("exports the current data as a downloadable JSON file", async ({ page, seedState }) => {
  await seedState(buildState((state) => (state.profile.birthYear = 1980)));

  const summary = new SummaryPage(page);
  await summary.goto();
  const download = await summary.exportJson();

  expect(download.suggestedFilename()).toMatch(/^contribution-limits-tool-.*\.json$/);
});

test("exports the current data as a downloadable CSV file", async ({ page, seedState }) => {
  await seedState(buildState((state) => (state.profile.birthYear = 1980)));

  const summary = new SummaryPage(page);
  await summary.goto();
  const download = await summary.exportCsv();

  expect(download.suggestedFilename()).toMatch(/^contribution-limits-tool-.*\.csv$/);
});

test("imports a previously exported file and replaces existing data", async ({
  page,
  seedState,
}) => {
  await seedState(buildState((state) => (state.profile.birthYear = 1980)));

  const importedState = buildState((state) => {
    state.profile.birthYear = 1999;
    state.accounts.tfsa.contributions.push(contribution(2024, 300_000));
  });
  const tempDir = mkdtempSync(join(tmpdir(), "clt-e2e-"));
  const filePath = join(tempDir, "export.json");
  writeFileSync(filePath, exportStateAsJson(importedState));

  const summary = new SummaryPage(page);
  await summary.goto();
  await summary.importFile(filePath);

  await expect(summary.importSuccess).toBeVisible();
  await expect(summary.table).toContainText("$3,000.00");
});

test("rejects a file that isn't a recognizable export", async ({ page, seedState }) => {
  await seedState(buildState((state) => (state.profile.birthYear = 1980)));

  const tempDir = mkdtempSync(join(tmpdir(), "clt-e2e-"));
  const filePath = join(tempDir, "not-an-export.json");
  writeFileSync(filePath, JSON.stringify({ hello: "world" }));

  const summary = new SummaryPage(page);
  await summary.goto();
  await summary.importFile(filePath);

  await expect(summary.importError).toBeVisible();
});

test("resets all data and returns to the welcome screen", async ({ page, seedState }) => {
  await seedState(
    buildState((state) => {
      state.profile.birthYear = 1980;
      state.accounts.tfsa.contributions.push(contribution(2024, 500_000));
    }),
  );

  const summary = new SummaryPage(page);
  await summary.goto();
  await summary.resetAllData();

  await expect(page.getByTestId("welcome-screen")).toBeVisible();

  await page.reload();
  await expect(page.getByTestId("welcome-screen")).toBeVisible();
});
