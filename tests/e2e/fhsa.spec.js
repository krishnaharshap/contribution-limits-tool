const { chromium } = require('playwright');
const FhsaPage = require('../helpers/pageObjects/fhsaPage');
const utils = require('../helpers/utils');
const fixtures = require('../fixtures/fhsaFixtures.json');

describe('FHSA Contribution Limits - UI Flow', () => {
  let browser, page, fhsaPage;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    fhsaPage = new FhsaPage(page);
    await page.goto(utils.getUrl());
    await utils.waitForAppLoad(page);
  });

  afterAll(async () => {
    await browser.close();
  });

  fixtures.forEach(fix => {
    test(`age ${fix.userAge}, previous contributions`, async () => {
      await fhsaPage.navigate();
      for (const c of fix.previousContributions) {
        await fhsaPage.enterContribution(c.year, c.amount);
      }
      const remaining = await fhsaPage.getRemainingRoom();
      expect(Number(remaining)).toBeGreaterThanOrEqual(0);
    });
  });

});
