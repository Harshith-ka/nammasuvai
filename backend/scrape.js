const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeNammaSuvai() {
  console.log('Starting scraper...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://www.nammasuvai.com/', { waitUntil: 'networkidle2' });
  
  console.log('Page loaded. Waiting for 10s to ensure everything renders...');
  await new Promise(r => setTimeout(r, 10000));
  
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  console.log('Saved screenshot.png');

  // get all text to understand what is there
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('page_text.txt', text);
  console.log('Saved page_text.txt');
  
  await browser.close();
}

scrapeNammaSuvai().catch(console.error);
