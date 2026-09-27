import { test, expect } from '@playwright/test';

test.describe('Phase 5: Golden Path - Solution Submission', () => {
  test('University creates and submits a solution, admin and citizen view it', async ({ page }) => {
    // 1. Login as University Admin (Faculty Lead equivalent)
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'agriadmin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for university dashboard
    await expect(page.locator('h1')).toContainText('University Dashboard');
    
    // Go to workspaces
    await page.goto('http://localhost:5173/university/workspaces');
    await expect(page.locator('h1')).toContainText('Research Workspaces');
    
    // Click on the active workspace
    await page.click('text=Open Workspace');
    
    // Verify we are in the workspace detail
    await expect(page.locator('h1')).toContainText('Agricultural Waterlogging');
    
    // Check if the solution is already created (seeded) or we can just view it
    // If it's already submitted in the seed, we just view it
    const solutionButton = page.locator('text=View Submitted Solution');
    if (await solutionButton.isVisible()) {
      await solutionButton.click();
      await expect(page.locator('h1')).toContainText('View Submitted Solution');
      await expect(page.locator('input[type="text"]').first()).toBeDisabled();
    } else {
      // If not submitted, create and submit
      await page.click('text=Create Solution');
      await page.fill('input[type="text"]', 'E2E Automated Solution');
      await page.fill('textarea', 'E2E Summary');
      await page.click('text=Save Draft');
      await page.click('text=Submit Solution');
      page.on('dialog', dialog => dialog.accept());
    }
    
    // 2. Login as Platform Admin
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'platformadmin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    
    await page.goto('http://localhost:5173/admin/solutions');
    await expect(page.locator('h1')).toContainText('Platform Admin - Submitted Solutions');
    
    // Click on View Solution
    await page.click('text=View Solution');
    await expect(page.locator('h1')).toContainText('Integrated Subsurface Drainage System');
    
    // 3. Login as Citizen
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'citizen@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/citizen');
    
    // Navigate to problem detail
    await page.goto('http://localhost:5173/citizen/problems');
    await page.click('text=JC-0001');
    await expect(page.locator('h1')).toContainText('Annual rainfall causes crop yield reduction');
    
    // See solution
    await expect(page.getByRole('heading', { name: /Proposed Solutions/i })).toBeVisible();
    await page.click('text=View Solution');
    await expect(page.locator('h1')).toContainText('Integrated Subsurface Drainage System');
  });
});
