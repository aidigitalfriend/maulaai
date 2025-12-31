import { test, expect } from '@playwright/test';

test.describe('Developer Tools', () => {
  test('should load DNS lookup tool', async ({ page }) => {
    await page.goto('/tools/dns-lookup');
    await expect(page.locator('h1')).toContainText(/DNS Lookup/);
  });

  test('should perform DNS lookup', async ({ page }) => {
    await page.goto('/tools/dns-lookup');
    await page.fill('input[placeholder*="domain"]', 'google.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Results')).toBeVisible();
  });

  test('should load IP geolocation tool', async ({ page }) => {
    await page.goto('/tools/ip-geolocation');
    await expect(page.locator('h1')).toContainText(/IP Geolocation/);
  });

  test('should perform IP geolocation lookup', async ({ page }) => {
    await page.goto('/tools/ip-geolocation');
    await page.fill('input[placeholder*="IP address"]', '8.8.8.8');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Location Information')).toBeVisible();
  });

  test('should load hash generator', async ({ page }) => {
    await page.goto('/tools/hash-generator');
    await expect(page.locator('h1')).toContainText(/Hash Generator/);
  });
});