// tfsa.spec.js

const { chromium } = require("@playwright/test");

describe("TFSA Contribution UI Tests", () => {
  let browser, page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto("http://127.0.0.1:8080");
  });

  afterAll(async () => {
    await browser.close();
  });

  test("Age validation prevents underage use", async () => {
    await page.fill("#age", "17");
    await page.click("#age-submit");
    const errorText = await page.textContent("#age-error");
    expect(errorText).toContain("18 or older");
  });
});
