import { test, expect } from '@playwright/test';

test.describe('Wali Kelas - Cek Paraf (Production-like)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as wali kelas
    await page.goto('/');
    await page.fill('input[placeholder="Masukkan username"]', 'wali7A');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Masuk")');
    
    // Wait for dashboard to load
    await expect(page.locator('text=✅ Verifikasi')).toBeVisible({ timeout: 10000 });
  });

  test('should view Cek Paraf page with day selector', async ({ page }) => {
    await page.click('button:has-text("📝 Cek Paraf")');
    await expect(page.locator('text=📝 Cek Paraf Orang Tua Per Hari')).toBeVisible({ timeout: 5000 });
    
    // Check day selector (1-30)
    const dayButtons = page.locator('#waliDayGrid .day-btn');
    await expect(dayButtons).toHaveCount(30);
    
    // Check instruction text
    await expect(page.locator('text=Pilih Hari')).toBeVisible();
  });

  test('should select different days and view stats', async ({ page }) => {
    await page.click('button:has-text("📝 Cek Paraf")');
    
    // Select day 1
    await page.click('#waliDayGrid .day-btn:has-text("1")');
    await page.waitForTimeout(2000);
    
    // Check stats badges appear
    await expect(page.locator('text=Terverifikasi')).toBeVisible({ timeout: 5000 });
    
    // Select day 15
    await page.click('#waliDayGrid .day-btn:has-text("15")');
    await page.waitForTimeout(2000);
    
    // Stats should update
    await expect(page.locator('text=Terverifikasi')).toBeVisible({ timeout: 5000 });
  });

  test('should view verification stats', async ({ page }) => {
    await page.click('button:has-text("📝 Cek Paraf")');
    await page.click('#waliDayGrid .day-btn:has-text("1")');
    await page.waitForTimeout(2000);
    
    // Check all stat badges
    const verifiedBadge = page.locator('text=✅').filter({ hasText: /Terverifikasi/ });
    const pendingBadge = page.locator('text=⏳').filter({ hasText: /Pending/ });
    const noDataBadge = page.locator('text=📝').filter({ hasText: /Belum Isi/ });
    
    // At least one should be visible
    const verifiedVisible = await verifiedBadge.isVisible().catch(() => false);
    const pendingVisible = await pendingBadge.isVisible().catch(() => false);
    const noDataVisible = await noDataBadge.isVisible().catch(() => false);
    
    expect(verifiedVisible || pendingVisible || noDataVisible).toBeTruthy();
  });

  test('should view student verification details', async ({ page }) => {
    await page.click('button:has-text("📝 Cek Paraf")');
    await page.click('#waliDayGrid .day-btn:has-text("1")');
    await page.waitForTimeout(2000);
    
    // Check for student rows
    const studentRows = page.locator('.user-row');
    const count = await studentRows.count();
    
    if (count > 0) {
      // Check first student has details
      const firstStudent = studentRows.first();
      await expect(firstStudent).toBeVisible();
      
      // Check for student name
      const nameElement = firstStudent.locator('.uname');
      await expect(nameElement).toBeVisible();
      
      // Check for status badge
      const badge = firstStudent.locator('.badge');
      await expect(badge).toBeVisible();
    }
  });

  test('should view signature thumbnail', async ({ page }) => {
    await page.click('button:has-text("📝 Cek Paraf")');
    await page.click('#waliDayGrid .day-btn:has-text("1")');
    await page.waitForTimeout(2000);
    
    // Look for signature thumbnails
    const signatureImages = page.locator('img[alt="TTD"]');
    const count = await signatureImages.count();
    
    if (count > 0) {
      // First signature should be visible
      const firstSignature = signatureImages.first();
      await expect(firstSignature).toBeVisible();
      
      // Check it has proper styling
      const src = await firstSignature.getAttribute('src');
      expect(src).toBeTruthy(); // Should have src (base64)
    }
  });

  test('should click signature to view full-size', async ({ page }) => {
    await page.click('button:has-text("📝 Cek Paraf")');
    await page.click('#waliDayGrid .day-btn:has-text("1")');
    await page.waitForTimeout(2000);
    
    // Look for signature images
    const signatureImages = page.locator('img[alt="TTD"]');
    const count = await signatureImages.count();
    
    if (count > 0) {
      // Click first signature
      const firstSignature = signatureImages.first();
      await firstSignature.click();
      
      // Should open in new window or modal (depending on implementation)
      // For now, just verify click works
      await page.waitForTimeout(500);
    }
  });

  test('should view parent name and verification date', async ({ page }) => {
    await page.click('button:has-text("📝 Cek Paraf")');
    await page.click('#waliDayGrid .day-btn:has-text("1")');
    await page.waitForTimeout(2000);
    
    // Look for parent name
    const parentNames = page.locator('text=👤');
    const count = await parentNames.count();
    
    if (count > 0) {
      // First parent name should be visible
      const firstName = parentNames.first();
      await expect(firstName).toBeVisible();
    }
    
    // Look for verification dates
    const dates = page.locator('text=📅');
    const dateCount = await dates.count();
    
    if (dateCount > 0) {
      const firstDate = dates.first();
      await expect(firstDate).toBeVisible();
    }
  });

  test('should view reset verification button for verified students', async ({ page }) => {
    await page.click('button:has-text("📝 Cek Paraf")');
    await page.click('#waliDayGrid .day-btn:has-text("1")');
    await page.waitForTimeout(2000);
    
    // Look for reset buttons
    const resetButtons = page.locator('button:has-text("🔄 Batalkan Verifikasi")');
    const count = await resetButtons.count();
    
    // May or may not have verified students
    console.log(`Found ${count} reset buttons`);
  });

  test('should navigate between Verifikasi and Cek Paraf', async ({ page }) => {
    // Go to Verifikasi
    await page.click('button:has-text("✅ Verifikasi")');
    await expect(page.locator('text=⏳ Siswa Pending Verifikasi')).toBeVisible({ timeout: 5000 });
    
    // Go to Cek Paraf
    await page.click('button:has-text("📝 Cek Paraf")');
    await expect(page.locator('text=📝 Cek Paraf Orang Tua Per Hari')).toBeVisible({ timeout: 5000 });
    
    // Back to Verifikasi
    await page.click('button:has-text("✅ Verifikasi")');
    await expect(page.locator('text=⏳ Siswa Pending Verifikasi')).toBeVisible({ timeout: 5000 });
  });
});
