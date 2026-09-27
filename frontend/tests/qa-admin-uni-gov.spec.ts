import { test, expect, Page } from '@playwright/test';

const SCREENSHOT_DIR = 'test-results/screenshots';

function setupConsoleCapture(page: Page) {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

function setupNetworkCapture(page: Page) {
  const failures: string[] = [];
  page.on('response', response => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  return failures;
}

async function loginAs(page: Page, email: string) {
  await page.goto('/login');
  await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first().fill(email);
  await page.locator('input[type="password"]').first().fill('password123');
  await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Log in")').first().click();
  await page.waitForTimeout(3000);
}

test.describe('Admin Flow - Complete QA', () => {
  let consoleErrors: string[];
  let networkFailures: string[];

  test.beforeEach(async ({ page }) => {
    consoleErrors = setupConsoleCapture(page);
    networkFailures = setupNetworkCapture(page);
  });

  test.afterEach(async ({}, testInfo) => {
    if (consoleErrors.length > 0) {
      console.log(`\n=== Console Errors for "${testInfo.title}" ===`);
      consoleErrors.forEach(e => console.log(`  ERROR: ${e}`));
    }
    if (networkFailures.length > 0) {
      console.log(`\n=== Network Failures for "${testInfo.title}" ===`);
      networkFailures.forEach(f => console.log(`  FAIL: ${f}`));
    }
  });

  test('1. Admin login and dashboard', async ({ page }) => {
    await loginAs(page, 'platformadmin@example.com');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/admin-01-after-login.png`, fullPage: true });
    
    const url = page.url();
    console.log(`ADMIN LOGIN: Redirected to ${url}`);
    expect(url).toContain('/admin');
    
    const content = await page.textContent('body');
    console.log(`ADMIN DASHBOARD (first 500 chars): ${content?.substring(0, 500)}`);
  });

  test('2. Admin dashboard content', async ({ page }) => {
    await loginAs(page, 'platformadmin@example.com');
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/admin-02-dashboard.png`, fullPage: true });
    
    const content = await page.textContent('body');
    console.log(`ADMIN DASHBOARD CONTENT: ${content?.substring(0, 800)}`);
    
    // Check for challenge cards/links
    const challengeLinks = page.locator('a[href*="/admin/challenges/"]');
    const count = await challengeLinks.count();
    console.log(`ADMIN: Found ${count} challenge links`);
  });

  test('3. Admin challenge detail', async ({ page }) => {
    await loginAs(page, 'platformadmin@example.com');
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    
    // Click first challenge
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first();
    const exists = await challengeLink.count();
    
    if (exists > 0) {
      await challengeLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/admin-03-challenge-detail.png`, fullPage: true });
      
      const content = await page.textContent('body');
      console.log(`ADMIN CHALLENGE DETAIL (first 800 chars): ${content?.substring(0, 800)}`);
      
      // Check for matching/distribution controls
      const matchBtn = page.locator('button:has-text("Match"), button:has-text("Recommend"), button:has-text("AI")');
      const matchExists = await matchBtn.count();
      console.log(`ADMIN: Found ${matchExists} match/recommend buttons`);
      
      const distributeBtn = page.locator('button:has-text("Distribute"), button:has-text("Assign"), button:has-text("Send")');
      const distExists = await distributeBtn.count();
      console.log(`ADMIN: Found ${distExists} distribute/assign buttons`);
    } else {
      console.log('ADMIN: No challenge links found on dashboard');
    }
  });

  test('4. Admin solutions list', async ({ page }) => {
    await loginAs(page, 'platformadmin@example.com');
    await page.goto('/admin/solutions');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/admin-04-solutions-list.png`, fullPage: true });
    
    const content = await page.textContent('body');
    console.log(`ADMIN SOLUTIONS LIST (first 500 chars): ${content?.substring(0, 500)}`);
    
    // Check for solution links
    const solutionLinks = page.locator('a[href*="/admin/solutions/"]');
    const count = await solutionLinks.count();
    console.log(`ADMIN: Found ${count} solution links`);
  });

  test('5. Admin matching demo', async ({ page }) => {
    await loginAs(page, 'platformadmin@example.com');
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    
    // Find a challenge that is SUBMITTED (not yet distributed)
    const challengeLinks = page.locator('a[href*="/admin/challenges/"]');
    const count = await challengeLinks.count();
    
    for (let i = 0; i < count; i++) {
      const text = await challengeLinks.nth(i).textContent();
      console.log(`ADMIN challenge ${i}: ${text?.substring(0, 100)}`);
    }
    
    // Click first challenge and look for matching UI
    if (count > 0) {
      await challengeLinks.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/admin-05-matching-ui.png`, fullPage: true });
      
      const content = await page.textContent('body');
      console.log(`MATCHING UI CONTENT: ${content?.substring(0, 1000)}`);
    }
  });
});

test.describe('University Flow - Complete QA', () => {
  let consoleErrors: string[];
  let networkFailures: string[];

  test.beforeEach(async ({ page }) => {
    consoleErrors = setupConsoleCapture(page);
    networkFailures = setupNetworkCapture(page);
  });

  test.afterEach(async ({}, testInfo) => {
    if (consoleErrors.length > 0) {
      console.log(`\n=== Console Errors for "${testInfo.title}" ===`);
      consoleErrors.forEach(e => console.log(`  ERROR: ${e}`));
    }
    if (networkFailures.length > 0) {
      console.log(`\n=== Network Failures for "${testInfo.title}" ===`);
      networkFailures.forEach(f => console.log(`  FAIL: ${f}`));
    }
  });

  test('1. University admin login', async ({ page }) => {
    await loginAs(page, 'agriadmin@example.com');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/uni-01-after-login.png`, fullPage: true });
    
    const url = page.url();
    console.log(`UNI LOGIN: Redirected to ${url}`);
    expect(url).toContain('/university');
  });

  test('2. University assignments list', async ({ page }) => {
    await loginAs(page, 'agriadmin@example.com');
    await page.goto('/university/assignments');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/uni-02-assignments.png`, fullPage: true });
    
    const content = await page.textContent('body');
    console.log(`UNI ASSIGNMENTS (first 500 chars): ${content?.substring(0, 500)}`);
    
    // Check for assignment cards/links
    const assignmentLinks = page.locator('a[href*="/university/assignments/"]');
    const count = await assignmentLinks.count();
    console.log(`UNI: Found ${count} assignment links`);
  });

  test('3. University assignment detail', async ({ page }) => {
    await loginAs(page, 'agriadmin@example.com');
    await page.goto('/university/assignments');
    await page.waitForTimeout(2000);
    
    const assignmentLink = page.locator('a[href*="/university/assignments/"]').first();
    const exists = await assignmentLink.count();
    
    if (exists > 0) {
      await assignmentLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/uni-03-assignment-detail.png`, fullPage: true });
      
      const content = await page.textContent('body');
      console.log(`UNI ASSIGNMENT DETAIL (first 800 chars): ${content?.substring(0, 800)}`);
    } else {
      console.log('UNI: No assignment links found');
    }
  });

  test('4. University workspaces list', async ({ page }) => {
    await loginAs(page, 'agriadmin@example.com');
    await page.goto('/university/workspaces');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/uni-04-workspaces.png`, fullPage: true });
    
    const content = await page.textContent('body');
    console.log(`UNI WORKSPACES (first 500 chars): ${content?.substring(0, 500)}`);
    
    // Check for workspace links
    const wsLinks = page.locator('a[href*="/university/workspaces/"]');
    const count = await wsLinks.count();
    console.log(`UNI: Found ${count} workspace links`);
  });

  test('5. University workspace detail', async ({ page }) => {
    await loginAs(page, 'agriadmin@example.com');
    await page.goto('/university/workspaces');
    await page.waitForTimeout(2000);
    
    const wsLink = page.locator('a[href*="/university/workspaces/"]').first();
    const exists = await wsLink.count();
    
    if (exists > 0) {
      await wsLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/uni-05-workspace-detail.png`, fullPage: true });
      
      const content = await page.textContent('body');
      console.log(`UNI WORKSPACE DETAIL (first 1000 chars): ${content?.substring(0, 1000)}`);
    } else {
      console.log('UNI: No workspace links found');
    }
  });

  test('6. University solution editor', async ({ page }) => {
    await loginAs(page, 'agriadmin@example.com');
    await page.goto('/university/workspaces');
    await page.waitForTimeout(2000);
    
    const wsLink = page.locator('a[href*="/university/workspaces/"]').first();
    const exists = await wsLink.count();
    
    if (exists > 0) {
      await wsLink.click();
      await page.waitForTimeout(2000);
      
      // Look for solution editor link/button
      const solutionBtn = page.locator('a[href*="solution"], button:has-text("Solution"), button:has-text("Create Solution"), a:has-text("Solution")');
      const solutionExists = await solutionBtn.count();
      console.log(`UNI: Found ${solutionExists} solution links/buttons in workspace`);
      
      if (solutionExists > 0) {
        await solutionBtn.first().click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/uni-06-solution-editor.png`, fullPage: true });
        
        const content = await page.textContent('body');
        console.log(`UNI SOLUTION EDITOR (first 800 chars): ${content?.substring(0, 800)}`);
      }
    }
  });
});

test.describe('Government Flow - QA', () => {
  test('1. Government admin login', async ({ page }) => {
    const consoleErrors = setupConsoleCapture(page);
    const networkFailures = setupNetworkCapture(page);
    
    await loginAs(page, 'govadmin@example.com');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/gov-01-after-login.png`, fullPage: true });
    
    const url = page.url();
    console.log(`GOV LOGIN: Redirected to ${url}`);
    
    const content = await page.textContent('body');
    console.log(`GOV DASHBOARD (first 500 chars): ${content?.substring(0, 500)}`);
    
    if (consoleErrors.length > 0) {
      console.log(`\n=== Console Errors ===`);
      consoleErrors.forEach(e => console.log(`  ERROR: ${e}`));
    }
    if (networkFailures.length > 0) {
      console.log(`\n=== Network Failures ===`);
      networkFailures.forEach(f => console.log(`  FAIL: ${f}`));
    }
  });
});
