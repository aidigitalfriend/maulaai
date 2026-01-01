import { test, expect } from '@playwright/test';

test.describe('Developer Tools', () => {
  test('should load tools page', async ({ page }) => {
    await page.goto('/tools');
    await expect(page).toHaveTitle(/One Last AI/);
    await expect(page.locator('body')).toBeVisible();
  });
});
