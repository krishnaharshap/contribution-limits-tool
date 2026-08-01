import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import type { AccountKey } from "./DashboardPage";

export class AccountPage extends BasePage {
  constructor(
    page: Page,
    private readonly account: AccountKey,
  ) {
    super(page);
  }

  async goto() {
    await this.page.goto(`/#/account/${this.account}`);
  }

  get remaining() {
    return this.page.getByTestId(`${this.account}-remaining`);
  }

  get errorBanner() {
    return this.page.getByTestId("account-error-banner");
  }

  get warningBanner() {
    return this.page.getByTestId("warning-banner");
  }

  async addContribution(year: number, amount: number, prefix = `${this.account}-contribution`) {
    await this.page.getByTestId(`${prefix}-year-input`).fill(String(year));
    await this.page.getByTestId(`${prefix}-amount-input`).fill(String(amount));
    await this.page.getByTestId(`${prefix}-submit-button`).click();
  }

  contributionError(prefix = `${this.account}-contribution`) {
    return this.page.getByTestId(`${prefix}-error`);
  }

  async removeContribution(year: number, prefix = `${this.account}-contribution`) {
    await this.page.getByTestId(`${prefix}-remove-${year}`).click();
  }

  contributionRow(year: number, prefix = `${this.account}-contribution`) {
    return this.page.getByTestId(`${prefix}-table`).locator("tr", { hasText: String(year) });
  }

  // TFSA-specific
  async addWithdrawal(year: number, amount: number) {
    await this.addContribution(year, amount, "tfsa-withdrawal");
  }

  // FHSA-specific
  async setAccountOpenedYear(year: number) {
    await this.page.getByTestId("fhsa-opened-year-input").fill(String(year));
    await this.page.getByTestId("fhsa-opened-year-save").click();
  }

  // RRSP-specific
  async setIncome(year: number, amount: number) {
    await this.page.getByTestId("rrsp-income-year-input").fill(String(year));
    await this.page.getByTestId("rrsp-income-amount-input").fill(String(amount));
    await this.page.getByTestId("rrsp-income-submit").click();
  }

  async setPensionAdjustment(year: number, amount: number) {
    await this.page.getByTestId("rrsp-pension-year-input").fill(String(year));
    await this.page.getByTestId("rrsp-pension-amount-input").fill(String(amount));
    await this.page.getByTestId("rrsp-pension-submit").click();
  }

  async setPriorRoomOverride(amount: number) {
    await this.page.getByTestId("rrsp-prior-room-override-input").fill(String(amount));
    await this.page.getByTestId("rrsp-prior-room-override-save").click();
  }
}
