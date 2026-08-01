module.exports = {
  getUrl: () => {
    return "http://127.0.0.1:8080/index.html";
  },

  waitForAppLoad: async (page) => {
    await page.waitForSelector("header.app-header");
  }
};
