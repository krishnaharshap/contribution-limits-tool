import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class WelcomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/");
  }

  get heading() {
    return this.page.getByRole("heading", { name: "Contribution Limits Tool" });
  }

  async clickGetStarted() {
    await this.page.getByTestId("get-started-button").click();
  }
}
