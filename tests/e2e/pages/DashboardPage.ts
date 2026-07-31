import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export type AccountKey = "tfsa" | "fhsa" | "rrsp";

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/#/dashboard");
  }

  get totalRemaining() {
    return this.page.getByTestId("dashboard-total-remaining");
  }

  card(account: AccountKey) {
    return this.page.getByTestId(`room-card-${account}`);
  }

  remaining(account: AccountKey) {
    return this.page.getByTestId(`room-card-${account}-remaining`);
  }

  status(account: AccountKey) {
    return this.page.getByTestId(`room-card-${account}-status`);
  }

  async viewDetails(account: AccountKey) {
    await this.card(account).getByRole("link", { name: "View details" }).click();
  }
}
