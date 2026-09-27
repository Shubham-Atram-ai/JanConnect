import { test } from '@playwright/test';
test('screenshot', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'citizen@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/citizen');
  await page.goto('http://localhost:5173/citizen/problems');
  await page.click('text=Annual rainfall causes crop yield reduction');
  await page.waitForTimeout(3000);
  const html = await page.content();
  require('fs').writeFileSync('citizen.html', html);
});
