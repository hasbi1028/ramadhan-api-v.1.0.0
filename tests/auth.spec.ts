import { test, expect } from '@playwright/test';

test.describe('Authentication - React', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('text=Buku Amaliah Ramadhan')).toBeVisible({ timeout: 5000 });
  });

  test('should login with admin credentials', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[placeholder="Masukkan username"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Masuk")');
    
    // Wait for dashboard to load
    await expect(page.locator('text=Dashboard Admin')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[placeholder="Masukkan username"]', 'admin');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Masuk")');
    
    // Wait for error toast
    await expect(page.locator('text=❌')).toBeVisible({ timeout: 5000 });
  });

  test('should register new siswa', async ({ page }) => {
    await page.goto('/');
    const timestamp = Date.now();
    
    // Click Daftar tab
    await page.click('button:has-text("Daftar")');
    
    await page.fill('input[placeholder="Nama sesuai data sekolah"]', `Siswa Test ${timestamp}`);
    await page.fill('input[placeholder="Buat username unik"]', `siswatest${timestamp}`);
    await page.fill('input[placeholder="Min. 6 karakter"]', 'test123');
    await page.selectOption('select', 'siswa');
    await page.fill('input[placeholder="Contoh: 7A, 8B, 9C"]', '7A');
    
    await page.click('button:has-text("Daftar Sekarang")');
    
    // Wait for success toast
    await expect(page.locator('text=✅')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.fill('input[placeholder="Masukkan username"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Masuk")');
    await expect(page.locator('text=Dashboard Admin')).toBeVisible({ timeout: 10000 });
    
    // Logout
    await page.click('button:has-text("Keluar")');
    await expect(page.locator('text=Buku Amaliah Ramadhan')).toBeVisible({ timeout: 5000 });
  });
});
