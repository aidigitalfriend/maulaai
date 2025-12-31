import { test, expect } from '@playwright/test';

test.describe('AI Lab Experiments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lab');
  });

  test('should load AI Lab page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/AI Lab/);
  });

  test('should display experiment categories', async ({ page }) => {
    await expect(page.locator('text=Image Generation')).toBeVisible();
    await expect(page.locator('text=Emotion Analysis')).toBeVisible();
    await expect(page.locator('text=Future Prediction')).toBeVisible();
  });

  test('should navigate to image generation', async ({ page }) => {
    await page.click('text=Image Generation');
    await expect(page).toHaveURL(/.*image-playground/);
  });

  test('should navigate to emotion analysis', async ({ page }) => {
    await page.click('text=Emotion Analysis');
    await expect(page).toHaveURL(/.*emotion-visualizer/);
  });
});
