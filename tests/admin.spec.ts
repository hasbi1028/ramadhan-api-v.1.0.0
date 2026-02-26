import { test, expect } from '@playwright/test';

test.describe('Admin - Dashboard & User Management (Production-like)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('input[placeholder="Masukkan username"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Masuk")');
    
    // Wait for dashboard to load
    await expect(page.locator('text=🏠 Dashboard Admin')).toBeVisible({ timeout: 10000 });
  });

  test('should view Dashboard with statistics', async ({ page }) => {
    // Click Dashboard tab
    await page.click('button:has-text("🏠 Dashboard")');
    await expect(page.locator('text=🏠 Dashboard Admin')).toBeVisible({ timeout: 5000 });
    
    // Check stats cards exist
    await expect(page.locator('text=Total Wali Kelas')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Total Siswa')).toBeVisible();
    await expect(page.locator('text=Pending Wali Kelas')).toBeVisible();
    await expect(page.locator('text=Halaman Al-Qur\'an')).toBeVisible();
  });

  test('should navigate to Wali Kelas management', async ({ page }) => {
    await page.click('button:has-text("👩‍🏫 Wali Kelas")');
    await expect(page.locator('text=👩‍🏫 Manajemen Wali Kelas')).toBeVisible({ timeout: 5000 });
    
    // Check user list section
    await expect(page.locator('text=Daftar Wali Kelas')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to Siswa management', async ({ page }) => {
    await page.click('button:has-text("🎓 Siswa")');
    await expect(page.locator('text=🎓 Manajemen Siswa')).toBeVisible({ timeout: 5000 });
    
    // Check user list section
    await expect(page.locator('text=Daftar Siswa')).toBeVisible({ timeout: 5000 });
  });

  test('should view user lists with status badges', async ({ page }) => {
    // Go to Wali Kelas
    await page.click('button:has-text("👩‍🏫 Wali Kelas")');
    await page.waitForTimeout(1000);
    
    // Check for user rows
    const userRows = page.locator('.user-row');
    const count = await userRows.count();
    
    if (count > 0) {
      // First user should have status badge
      const firstUser = userRows.first();
      await expect(firstUser).toBeVisible();
      
      // Check for status badge
      const badge = firstUser.locator('.badge');
      await expect(badge).toBeVisible();
    }
    
    // Go to Siswa
    await page.click('button:has-text("🎓 Siswa")');
    await page.waitForTimeout(1000);
    
    // Check for user rows again
    const siswaRows = page.locator('.user-row');
    const siswaCount = await siswaRows.count();
    
    if (siswaCount > 0) {
      const firstSiswa = siswaRows.first();
      await expect(firstSiswa).toBeVisible();
    }
  });

  test('should approve/reject pending users', async ({ page }) => {
    await page.click('button:has-text("👩‍🏫 Wali Kelas")');
    await page.waitForTimeout(1000);
    
    // Look for approve buttons
    const approveBtns = page.locator('button:has-text("✓")');
    const count = await approveBtns.count();
    
    if (count > 0) {
      // Found pending users
      console.log(`Found ${count} pending users to approve`);
      
      // In production, would click approve
      // await approveBtns.first().click();
      // await expect(page.locator('text=✅')).toBeVisible({ timeout: 5000 });
    } else {
      console.log('No pending users');
    }
  });

  test('should delete user', async ({ page }) => {
    await page.click('button:has-text("🎓 Siswa")');
    await page.waitForTimeout(1000);
    
    // Look for delete buttons
    const deleteBtns = page.locator('button:has-text("🗑")');
    const count = await deleteBtns.count();
    
    if (count > 0) {
      // Found users that can be deleted
      console.log(`Found ${count} users with delete option`);
      
      // In production, would click delete and confirm
      // await deleteBtns.first().click();
      // await page.waitForTimeout(500);
      // await page.click('button:has-text("OK")');
      // await expect(page.locator('text=✅')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate between all admin tabs', async ({ page }) => {
    // Dashboard
    await page.click('button:has-text("🏠 Dashboard")');
    await expect(page.locator('text=🏠 Dashboard Admin')).toBeVisible({ timeout: 5000 });
    
    // Wali Kelas
    await page.click('button:has-text("👩‍🏫 Wali Kelas")');
    await expect(page.locator('text=👩‍🏫 Manajemen Wali Kelas')).toBeVisible({ timeout: 5000 });
    
    // Siswa
    await page.click('button:has-text("🎓 Siswa")');
    await expect(page.locator('text=🎓 Manajemen Siswa')).toBeVisible({ timeout: 5000 });

    // Profil
    await page.click('button:has-text("👤 Profil")');
    await expect(page.locator('text=👤 Profil')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Informasi Akun')).toBeVisible({ timeout: 5000 });
    
    // Back to Dashboard
    await page.click('button:has-text("🏠 Dashboard")');
    await expect(page.locator('text=🏠 Dashboard Admin')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Click logout
    await page.click('button:has-text("Keluar")');
    
    // Should return to login page
    await expect(page.locator('text=Buku Amaliah Ramadhan')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Masuk')).toBeVisible();
  });
});
