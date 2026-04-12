const { chromium } = require('@playwright/test');

async function testLogin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect all network requests and responses
  const networkLogs = [];
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/')) {
      const status = response.status();
      const body = await response.text().catch(() => '');
      networkLogs.push({
        url: url.replace('https://portraitpayai.com', ''),
        status,
        body: body.substring(0, 500)
      });
    }
  });

  console.log('1. Navigating to login page...');
  await page.goto('https://portraitpayai.com/login', { waitUntil: 'networkidle' });

  console.log('2. Filling in login form...');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'Test123456');

  console.log('3. Clicking login button...');
  await page.click('button[type="submit"]');

  // Wait a bit for network requests
  await page.waitForTimeout(5000);

  console.log('\nNetwork Requests:');
  networkLogs.forEach(log => {
    console.log(`\n  ${log.status} ${log.url}`);
    console.log(`  Body: ${log.body}`);
  });

  console.log('\nFinal URL:', page.url());

  await browser.close();
}

testLogin().catch(console.error);