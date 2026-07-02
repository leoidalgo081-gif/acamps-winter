const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('response', response => {
    if (response.status() === 404) {
        console.log('404 URL:', response.url());
    }
  });
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  try {
    console.log("Navigating to http://127.0.0.1:3001 ...");
    await page.goto('http://127.0.0.1:3001', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log("Page loaded successfully.");
  } catch (e) {
    console.log("Error loading page:", e);
  } finally {
    await browser.close();
  }
})();
