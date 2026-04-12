const { chromium } = require('@playwright/test');

async function testLogin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console messages
  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleLogs.push(`ERROR: ${msg.text()}`);
    }
  });

  // Collect page errors
  page.on('pageerror', err => {
    consoleLogs.push(`PAGE ERROR: ${err.message}`);
  });

  console.log('1. Navigating to login page...');
  await page.goto('https://portraitpayai.com/login', { waitUntil: 'networkidle' });
  console.log('   Page loaded');

  console.log('2. Filling in login form...');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'Test123456');
  console.log('   Form filled');

  console.log('3. Clicking login button...');
  await page.click('button[type="submit"]');

  // Wait for navigation or response
  console.log('4. Waiting for response...');
  try {
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    console.log('   SUCCESS: Redirected to dashboard!');
  } catch (e) {
    console.log('   TIMEOUT: No redirect to dashboard after 10s');
  }

  // Get current URL
  const currentUrl = page.url();
  console.log('   Current URL:', currentUrl);

  // Check page content
  const pageContent = await page.content();
  if (pageContent.includes('登录成功') || pageContent.includes('登录失败') || pageContent.includes('网络错误')) {
    console.log('   Found error/success message in page');
  }

  // Print console logs
  if (consoleLogs.length > 0) {
    console.log('\nConsole Errors:');
    consoleLogs.forEach(log => console.log('  ', log));
  } else {
    console.log('\nNo console errors detected');
  }

  await browser.close();
}

testLogin().catch(console.error);