import type { Page } from "@playwright/test";

export class BasePage {
  constructor(protected readonly page: Page) {}

  async gotoDashboard() {
    await this.page.getByTestId("nav-link-dashboard").click();
  }

  async gotoSummary() {
    await this.page.getByTestId("nav-link-summary").click();
  }

  async gotoProfile() {
    await this.page.getByTestId("nav-link-profile").click();
  }

  async gotoAbout() {
    await this.page.getByTestId("nav-link-about").click();
  }
}
