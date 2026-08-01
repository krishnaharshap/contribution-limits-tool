const { chromium } = require('playwright');
const RrspPage = require('../helpers/pageObjects/rrspPage');
const utils = require('../helpers/utils');
const fixtures = require('../fixtures/rrspFixtures.json');

describe('RRSP Contribution Limits - UI Flow', () => {
  let browser, page, rrspPage;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    rrspPage = new RrspPage(page);
    await page.goto(utils.getUrl());
    await utils.waitForAppLoad(page);
  });

  afterAll(async () => {
    await browser.close();
  });

  fixtures.forEach(fix => {
    test(`age ${fix.userAge}, previous contributions`, async () => {
      await rrspPage.navigate();
      for (const c of fix.previousContributions) {
        await rrspPage.enterContribution(c.year, c.amount);
      }
      const remaining = await rrspPage.getRemainingRoom();
      expect(Number(remaining)).toBeGreaterThanOrEqual(0);
    });
  });

});
