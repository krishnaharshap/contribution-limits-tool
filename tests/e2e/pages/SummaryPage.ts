import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SummaryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/#/summary");
  }

  get table() {
    return this.page.getByTestId("summary-table");
  }

  async exportJson() {
    const downloadPromise = this.page.waitForEvent("download");
    await this.page.getByTestId("export-json-button").click();
    return downloadPromise;
  }

  async exportCsv() {
    const downloadPromise = this.page.waitForEvent("download");
    await this.page.getByTestId("export-csv-button").click();
    return downloadPromise;
  }

  async importFile(filePath: string) {
    await this.page.getByTestId("import-file-input").setInputFiles(filePath);
  }

  get importSuccess() {
    return this.page.getByTestId("import-success");
  }

  get importError() {
    return this.page.getByTestId("import-error");
  }

  async resetAllData() {
    await this.page.getByTestId("reset-button").click();
    await this.page.getByTestId("reset-confirm-button").click();
  }
}
