const { chromium } = require('@playwright/test');

async function testDashboard() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // First login to get cookies
  console.log('1. Logging in...');
  const loginPage = await context.newPage();
  await loginPage.goto('https://portraitpayai.com/login', { waitUntil: 'networkidle' });
  await loginPage.fill('input[type="email"]', 'test@example.com');
  await loginPage.fill('input[type="password"]', 'Test123456');
  await loginPage.click('button[type="submit"]');
  await loginPage.waitForTimeout(3000);
  await loginPage.close();

  // Now try to access dashboard
  console.log('2. Accessing dashboard with cookies...');
  const dashboardPage = await context.newPage();

  // Log all requests
  const requests = [];
  dashboardPage.on('request', req => {
    requests.push(`-> ${req.method()} ${req.url().replace('https://portraitpayai.com', '')}`);
  });
  dashboardPage.on('response', res => {
    requests.push(`<- ${res.status()} ${res.url().replace('https://portraitpayai.com', '')}`);
  });

  await dashboardPage.goto('https://portraitpayai.com/dashboard', { waitUntil: 'networkidle' });

  console.log('\nRequests:');
  requests.forEach(r => console.log('  ', r));

  console.log('\nFinal URL:', dashboardPage.url());
  console.log('Page title:', await dashboardPage.title());

  await browser.close();
}

testDashboard().catch(console.error);