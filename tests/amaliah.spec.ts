import { test, expect } from '@playwright/test';

test.describe('Amaliah Siswa', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#l-username', 'siswa7A');
    await page.fill('#l-password', 'password123');
    await page.click('#btn-login');
    await expect(page.locator('#screen-app')).toBeVisible({ timeout: 5000 });
  });

  test('should view amaliah page', async ({ page }) => {
    await page.click('button:has-text("✏️ Catat")');
    await expect(page.locator('#page-catat')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.day-grid')).toBeVisible({ timeout: 5000 });
  });

  test('should select day and save data with parent verification', async ({ page }) => {
    await page.click('button:has-text("✏️ Catat")');

    // Select day 22 (fresh day)
    await page.click('.day-btn:has-text("22")');
    await page.waitForTimeout(1000);

    // Check if already verified
    const parentNameInput = page.locator('#parentName');
    const isDisabled = await parentNameInput.isDisabled();
    
    if (isDisabled) {
      // Try day 23 instead
      await page.click('.day-btn:has-text("23")');
      await page.waitForTimeout(800);
    }

    // Toggle some checkboxes
    await page.click('.check-item:has-text("Sholat Subuh")');

    // Fill pages
    await page.fill('input[type="number"]', '2');
    await page.fill('textarea', 'Test catatan');

    // Fill parent name
    await page.fill('#parentName', 'Test Parent');
    await page.waitForTimeout(300);

    // Draw signature on canvas
    const canvas = page.locator('#signatureCanvas');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 40, box.y + 40);
      await page.mouse.down();
      await page.waitForTimeout(100);
      await page.mouse.move(box.x + 80, box.y + 50);
      await page.waitForTimeout(100);
      await page.mouse.move(box.x + 120, box.y + 40);
      await page.mouse.up();
    }
    await page.waitForTimeout(500);

    // Save
    await page.click('button:has-text("💾 Simpan")');

    // Wait for success
    await page.waitForSelector('#toast.show', { timeout: 8000 });
    const toast = await page.locator('#toast.show').textContent();
    expect(toast).toContain('tersimpan');
  });

  test('should view rekap', async ({ page }) => {
    await page.click('button:has-text("📊 Rekap")');
    await expect(page.locator('#page-rekap-siswa')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Rekap Ramadhanku')).toBeVisible({ timeout: 5000 });
  });
});
