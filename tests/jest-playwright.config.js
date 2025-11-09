module.exports = {
  launchOptions: {
    headless: true
  },
  browsers: ["chromium"],
  contextOptions: {
    viewport: {
      width: 1280,
      height: 720
    },
    ignoreHTTPSErrors: true
  }
};
