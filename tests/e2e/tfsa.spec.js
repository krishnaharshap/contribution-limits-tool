const { chromium } = require('playwright');
const TfsaPage = require('../helpers/pageObjects/tfsaPage');
const utils = require('../helpers/utils');
const fixtures = require('../fixtures/tfsaFixtures.json');

describe('TFSA Contribution Limits - UI Flow', () => {
  let browser;
  let page;
  let tfsaPage;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    tfsaPage = new TfsaPage(page);
    await page.goto(utils.getUrl());
    await utils.waitForAppLoad(page);
  });

  afterAll(async () => {
    await browser.close();
  });

  fixtures.forEach(fix => {
    test(`age ${fix.userAge} with previous contributions should show remaining room`, async () => {
      // assume user age validated in UI, etc.
      await tfsaPage.navigate();
      // In UI, perhaps set age then contributions etc.
      for (const c of fix.previousContributions) {
        await tfsaPage.enterContribution(c.year, c.amount);
      }
      const remaining = await tfsaPage.getRemainingRoom();
      expect(Number(remaining)).toBeGreaterThanOrEqual(0);
      // More meaningful assertion based on fix.expectedRemaining
    });
  });

});
