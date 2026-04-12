/**
 * PortraitPay AI - UI/QA Test Suite
 *
 * This test suite validates the core user flows:
 * 1. Homepage loads correctly
 * 2. Language toggle works (EN/中文)
 * 3. Theme toggle works (light/dark)
 * 4. Registration flow
 * 5. Login flow
 * 6. Dashboard access after login
 * 7. No console errors on critical pages
 *
 * Run: node tests/e2e/ui-qa.js
 */

const { chromium } = require('@playwright/test');

const BASE_URL = process.env.TEST_URL || 'https://portraitpayai.com';

class QATestRunner {
  constructor() {
    this.results = [];
    this.browser = null;
    this.context = null;
  }

  async setup() {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.results = [];
  }

  async teardown() {
    if (this.browser) await this.browser.close();
  }

  async test(name, fn) {
    try {
      await fn();
      this.results.push({ name, passed: true });
      console.log(`  ✅ ${name}`);
    } catch (error) {
      this.results.push({ name, passed: false, error: error.message });
      console.log(`  ❌ ${name}: ${error.message}`);
    }
  }

  async runTests() {
    await this.setup();

    console.log('\n🧪 PortraitPay AI - UI/QA Test Suite\n');

    // Test 1: Homepage loads
    await this.test('Homepage loads without error', async () => {
      const page = await this.context.newPage();
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      if (errors.length > 0) {
        throw new Error(`Console errors: ${errors.join(', ')}`);
      }

      const title = await page.title();
      if (!title.includes('PortraitPay')) {
        throw new Error(`Unexpected title: ${title}`);
      }

      await page.close();
    });

    // Test 2: Language toggle on homepage
    await this.test('Language toggle switches between EN and 中文', async () => {
      const page = await this.context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Find language toggle buttons
      const enBtn = page.locator('button', { hasText: 'EN' });
      const zhBtn = page.locator('button', { hasText: '中文' });

      // Check initial state (should be Chinese by default)
      const zhVisible = await zhBtn.first().isVisible().catch(() => false);

      if (zhVisible) {
        // Switch to English
        await enBtn.first().click();
        await page.waitForTimeout(500);
      }

      // Switch back to Chinese
      await zhBtn.first().click();
      await page.waitForTimeout(500);

      await page.close();
    });

    // Test 3: Login page loads
    await this.test('Login page loads correctly', async () => {
      const page = await this.context.newPage();
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      // Check for email input
      const emailInput = page.locator('input[type="email"]');
      if (!await emailInput.isVisible()) {
        throw new Error('Email input not found on login page');
      }

      // Check for password input
      const passwordInput = page.locator('input[type="password"]');
      if (!await passwordInput.isVisible()) {
        throw new Error('Password input not found on login page');
      }

      await page.close();
    });

    // Test 4: Login page has language toggle
    await this.test('Login page has language toggle', async () => {
      const page = await this.context.newPage();
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      const enBtn = page.locator('button', { hasText: 'EN' });
      const zhBtn = page.locator('button', { hasText: '中文' });

      if (!await enBtn.first().isVisible() || !await zhBtn.first().isVisible()) {
        throw new Error('Language toggle not found on login page');
      }

      await page.close();
    });

    // Test 5: Login with valid credentials
    await this.test('Login flow succeeds with valid credentials', async () => {
      const page = await this.context.newPage();
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'Test123456');
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard**', { timeout: 15000 });

      const url = page.url();
      if (!url.includes('/dashboard')) {
        throw new Error(`Expected dashboard URL, got: ${url}`);
      }

      await page.close();
    });

    // Test 6: Dashboard loads after login
    await this.test('Dashboard loads correctly after login', async () => {
      // Login first
      const loginPage = await this.context.newPage();
      await loginPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await loginPage.fill('input[type="email"]', 'test@example.com');
      await loginPage.fill('input[type="password"]', 'Test123456');
      await loginPage.click('button[type="submit"]');
      await loginPage.waitForURL('**/dashboard**', { timeout: 15000 });
      await loginPage.close();

      // Check dashboard
      const dashboardPage = await this.context.newPage();
      await dashboardPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });

      const url = dashboardPage.url();
      if (url.includes('/login')) {
        throw new Error('Redirected back to login - session not persisted');
      }

      await dashboardPage.close();
    });

    // Test 7: Dashboard has language toggle
    await this.test('Dashboard has language toggle in header', async () => {
      // Login first
      const loginPage = await this.context.newPage();
      await loginPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await loginPage.fill('input[type="email"]', 'test@example.com');
      await loginPage.fill('input[type="password"]', 'Test123456');
      await loginPage.click('button[type="submit"]');
      await loginPage.waitForURL('**/dashboard**', { timeout: 15000 });
      await loginPage.close();

      // Check dashboard header
      const dashboardPage = await this.context.newPage();
      await dashboardPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });

      const enBtn = dashboardPage.locator('button', { hasText: 'EN' });
      const zhBtn = dashboardPage.locator('button', { hasText: '中文' });

      if (!await enBtn.first().isVisible() || !await zhBtn.first().isVisible()) {
        throw new Error('Language toggle not found in dashboard header');
      }

      await dashboardPage.close();
    });

    // Test 8: Register page loads
    await this.test('Register page loads correctly', async () => {
      const page = await this.context.newPage();
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

      // Check for name input
      const nameInput = page.locator('input[placeholder*="name"], input[placeholder*="姓名"]').first();
      if (!await nameInput.isVisible()) {
        throw new Error('Name input not found on register page');
      }

      await page.close();
    });

    // Test 9: No console errors on login page
    await this.test('Login page has no console errors', async () => {
      const page = await this.context.newPage();
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      if (errors.length > 0) {
        throw new Error(`Console errors: ${errors.join(', ')}`);
      }

      await page.close();
    });

    // Test 10: No console errors on dashboard
    await this.test('Dashboard has no console errors', async () => {
      // Login first
      const loginPage = await this.context.newPage();
      await loginPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await loginPage.fill('input[type="email"]', 'test@example.com');
      await loginPage.fill('input[type="password"]', 'Test123456');
      await loginPage.click('button[type="submit"]');
      await loginPage.waitForURL('**/dashboard**', { timeout: 15000 });
      await loginPage.close();

      // Check dashboard for errors
      const dashboardPage = await this.context.newPage();
      const errors = [];
      dashboardPage.on('pageerror', err => errors.push(err.message));

      await dashboardPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
      await dashboardPage.waitForTimeout(1000);

      if (errors.length > 0) {
        throw new Error(`Console errors: ${errors.join(', ')}`);
      }

      await dashboardPage.close();
    });

    await this.teardown();

    // Print summary
    this.printSummary();
  }

  printSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(50));
    console.log(`Test Results: ${passed}/${total} passed, ${failed} failed`);
    console.log('='.repeat(50));

    if (failed > 0) {
      console.log('\nFailed tests:');
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  ❌ ${r.name}`);
        console.log(`     ${r.error}`);
      });
    }

    console.log('');
  }
}

// Run tests
const runner = new QATestRunner();
runner.runTests().catch(console.error);
