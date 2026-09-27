import { test, expect } from '@playwright/test';

test.describe('Phase 3 Golden Path', () => {
  test.setTimeout(60000);

  test('Admin matches, distributes, and University accepts', async ({ page }) => {
    // 1. Admin Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'platformadmin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    await expect(page.locator('h1')).toContainText('Platform Admin Dashboard');

    // 2. Click on the JC-0001 challenge that is SUBMITTED
    const submittedRow = page.locator('tr:has-text("JC-0001")');
    const reviewLink = submittedRow.locator('text=Review & Distribute');
    await reviewLink.click();

    // 3. Generate AI Matches
    await expect(page.locator('h1')).toContainText('Problem Distribution');
    
    // The "Generate AI Matches" button might only be visible if not matched yet
    const generateBtn = page.locator('button:has-text("Generate AI Matches")');
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      // Wait for the button to disappear or say "Analyzing..." then finish
      await expect(page.locator('text=Recommended Universities')).toBeVisible({ timeout: 10000 });
    }

    // 4. Check matches and distribute
    // The seed data guarantees at least one match. The UI automatically pre-selects up to 5.
    const distributeBtn = page.locator('button', { hasText: 'Distribute to' });
    await expect(distributeBtn).not.toBeDisabled();
    await distributeBtn.click();

    // Handle alert / navigation
    // Note: window.alert is handled automatically by Playwright by dismissing, 
    // but if it navigates we just wait for it.
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);

    // 5. Logout
    // We don't have a logout button in the test UI easily accessible in this snippet, 
    // so we'll just clear storage and navigate to login
    await page.context().clearCookies();
    await page.evaluate(() => window.localStorage.clear());

    // 6. University Admin Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'agriadmin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to university assignments
    await expect(page).toHaveURL(/.*\/university\/assignments/);
    await expect(page.locator('h1')).toContainText('University Assignments');

    // 7. View and Accept Assignment
    const viewDetail = page.locator('text=View Detail').first();
    await viewDetail.click();

    await expect(page.locator('text=Why were you matched?')).toBeVisible();
    
    const acceptBtn = page.locator('button:has-text("Accept Assignment")');
    await expect(acceptBtn).toBeVisible();
    
    // Accept it
    page.once('dialog', dialog => dialog.accept()); // auto-accept the success alert
    await acceptBtn.click();

    // The status should turn into ACCEPTED
    await expect(page.locator('span.bg-green-100')).toContainText('ACCEPTED');
  });
});
