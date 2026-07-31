import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/#/profile");
  }

  get birthYearInput() {
    return this.page.getByTestId("profile-birth-year-input");
  }

  get residencyYearInput() {
    return this.page.getByTestId("profile-residency-year-input");
  }

  get provinceSelect() {
    return this.page.getByTestId("profile-province-select");
  }

  get pensionCheckbox() {
    return this.page.getByTestId("profile-pension-checkbox");
  }

  get fhsaOpenedYearInput() {
    return this.page.getByTestId("profile-fhsa-opened-year-input");
  }

  get eligibilitySummary() {
    return this.page.getByTestId("profile-eligibility-summary");
  }

  get formError() {
    return this.page.getByTestId("profile-form-error");
  }

  async fillBirthYear(year: number) {
    await this.birthYearInput.fill(String(year));
  }

  async submit() {
    await this.page.getByTestId("profile-continue-button").click();
  }
}
