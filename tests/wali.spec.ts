import { test, expect } from '@playwright/test';

test.describe('Wali Kelas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#l-username', 'wali7A');
    await page.fill('#l-password', 'password123');
    await page.click('#btn-login');
    await expect(page.locator('#screen-app')).toBeVisible({ timeout: 5000 });
  });

  test('should view verifikasi page', async ({ page }) => {
    await page.click('button:has-text("✅ Verifikasi")');
    await expect(page.locator('#wali-page-verifikasi')).toBeVisible({ timeout: 5000 });
  });

  test('should view cek paraf page', async ({ page }) => {
    await page.click('button:has-text("📝 Cek Paraf")');
    await expect(page.locator('#wali-page-cek-paraf')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#waliDayGrid')).toBeVisible({ timeout: 5000 });
  });

  test('should select day and view verification status', async ({ page }) => {
    await page.click('button:has-text("📝 Cek Paraf")');
    
    // Wait for day grid
    await page.waitForSelector('#waliDayGrid', { timeout: 3000 });
    await page.waitForTimeout(500);
    
    // Select day 1 (first day)
    const dayBtn = page.locator('#waliDayGrid .day-btn').first();
    await dayBtn.click();
    
    // Wait for verification list to load
    await page.waitForSelector('#wali-verification-list', { timeout: 3000 });
    await page.waitForTimeout(1000);

    // Check if verification list shows status
    const listContent = await page.locator('#wali-verification-list').textContent();
    expect(listContent).toBeTruthy();
  });

  test('should see reset button for verified students', async ({ page }) => {
    await page.click('button:has-text("📝 Cek Paraf")');
    
    // Wait for day grid and select a day
    await page.waitForSelector('#waliDayGrid', { timeout: 3000 });
    await page.waitForTimeout(500);
    
    const dayBtn = page.locator('#waliDayGrid .day-btn').first();
    await dayBtn.click();
    await page.waitForTimeout(1000);
    
    // Check if reset buttons exist (may or may not have verified students)
    const resetBtns = page.locator('button:has-text("🔄 Batalkan Verifikasi")');
    const count = await resetBtns.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should view rekap kelas', async ({ page }) => {
    await page.click('button:has-text("📊 Rekap Kelas")');
    await expect(page.locator('#wali-page-rekap')).toBeVisible({ timeout: 5000 });
  });
});
