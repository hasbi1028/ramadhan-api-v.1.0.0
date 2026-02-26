import { test, expect } from '@playwright/test';

test.describe('Siswa - Amaliah (Production-like)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as siswa
    await page.goto('/');
    await page.fill('input[placeholder="Masukkan username"]', 'siswa7A');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Masuk")');
    
    // Wait for dashboard to load
    await expect(page.locator('text=✏️ Catat')).toBeVisible({ timeout: 10000 });
  });

  test('should view Catat page with all sections', async ({ page }) => {
    // Click Catat tab
    await page.click('button:has-text("✏️ Catat")');
    await expect(page.locator('text=Pilih Hari Ramadhan')).toBeVisible({ timeout: 5000 });
    
    // Check day selector (1-30)
    const dayButtons = page.locator('.day-btn');
    await expect(dayButtons).toHaveCount(30);
    
    // Check sections exist
    await expect(page.locator('text=🕌 Sholat Fardhu')).toBeVisible();
    await expect(page.locator('text=🌙 Ibadah Sunnah')).toBeVisible();
    await expect(page.locator('text=📖 Tadarus Al-Qur\'an')).toBeVisible();
    await expect(page.locator('text=❤️ Akhlak & Sosial')).toBeVisible();
    await expect(page.locator('text=📝 Catatan Harian')).toBeVisible();
    await expect(page.locator('text=👨‍👩‍👧 Verifikasi Orang Tua/Wali')).toBeVisible();
  });

  test('should select day and save activities', async ({ page }) => {
    await page.click('button:has-text("✏️ Catat")');
    
    // Select day 25 (fresh day)
    await page.click('.day-btn:has-text("25")');
    await page.waitForTimeout(1000);
    
    // Toggle some checkboxes
    await page.click('.check-item:has-text("Sholat Subuh")');
    await page.click('.check-item:has-text("Sholat Dzuhur")');
    await page.click('.check-item:has-text("Makan Sahur")');
    
    // Input Quran pages
    await page.fill('input[type="number"]', '5');
    
    // Add notes
    await page.fill('textarea', 'Alhamdulillah bisa sholat tepat waktu');
    
    // Fill parent name
    await page.fill('input[placeholder="Nama lengkap orang tua/wali"]', 'Test Parent');
    
    // Draw signature (simple mouse movement)
    const canvas = page.locator('.signature-canvas');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + 30);
      await page.mouse.move(box.x + 80, box.y + 20);
      await page.mouse.up();
      await page.waitForTimeout(300);
    }
    
    // Save
    await page.click('button:has-text("💾 Simpan Hari Ini")');
    
    // Wait for success toast
    await expect(page.locator('text=✅')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=tersimpan & diverifikasi')).toBeVisible({ timeout: 5000 });
  });

  test('should validate parent verification before save', async ({ page }) => {
    await page.click('button:has-text("✏️ Catat")');
    await page.click('.day-btn:has-text("26")');
    await page.waitForTimeout(500);
    
    // Toggle checkbox
    await page.click('.check-item:has-text("Sholat Subuh")');
    
    // Try to save without parent name
    await page.click('button:has-text("💾 Simpan Hari Ini")');
    
    // Should show warning toast
    await expect(page.locator('text=⚠️')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Nama orang tua')).toBeVisible({ timeout: 5000 });
  });

  test('should validate signature before save', async ({ page }) => {
    await page.click('button:has-text("✏️ Catat")');
    await page.click('.day-btn:has-text("27")');
    await page.waitForTimeout(500);
    
    // Fill parent name but no signature
    await page.fill('input[placeholder="Nama lengkap orang tua/wali"]', 'Test Parent');
    
    // Try to save
    await page.click('button:has-text("💾 Simpan Hari Ini")');
    
    // Should show warning toast
    await expect(page.locator('text=⚠️')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Tanda tangan')).toBeVisible({ timeout: 5000 });
  });

  test('should clear signature', async ({ page }) => {
    await page.click('button:has-text("✏️ Catat")');
    await page.click('.day-btn:has-text("28")');
    await page.waitForTimeout(500);
    
    // Draw signature
    const canvas = page.locator('.signature-canvas');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + 30);
      await page.mouse.up();
      await page.waitForTimeout(300);
    }
    
    // Clear signature
    await page.click('button:has-text("🗑️ Hapus TTD")');
    
    // Should show info toast
    await expect(page.locator('text=ℹ️')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Tanda tangan dihapus')).toBeVisible({ timeout: 5000 });
  });

  test('should view Rekap page with stats', async ({ page }) => {
    await page.click('button:has-text("📊 Rekap")');
    await expect(page.locator('text=📊 Rekap Ramadhanku')).toBeVisible({ timeout: 5000 });
    
    // Check stats exist
    await expect(page.locator('text=Hari Tercatat')).toBeVisible();
    await expect(page.locator('text=Hal. Quran')).toBeVisible();
    await expect(page.locator('text=Ibadah Selesai')).toBeVisible();
    await expect(page.locator('text=Hari Terbaik')).toBeVisible();
    
    // Check percentage ring
    await expect(page.locator('text=%')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Go to Catat
    await page.click('button:has-text("✏️ Catat")');
    await expect(page.locator('text=Pilih Hari Ramadhan')).toBeVisible({ timeout: 5000 });
    
    // Go to Rekap
    await page.click('button:has-text("📊 Rekap")');
    await expect(page.locator('text=📊 Rekap Ramadhanku')).toBeVisible({ timeout: 5000 });
    
    // Go to Profil
    await page.click('button:has-text("👤 Profil")');
    await expect(page.locator('text=👤 Profil')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Informasi Akun')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Ganti Password')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Username')).toBeVisible();
    await expect(page.locator('text=Status Verifikasi')).toBeVisible();
    
    // Back to Catat
    await page.click('button:has-text("✏️ Catat")');
    await expect(page.locator('text=Pilih Hari Ramadhan')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Click logout
    await page.click('button:has-text("Keluar")');
    
    // Should return to login page
    await expect(page.locator('text=Buku Amaliah Ramadhan')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Masuk')).toBeVisible();
  });
});
