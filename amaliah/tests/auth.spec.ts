/**
 * ═══════════════════════════════════════════════════════
 * Authentication E2E Tests
 * ═══════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.locator('text=Buku Amaliah Ramadhan')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // User should be authenticated and see logout button
    await expect(page.locator('button:has-text("Keluar")')).toBeVisible({ timeout: 5000 });
  });

  test('should fail with invalid username', async ({ page }) => {
    await page.fill('#username', 'invaliduser');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    // Should show inline form error
    await expect(page.locator('.error-message')).toContainText('Username atau password salah');
  });

  test('should fail with invalid password', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show inline form error
    await expect(page.locator('.error-message')).toContainText('Username atau password salah');
  });

  test('should fail with empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Should show validation toast
    await expect(page.locator('.toast-content').first()).toContainText('wajib diisi');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('a[href="/register"]');
    
    await expect(page.locator('text=Daftar Akun Baru')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('button:has-text("Keluar")')).toBeVisible();
    
    // Logout
    await page.click('button:has-text("Keluar")');
    
    // Should redirect to login
    await expect(page.locator('text=Buku Amaliah Ramadhan')).toBeVisible();
  });
});
