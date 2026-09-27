import { test, expect } from '@playwright/test';

test.describe('Citizen Golden Path', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:5173/login');
  });

  test('should complete the end-to-end citizen workflow', async ({ page }) => {
    // 1. Login as seeded citizen
    await page.fill('input[type="email"]', 'citizen@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Open /citizen and wait for dashboard to load
    await expect(page).toHaveURL('http://localhost:5173/citizen');
    await expect(page.locator('h1')).toContainText('Welcome back');

    // 3. Open New Problem
    await page.click('#report-problem-btn');
    await expect(page).toHaveURL('http://localhost:5173/citizen/problems/new');
    await expect(page.locator('h2', { hasText: 'What problem are you facing?' })).toBeVisible();

    // 4. Enter a realistic farmer problem
    await page.click('#text-mode-btn');
    const problemText = "Heavy rainfall causes waterlogging in my fields every year and my crop yield decreases. I need a solution to reduce crop loss.";
    await page.fill('textarea', problemText);
    await page.click('#analyze-btn');

    // 5. Submit/analyze the problem
    await expect(page.locator('h3').filter({ hasText: 'AI is analyzing your problem' })).toBeVisible({ timeout: 5000 });
    // Wait for the analysis to complete and Review step to show up
    await expect(page.locator('h2').filter({ hasText: 'Review AI Analysis' })).toBeVisible({ timeout: 15000 });

    // 6. Verify mock AI produces structured fields
    // AIReviewCard presents editable fields. Let's verify domain
    const domainInput = page.locator('input[name="domain"]');
    if (await domainInput.isVisible()) {
      await expect(domainInput).toHaveValue('Agriculture');
    }

    // 7. Submit the problem
    await page.click('#submit-problem-btn');

    // 8. Verify Challenge ID/code (success step)
    await expect(page.locator('h2').filter({ hasText: 'Problem submitted successfully!' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('p.text-4xl')).toContainText('JC-'); // Challenge code

    // 9. Open Problem Detail
    await page.click('button:has-text("View Problem")');
    
    // 10. Verify status is SUBMITTED
    await expect(page.locator('span', { hasText: 'SUBMITTED' })).toBeVisible();

    // 11. Verify timeline/history
    await expect(page.locator('h3:has-text("Timeline")')).toBeVisible();

    // 12. Verify original input and structured AI information are preserved
    await expect(page.locator(`text=${problemText}`)).toBeVisible();
    await expect(page.locator('span').filter({ hasText: 'Agriculture' }).first()).toBeVisible();
  });
});
