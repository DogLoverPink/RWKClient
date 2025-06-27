const { PuppeteerBlocker } = require('@ghostery/adblocker-puppeteer');
const fetch = require('cross-fetch');
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--app=http://127.0.0.1:8080/',
            "--window-size=1820,1080",
            "--start-maximized",
            "--start-fullscreen"
        ]
    });

    // Only one page is opened by default in app mode
    const pages = await browser.pages();
    const page = pages[0];
    browser.set
    await page.setViewport({
        width: 1720,
        height: 1080,
        deviceScaleFactor: 1, // 2x zoom (like retina)
    });
    PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
        blocker.enableBlockingInPage(page);
    });

    // You can control the page as normal here
})();