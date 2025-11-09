class RrspPage {
  constructor(page) {
    this.page = page;
    this.tabSelector = "#tab-rrsp";
    this.sectionSelector = "#content-rrsp";
  }

  async navigate() {
    await this.page.click(this.tabSelector);
    await this.page.waitForSelector(this.sectionSelector + ".active");
  }

  async enterContribution(year, amount) {
    await this.page.fill(`${this.sectionSelector} input[name="year"]`, String(year));
    await this.page.fill(`${this.sectionSelector} input[name="amount"]`, String(amount));
    await this.page.click(`${this.sectionSelector} button[name="addContribution"]`);
  }

  async getRemainingRoom() {
    return await this.page.textContent(`${this.sectionSelector} .remaining-room`);
  }
}

module.exports = RrspPage;
