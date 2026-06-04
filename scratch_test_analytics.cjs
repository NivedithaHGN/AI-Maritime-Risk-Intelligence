const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Users\\Kathyayini\\.cache\\puppeteer\\chrome\\win64-149.0.7827.22\\chrome-win64\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Monitor console logs
  page.on('console', msg => {
    console.log(`[BROWSER LOG] [${msg.type()}] ${msg.text()}`);
  });

  // Monitor page errors
  page.on('pageerror', err => {
    console.error(`[BROWSER ERROR] ${err.toString()}`);
  });

  try {
    console.log('Navigating to http://localhost:5174/analytics...');
    await page.goto('http://localhost:5174/analytics', { waitUntil: 'networkidle2' });

    console.log('Waiting for select elements to load...');
    await page.waitForSelector('select');

    // Get select values and select the ports
    const selects = await page.$$('select');
    if (selects.length >= 2) {
      const originSelect = selects[0];
      const destSelect = selects[1];

      // Select origin and destination
      console.log('Selecting Origin: Shanghai, Destination: Rotterdam...');
      await originSelect.select('Shanghai');
      await destSelect.select('Rotterdam');

      // Add a slight delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.log('Could not find both select elements.');
    }

    console.log('Clicking Compute Intelligent Costs button...');
    const button = await page.waitForSelector('button');
    await button.click();

    console.log('Waiting 5 seconds for results...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Final URL:', page.url());
  } catch (error) {
    console.error('Automation error:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
})();
