import { test, expect, Page } from '@playwright/test';

const SCREENSHOT_DIR = 'test-results/screenshots';

// Increase timeout for all tests in this file
test.setTimeout(60000);

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

function setupNetworkCapture(page: Page) {
  const failures: string[] = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });
  return failures;
}

async function loginAsCitizen(page: Page) {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.fill('#email', 'citizen@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/citizen**', { timeout: 15000 });
}

async function loginAsAdmin(page: Page) {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.fill('#email', 'platformadmin@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/**', { timeout: 15000 });
}

async function loginAsUniAdmin(page: Page, email = 'agriadmin@example.com') {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.fill('#email', email);
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/university/**', { timeout: 15000 });
}

test.describe('1. Login Page QA', () => {
  test('Login page renders correctly', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    const netFails = setupNetworkCapture(page);
    
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-login-page.png`, fullPage: true });
    
    // Check key elements
    await expect(page.locator('h1:has-text("JanConnect")')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    
    console.log('✅ LOGIN PAGE: All elements render correctly');
    console.log(`   Console errors: ${errors.length}`);
    console.log(`   Network failures: ${netFails.length}`);
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
    netFails.forEach(f => console.log(`   ❌ Network: ${f}`));
  });

  test('Invalid login shows error message', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    await page.fill('#email', 'invalid@wrong.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error message to appear
    const errorMsg = page.getByText('Invalid email or password. Please try again.');
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-login-error.png`, fullPage: true });
    console.log('✅ INVALID LOGIN: Error message displayed correctly');
  });

  test('Citizen login succeeds and redirects', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    const netFails = setupNetworkCapture(page);
    
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('#email', 'citizen@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/citizen**', { timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-citizen-dashboard.png`, fullPage: true });
    
    expect(page.url()).toContain('/citizen');
    console.log(`✅ CITIZEN LOGIN: Redirected to ${page.url()}`);
    console.log(`   Console errors: ${errors.length}`);
    console.log(`   Network failures: ${netFails.length}`);
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
    netFails.forEach(f => console.log(`   ❌ Network: ${f}`));
  });

  test('Admin login redirects correctly', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('#email', 'platformadmin@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin/**', { timeout: 15000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-admin-dashboard.png`, fullPage: true });
    
    expect(page.url()).toContain('/admin');
    console.log(`✅ ADMIN LOGIN: Redirected to ${page.url()}`);
  });

  test('University login redirects correctly', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('#email', 'agriadmin@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/university/**', { timeout: 15000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-uni-assignments.png`, fullPage: true });
    
    expect(page.url()).toContain('/university');
    console.log(`✅ UNI LOGIN: Redirected to ${page.url()}`);
  });
});

test.describe('2. Citizen Dashboard QA', () => {
  test('Dashboard loads with stats and problems', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    const netFails = setupNetworkCapture(page);
    
    await loginAsCitizen(page);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-citizen-dashboard-full.png`, fullPage: true });
    
    const content = await page.textContent('body') || '';
    console.log(`DASHBOARD CONTENT PREVIEW: ${content.substring(0, 500)}`);
    
    // Check for dashboard elements
    const hasDashboardContent = content.length > 100;
    console.log(`✅ DASHBOARD: Content loaded (${content.length} chars)`);
    console.log(`   Console errors: ${errors.length}`);
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
    netFails.forEach(f => console.log(`   ❌ Network: ${f}`));
    
    expect(hasDashboardContent).toBeTruthy();
  });
});

test.describe('3. Citizen Problems QA', () => {
  test('My Problems list loads', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    const netFails = setupNetworkCapture(page);
    
    await loginAsCitizen(page);
    await page.goto('/citizen/problems', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/07-citizen-problems-list.png`, fullPage: true });
    
    const content = await page.textContent('body') || '';
    console.log(`MY PROBLEMS: ${content.substring(0, 500)}`);
    
    // Count problem cards/items
    const cards = await page.locator('[class*="card"], [class*="problem"], a[href*="/citizen/problems/"]').count();
    console.log(`   Problem cards/links found: ${cards}`);
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
    netFails.forEach(f => console.log(`   ❌ Network: ${f}`));
  });

  test('New Problem page loads', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    
    await loginAsCitizen(page);
    await page.goto('/citizen/problems/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/08-new-problem-page.png`, fullPage: true });
    
    const content = await page.textContent('body') || '';
    console.log(`NEW PROBLEM PAGE: ${content.substring(0, 500)}`);
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
  });

  test('Problem detail page loads for first submitted problem', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    const netFails = setupNetworkCapture(page);
    
    await loginAsCitizen(page);
    await page.goto('/citizen/problems', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Find and click a problem link
    const problemLinks = page.locator('a[href*="/citizen/problems/"]');
    const linkCount = await problemLinks.count();
    console.log(`PROBLEMS: Found ${linkCount} problem links`);
    
    if (linkCount > 0) {
      const href = await problemLinks.first().getAttribute('href');
      console.log(`   Clicking first link: ${href}`);
      await problemLinks.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/09-problem-detail.png`, fullPage: true });
      
      const content = await page.textContent('body') || '';
      console.log(`PROBLEM DETAIL: ${content.substring(0, 500)}`);
    } else {
      // Try navigating directly if we know challenge IDs from API
      console.log('No problem links found. Checking API for challenges...');
    }
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
    netFails.forEach(f => console.log(`   ❌ Network: ${f}`));
  });
});

test.describe('4. Admin Dashboard QA', () => {
  test('Admin dashboard loads with challenges', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    const netFails = setupNetworkCapture(page);
    
    await loginAsAdmin(page);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/10-admin-dashboard.png`, fullPage: true });
    
    const content = await page.textContent('body') || '';
    console.log(`ADMIN DASHBOARD: ${content.substring(0, 800)}`);
    
    // Find challenge links
    const challengeLinks = page.locator('a[href*="/admin/challenges/"]');
    const count = await challengeLinks.count();
    console.log(`   Challenge links found: ${count}`);
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
    netFails.forEach(f => console.log(`   ❌ Network: ${f}`));
  });

  test('Admin challenge detail with matching', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    const netFails = setupNetworkCapture(page);
    
    await loginAsAdmin(page);
    await page.waitForTimeout(2000);
    
    // Click first challenge
    const challengeLinks = page.locator('a[href*="/admin/challenges/"]');
    const count = await challengeLinks.count();
    
    if (count > 0) {
      await challengeLinks.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/11-admin-challenge-detail.png`, fullPage: true });
      
      const content = await page.textContent('body') || '';
      console.log(`ADMIN CHALLENGE DETAIL: ${content.substring(0, 800)}`);
      
      // Look for matching/distribute controls
      const allButtons = await page.locator('button').allTextContents();
      console.log(`   Buttons on page: ${allButtons.join(', ')}`);
    }
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
    netFails.forEach(f => console.log(`   ❌ Network: ${f}`));
  });

  test('Admin solutions list', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    
    await loginAsAdmin(page);
    await page.goto('/admin/solutions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/12-admin-solutions.png`, fullPage: true });
    
    const content = await page.textContent('body') || '';
    console.log(`ADMIN SOLUTIONS: ${content.substring(0, 500)}`);
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
  });
});

test.describe('5. University QA', () => {
  test('University assignments list', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    const netFails = setupNetworkCapture(page);
    
    await loginAsUniAdmin(page);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/13-uni-assignments.png`, fullPage: true });
    
    const content = await page.textContent('body') || '';
    console.log(`UNI ASSIGNMENTS: ${content.substring(0, 500)}`);
    
    const assignmentLinks = page.locator('a[href*="/university/assignments/"]');
    const count = await assignmentLinks.count();
    console.log(`   Assignment links found: ${count}`);
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
    netFails.forEach(f => console.log(`   ❌ Network: ${f}`));
  });

  test('University workspaces list', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    
    await loginAsUniAdmin(page);
    await page.goto('/university/workspaces', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/14-uni-workspaces.png`, fullPage: true });
    
    const content = await page.textContent('body') || '';
    console.log(`UNI WORKSPACES: ${content.substring(0, 500)}`);
    
    const wsLinks = page.locator('a[href*="/university/workspaces/"]');
    const count = await wsLinks.count();
    console.log(`   Workspace links found: ${count}`);
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
  });

  test('University workspace detail', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    const netFails = setupNetworkCapture(page);
    
    await loginAsUniAdmin(page);
    await page.goto('/university/workspaces', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const wsLinks = page.locator('a[href*="/university/workspaces/"]');
    const count = await wsLinks.count();
    
    if (count > 0) {
      await wsLinks.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/15-uni-workspace-detail.png`, fullPage: true });
      
      const content = await page.textContent('body') || '';
      console.log(`UNI WORKSPACE DETAIL: ${content.substring(0, 1000)}`);
      
      // Check for tabs
      const allButtons = await page.locator('button').allTextContents();
      console.log(`   Buttons/tabs: ${allButtons.join(', ')}`);
    } else {
      console.log('UNI: No workspace links found');
    }
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
    netFails.forEach(f => console.log(`   ❌ Network: ${f}`));
  });

  test('University solution editor', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    const netFails = setupNetworkCapture(page);
    
    await loginAsUniAdmin(page);
    await page.goto('/university/workspaces', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const wsLinks = page.locator('a[href*="/university/workspaces/"]');
    const count = await wsLinks.count();
    
    if (count > 0) {
      const href = await wsLinks.first().getAttribute('href');
      // Navigate directly to solution editor
      if (href) {
        await page.goto(`${href}/solution`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/16-uni-solution-editor.png`, fullPage: true });
        
        const content = await page.textContent('body') || '';
        console.log(`UNI SOLUTION EDITOR: ${content.substring(0, 800)}`);
      }
    }
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
    netFails.forEach(f => console.log(`   ❌ Network: ${f}`));
  });
});

test.describe('6. Government QA', () => {
  test('Government admin login and view', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    const netFails = setupNetworkCapture(page);
    
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('#email', 'govadmin@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/17-gov-after-login.png`, fullPage: true });
    
    const url = page.url();
    const content = await page.textContent('body') || '';
    console.log(`GOV LOGIN: Ended up at ${url}`);
    console.log(`GOV CONTENT: ${content.substring(0, 500)}`);
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
    netFails.forEach(f => console.log(`   ❌ Network: ${f}`));
  });
});

test.describe('7. Navigation QA', () => {
  test('Citizen can navigate between pages', async ({ page }) => {
    const { errors } = setupConsoleCapture(page);
    
    await loginAsCitizen(page);
    
    // Dashboard
    await page.screenshot({ path: `${SCREENSHOT_DIR}/nav-01-citizen-dashboard.png`, fullPage: true });
    console.log(`NAV: Citizen dashboard at ${page.url()}`);
    
    // Go to problems
    await page.goto('/citizen/problems', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/nav-02-citizen-problems.png`, fullPage: true });
    console.log(`NAV: Citizen problems at ${page.url()}`);
    
    // Go to new problem
    await page.goto('/citizen/problems/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/nav-03-citizen-new-problem.png`, fullPage: true });
    console.log(`NAV: Citizen new problem at ${page.url()}`);
    
    // Go back to dashboard
    await page.goto('/citizen', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log(`NAV: Back to dashboard at ${page.url()}`);
    
    // Check navigation links on page
    const navLinks = await page.locator('nav a, a[href*="/citizen"]').allTextContents();
    console.log(`NAV LINKS: ${navLinks.join(', ')}`);
    
    errors.forEach(e => console.log(`   ❌ Console: ${e}`));
  });
});
