import { test, expect, Page } from '@playwright/test';

const SCREENSHOT_DIR = 'test-results/screenshots';

// Helper to capture console errors
function setupConsoleCapture(page: Page) {
  const errors: string[] = [];
  const warnings: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  return { errors, warnings };
}

// Helper to capture network failures
function setupNetworkCapture(page: Page) {
  const failures: string[] = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });
  return failures;
}

test.describe('Citizen Flow - Complete QA', () => {
  let consoleData: { errors: string[]; warnings: string[] };
  let networkFailures: string[];

  test.beforeEach(async ({ page }) => {
    consoleData = setupConsoleCapture(page);
    networkFailures = setupNetworkCapture(page);
  });

  test.afterEach(async ({}, testInfo) => {
    if (consoleData.errors.length > 0) {
      console.log(`\n=== Console Errors for "${testInfo.title}" ===`);
      consoleData.errors.forEach(e => console.log(`  ERROR: ${e}`));
    }
    if (networkFailures.length > 0) {
      console.log(`\n=== Network Failures for "${testInfo.title}" ===`);
      networkFailures.forEach(f => console.log(`  FAIL: ${f}`));
    }
  });

  test('1. Login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-login-page.png`, fullPage: true });
    
    // Check page has loaded
    await expect(page).toHaveURL(/login/);
    
    // Check email and password fields exist
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Check login button exists
    const loginBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Log in")');
    await expect(loginBtn.first()).toBeVisible();
    
    console.log('LOGIN PAGE: Loaded successfully with email, password, and submit button');
  });

  test('2. Invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"]');
    const loginBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Log in")');
    
    await emailInput.first().fill('invalid@wrong.com');
    await passwordInput.first().fill('wrongpassword');
    await loginBtn.first().click();
    
    // Wait for error response
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-login-invalid.png`, fullPage: true });
    
    // Should still be on login page (not redirected)
    await expect(page).toHaveURL(/login/);
    console.log('INVALID LOGIN: Stays on login page (correct behavior)');
  });

  test('3. Valid citizen login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"]');
    const loginBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Log in")');
    
    await emailInput.first().fill('citizen@example.com');
    await passwordInput.first().fill('password123');
    await loginBtn.first().click();
    
    // Wait for redirect
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-citizen-after-login.png`, fullPage: true });
    
    // Should redirect to citizen dashboard
    const url = page.url();
    console.log(`CITIZEN LOGIN: Redirected to ${url}`);
    expect(url).toContain('/citizen');
  });

  test('4. Citizen dashboard loads with data', async ({ page }) => {
    // Login first
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"]');
    const loginBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Log in")');
    
    await emailInput.first().fill('citizen@example.com');
    await passwordInput.first().fill('password123');
    await loginBtn.first().click();
    await page.waitForTimeout(3000);
    
    // Now on dashboard
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-citizen-dashboard.png`, fullPage: true });
    
    // Check for key dashboard elements
    const pageContent = await page.textContent('body');
    console.log(`DASHBOARD CONTENT (first 500 chars): ${pageContent?.substring(0, 500)}`);
    
    // Check for stats/cards
    const hasProblems = pageContent?.toLowerCase().includes('problem') || pageContent?.toLowerCase().includes('challenge');
    console.log(`DASHBOARD has problem/challenge mentions: ${hasProblems}`);
  });

  test('5. Citizen problems list', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first().fill('citizen@example.com');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    await page.waitForTimeout(3000);
    
    // Navigate to problems list
    await page.goto('/citizen/problems');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-citizen-problems-list.png`, fullPage: true });
    
    const pageContent = await page.textContent('body');
    console.log(`PROBLEMS LIST (first 500 chars): ${pageContent?.substring(0, 500)}`);
  });

  test('6. New Problem form loads', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first().fill('citizen@example.com');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    await page.waitForTimeout(3000);
    
    // Navigate to new problem
    await page.goto('/citizen/problems/new');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-new-problem-form.png`, fullPage: true });
    
    const pageContent = await page.textContent('body');
    console.log(`NEW PROBLEM FORM (first 500 chars): ${pageContent?.substring(0, 500)}`);
    
    // Check for voice recorder, text input, media upload, location
    const hasTextArea = await page.locator('textarea').count();
    console.log(`  Text areas found: ${hasTextArea}`);
    
    const hasFileInput = await page.locator('input[type="file"]').count();
    console.log(`  File inputs found: ${hasFileInput}`);
  });

  test('7. Problem detail page loads', async ({ page }) => {
    // Login first  
    await page.goto('/login');
    await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first().fill('citizen@example.com');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    await page.waitForTimeout(3000);
    
    // Go to problems list first
    await page.goto('/citizen/problems');
    await page.waitForTimeout(2000);
    
    // Try clicking the first problem card/link
    const problemLink = page.locator('a[href*="/citizen/problems/"], [class*="card"], [class*="problem"]').first();
    const problemLinkExists = await problemLink.count();
    
    if (problemLinkExists > 0) {
      await problemLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/07-problem-detail.png`, fullPage: true });
      
      const pageContent = await page.textContent('body');
      console.log(`PROBLEM DETAIL (first 500 chars): ${pageContent?.substring(0, 500)}`);
    } else {
      console.log('PROBLEM DETAIL: No problem cards found to click');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/07-problem-detail-no-cards.png`, fullPage: true });
    }
  });

  test('8. Problem creation flow - text input', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first().fill('citizen@example.com');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    await page.waitForTimeout(3000);
    
    // Navigate to new problem
    await page.goto('/citizen/problems/new');
    await page.waitForTimeout(2000);
    
    // Try to fill in the problem text
    const textarea = page.locator('textarea').first();
    const textareaExists = await textarea.count();
    
    if (textareaExists > 0) {
      await textarea.fill('Farmers in this region experience repeated crop yield losses because excessive rainfall causes waterlogging and damages crops. The soil cannot drain properly and standing water remains for days after rain.');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/08-problem-text-filled.png`, fullPage: true });
      console.log('PROBLEM TEXT: Filled successfully');
    } else {
      console.log('PROBLEM TEXT: No textarea found');
      // Try other input types
      const inputs = await page.locator('input[type="text"]').count();
      console.log(`  Text inputs found: ${inputs}`);
    }
  });
});
