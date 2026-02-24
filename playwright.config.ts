import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests sequentially to avoid rate limits
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to prevent concurrent requests
  timeout: 30000,
  expect: {
    timeout: 15000,
  },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'off',
    screenshot: 'off',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 8000,
    // Slow down tests to avoid rate limiting
    launchOptions: {
      slowMo: 100, // Slow down operations by 100ms
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
