import { test, expect } from '@playwright/test';

const WALI_USER = {
  id: 3,
  name: 'wali7A',
  username: 'wali7A',
  role: 'wali_kelas',
  kelas: '7A',
  verified: 1,
};

test.describe('Wali Kelas - Cek Paraf Summary Ibadah', () => {
  test('menampilkan detail summary ibadah lengkap per siswa', async ({ page }) => {
    const uniqueTag = String(Date.now());

    const summaryPayload = {
      summary: [
        {
          id: 4,
          name: 'siswa7A',
          username: 'siswa7A',
          kelas: '7A',
          day: 1,
          has_data: true,
          parent_verified: 1,
          parent_name: 'Orang Tua Test',
          parent_signature: 'data:image/png;base64,iVBORw0KGgo=',
          parent_verified_at: '2026-02-27T12:00:00.000Z',
          pages: 7,
          checks: {
            subuh: true,
            dzuhur: false,
            ashar: true,
            maghrib: true,
            isya: false,
            sahur: true,
            buka: true,
            tarawih: true,
            witir: false,
            duha: false,
            tahajud: false,
            rawatib: false,
            tadarus: true,
            hafalan: false,
            dzikir: true,
            infaq: true,
            puasa: true,
            menahan: false,
            tilawatquran: false,
            berbakti: true,
          },
          catatan: `Catatan test summary ${uniqueTag}`,
          tema_tarawih: `Tema tarawih ${uniqueTag}`,
          tema_kultum_subuh: `Tema kultum ${uniqueTag}`,
          verification_status: 'verified',
        },
      ],
    };

    await page.addInitScript(({ user, payload }) => {
      localStorage.setItem('rm_token', 'mock-token-wali');
      localStorage.setItem('rm_user', JSON.stringify(user));
      window.APP_CONFIG = { API: 'http://127.0.0.1:3010/api' };
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        if (url.includes('/wali/verification-summary')) {
          return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return originalFetch(input, init);
      };
    }, { user: WALI_USER, payload: summaryPayload });

    await page.goto('http://127.0.0.1:3010/');
    await page.click('button:has-text("📝 Cek Paraf")');

    await expect(page.locator('text=📝 Cek Paraf Orang Tua Per Hari')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("▶️ Lihat Detail Ibadah")');
    await expect(page.locator(`text=Catatan test summary ${uniqueTag}`)).toBeVisible({ timeout: 10000 });

    await expect(page.locator('text=📊 Ringkasan Ibadah')).toBeVisible();
    await expect(page.locator('text=✅ 11/20 ibadah')).toBeVisible();
    await expect(page.locator("text=📖 7 halaman Qur'an")).toBeVisible();

    await expect(page.locator('text=✅ Sholat Subuh (Berjamaah)')).toBeVisible();
    await expect(page.locator('text=⬜ Sholat Dzuhur')).toBeVisible();
    await expect(page.locator(`text=🕌 Tema Tarawih: Tema tarawih ${uniqueTag}`)).toBeVisible();
    await expect(page.locator(`text=🌅 Tema Kultum Subuh: Tema kultum ${uniqueTag}`)).toBeVisible();
    await expect(page.locator('text=👤 Orang Tua Test')).toBeVisible();
  });
});
