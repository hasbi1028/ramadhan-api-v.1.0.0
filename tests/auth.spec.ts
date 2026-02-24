import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#screen-auth')).toBeVisible();
  });

  test('should login with admin credentials', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#l-username', 'admin');
    await page.fill('#l-password', 'admin123');
    await page.click('#btn-login');
    
    await expect(page.locator('#screen-app')).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#l-username', 'admin');
    await page.fill('#l-password', 'wrong');
    await page.click('#btn-login');
    
    await expect(page.locator('#login-error')).toBeVisible({ timeout: 5000 });
  });

  test('should register new siswa', async ({ page }) => {
    await page.goto('/');
    const timestamp = Date.now();
    
    await page.click('button:has-text("Daftar")');
    await page.fill('#r-name', `Siswa Test ${timestamp}`);
    await page.fill('#r-username', `siswatest${timestamp}`);
    await page.fill('#r-password', 'test123');
    await page.selectOption('#r-role', 'siswa');
    await page.fill('#r-kelas', '7A');
    await page.click('#btn-register');
    
    await expect(page.locator('#reg-success')).toBeVisible({ timeout: 5000 });
  });

  test('should logout', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#l-username', 'admin');
    await page.fill('#l-password', 'admin123');
    await page.click('#btn-login');
    await expect(page.locator('#screen-app')).toBeVisible({ timeout: 5000 });
    
    await page.click('.logout-btn');
    await expect(page.locator('#screen-auth')).toBeVisible({ timeout: 5000 });
  });
});
