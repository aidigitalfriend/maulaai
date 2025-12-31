import { test, expect } from '@playwright/test';

test.describe('AI Agent Platform', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/One Last AI/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to agents page', async ({ page }) => {
    await page.click('text=Agents');
    await expect(page).toHaveURL(/.*agents/);
  });

  test('should navigate to lab page', async ({ page }) => {
    await page.click('text=Lab');
    await expect(page).toHaveURL(/.*lab/);
  });

  test('should navigate to tools page', async ({ page }) => {
    await page.click('text=Tools');
    await expect(page).toHaveURL(/.*tools/);
  });
});
