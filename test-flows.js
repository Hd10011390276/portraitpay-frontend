const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  async function report(flow, passed, details) {
    results.push({ flow, passed, details });
    console.log(`\n[${passed ? 'PASS' : 'FAIL'}] ${flow}`);
    console.log(`Details: ${details}`);
  }

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Flow 1: Login Page
  try {
    consoleErrors.length = 0;
    await page.goto('https://portraitpayai.com/login', { waitUntil: 'networkidle', timeout: 30000 });
    const loginForm = await page.locator('form').count();
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[id="email"]').count();
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').count();
    const submitBtn = await page.locator('button[type="submit"], button').count();
    const pageTitle = await page.title();
    const h1 = await page.locator('h1').textContent().catch(() => 'N/A');

    await report('Flow 1: Login Page', true,
      `Title: "${pageTitle}", H1: "${h1}", Forms: ${loginForm}, Email inputs: ${emailInput}, Password inputs: ${passwordInput}, Buttons: ${submitBtn}, Console errors: ${consoleErrors.length > 0 ? consoleErrors.join('; ') : 'none'}`);
  } catch (e) {
    await report('Flow 1: Login Page', false, `Error: ${e.message}`);
  }

  // Flow 2: Portraits List
  try {
    consoleErrors.length = 0;
    await page.goto('https://portraitpayai.com/portraits', { waitUntil: 'networkidle', timeout: 30000 });
    const h1 = await page.locator('h1').textContent().catch(() => 'N/A');
    const portraitItems = await page.locator('[data-testid], .portrait, .card, article, li').count();
    const pageContent = await page.locator('body').innerText().catch(() => '');
    const hasEmptyState = pageContent.toLowerCase().includes('no portrait') || pageContent.toLowerCase().includes('empty') || pageContent.toLowerCase().includes('not found');
    const url = page.url();

    await report('Flow 2: Portraits List', true,
      `URL: ${url}, H1: "${h1}", Portrait elements: ${portraitItems}, Empty state: ${hasEmptyState}, Console errors: ${consoleErrors.length > 0 ? consoleErrors.join('; ') : 'none'}`);
  } catch (e) {
    await report('Flow 2: Portraits List', false, `Error: ${e.message}`);
  }

  // Flow 3: Portrait Detail - get first portrait link
  try {
    consoleErrors.length = 0;
    // First get list page to find a portrait link
    await page.goto('https://portraitpayai.com/portraits', { waitUntil: 'networkidle', timeout: 30000 });
    const firstPortraitLink = page.locator('a[href*="/portraits/"]').first();
    const linkCount = await page.locator('a[href*="/portraits/"]').count();

    if (linkCount > 0) {
      const href = await firstPortraitLink.getAttribute('href');
      await page.goto(`https://portraitpayai.com${href}`, { waitUntil: 'networkidle', timeout: 30000 });
      const h1 = await page.locator('h1').textContent().catch(() => 'N/A');
      const pageContent = await page.locator('body').innerText().catch(() => '');
      await report('Flow 3: Portrait Detail', true,
        `URL: ${page.url()}, H1: "${h1}", Content length: ${pageContent.length}, Console errors: ${consoleErrors.length > 0 ? consoleErrors.join('; ') : 'none'}`);
    } else {
      await report('Flow 3: Portrait Detail', false, 'No portrait links found on /portraits page');
    }
  } catch (e) {
    await report('Flow 3: Portrait Detail', false, `Error: ${e.message}`);
  }

  // Flow 4: KYC Page
  try {
    consoleErrors.length = 0;
    await page.goto('https://portraitpayai.com/kyc', { waitUntil: 'networkidle', timeout: 30000 });
    const h1 = await page.locator('h1').textContent().catch(() => 'N/A');
    const formInputs = await page.locator('input').count();
    const formExists = await page.locator('form').count();
    const pageContent = await page.locator('body').innerText().catch(() => '');
    const url = page.url();

    await report('Flow 4: KYC Page', true,
      `URL: ${url}, H1: "${h1}", Forms: ${formExists}, Inputs: ${formInputs}, Content preview: ${pageContent.substring(0, 200)}, Console errors: ${consoleErrors.length > 0 ? consoleErrors.join('; ') : 'none'}`);
  } catch (e) {
    await report('Flow 4: KYC Page', false, `Error: ${e.message}`);
  }

  // Flow 5: Upload Page
  try {
    consoleErrors.length = 0;
    await page.goto('https://portraitpayai.com/portraits/upload', { waitUntil: 'networkidle', timeout: 30000 });
    const h1 = await page.locator('h1').textContent().catch(() => 'N/A');
    const formExists = await page.locator('form').count();
    const fileInput = await page.locator('input[type="file"]').count();
    const url = page.url();

    await report('Flow 5: Upload Page', true,
      `URL: ${url}, H1: "${h1}", Forms: ${formExists}, File inputs: ${fileInput}, Console errors: ${consoleErrors.length > 0 ? consoleErrors.join('; ') : 'none'}`);
  } catch (e) {
    await report('Flow 5: Upload Page', false, `Error: ${e.message}`);
  }

  console.log('\n=== SUMMARY ===');
  results.forEach(r => {
    console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.flow}`);
  });

  await browser.close();
})();
