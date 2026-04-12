const { chromium } = require('@playwright/test');

async function testLogin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Navigating to login page...');
  await page.goto('https://portraitpayai.com/login', { waitUntil: 'networkidle' });

  console.log('2. Filling in login form...');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'Test123456');

  console.log('3. Clicking login button...');
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForTimeout(3000);

  // Check cookies
  const cookies = await context.cookies();
  console.log('\nCookies after login:');
  cookies.forEach(cookie => {
    console.log(`  ${cookie.name}: ${cookie.value.substring(0, 50)}...`);
  });

  // Check localStorage
  const localStorage = await page.evaluate(() => {
    return {
      accessToken: localStorage.getItem('pp_access_token'),
      refreshToken: localStorage.getItem('pp_refresh_token'),
      user: localStorage.getItem('pp_user')
    };
  });
  console.log('\nLocalStorage after login:');
  console.log('  accessToken:', localStorage.accessToken ? 'set' : 'null');
  console.log('  refreshToken:', localStorage.refreshToken ? 'set' : 'null');
  console.log('  user:', localStorage.user);

  console.log('\nFinal URL:', page.url());

  await browser.close();
}

testLogin().catch(console.error);