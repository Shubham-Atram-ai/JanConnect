import { test, expect } from '@playwright/test';

test.describe('Phase 4 Golden Path: Research Workspace & Team Collaboration', () => {
  test.setTimeout(60000);

  test('Faculty Lead opens workspace, adds team members, creates tasks, notes, evidence, findings, and marks READY_FOR_SOLUTION', async ({ page }) => {
    // 1. Login as University Admin (uniadmin@example.com - JTU)
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'uniadmin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should land on University Assignments
    await expect(page).toHaveURL(/.*\/university\/assignments/);
    await expect(page.locator('h1')).toContainText('University Assignments');

    // 2. Open accepted assignment for JC-0001
    const viewDetailLink = page.locator('tr:has-text("JC-0001")').locator('text=View Detail');
    await viewDetailLink.click();

    // Verify Research Workspace banner is present for ACCEPTED assignment
    await expect(page.locator('h3:has-text("Research Workspace")')).toBeVisible();

    // 3. Open Research Workspace
    const openWsBtn = page.locator('button:has-text("Open Research Workspace")');
    await openWsBtn.click();

    // Verify Workspace Dashboard loaded
    await expect(page.locator('h1')).toContainText('Crop Waterlogging Mitigation Research Workspace');
    await expect(page.locator('text=Original Problem Context')).toBeVisible();

    // 4. Team Tab Interaction
    await page.click('button:has-text("Team")');
    await expect(page.locator('h3:has-text("Team Roster")')).toBeVisible();
    await expect(page.locator('text=uniadmin@example.com')).toBeVisible();

    // 5. Tasks Tab Interaction (Kanban Board)
    await page.click('button:has-text("Tasks")');
    await page.fill('input[placeholder*="New Task Title"]', 'Study soil compaction depth');
    await page.click('button:has-text("Add Task")');
    await expect(page.locator('text=Study soil compaction depth')).toBeVisible();

    // 6. Notes Tab Interaction
    await page.click('button:has-text("Notes")');
    await page.fill('input[placeholder*="Note Title"]', 'Hypothesis on Subsurface Clay Layer');
    await page.fill('textarea[placeholder*="Write research notes"]', 'Field tests indicate clay layer at 1.5m restricts vertical drainage.');
    await page.click('button:has-text("Add Research Note")');
    await expect(page.locator('h4:has-text("Hypothesis on Subsurface Clay Layer")')).toBeVisible();

    // 7. Evidence Tab Interaction
    await page.click('button:has-text("Evidence")');
    await page.fill('input[placeholder*="Evidence Title"]', 'Soil Permeability Test Log');
    await page.fill('input[placeholder*="Storage Key"]', 'soil-test-log-2026.pdf');
    await page.click('button:has-text("Upload Evidence")');
    await expect(page.locator('h4:has-text("Soil Permeability Test Log")')).toBeVisible();

    // 8. References Tab Interaction
    await page.click('button:has-text("References")');
    await page.fill('input[placeholder*="Paper / Reference Title"]', 'ICAR Subsurface Drainage Manual');
    await page.click('button:has-text("Add Reference")');
    await expect(page.locator('h4:has-text("ICAR Subsurface Drainage Manual")')).toBeVisible();

    // 9. Findings Tab Interaction
    await page.click('button:has-text("Findings")');
    await page.fill('input[placeholder*="Finding Title"]', 'Compacted clay restricts moisture dissipation');
    await page.fill('textarea[placeholder*="Detailed finding summary"]', 'Subsurface drainage perforated pipes at 1.2m depth will resolve waterlogging.');
    await page.click('button:has-text("Record Confirmed Finding")');
    await expect(page.locator('h4:has-text("Compacted clay restricts moisture dissipation")')).toBeVisible();

    // 10. Discussion Tab Interaction
    await page.click('button:has-text("Discussion")');
    await page.fill('input[placeholder*="Start discussion thread"]', 'Should we install PVC pipes or perforated corrugated tubing?');
    await page.click('button:has-text("Post Message")');
    await expect(page.locator('text=Should we install PVC pipes')).toBeVisible();

    // 11. Mark Workspace READY_FOR_SOLUTION
    page.once('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Mark Ready for Solution")');
    await expect(page.locator('span:has-text("READY_FOR_SOLUTION")')).toBeVisible();
  });
});
