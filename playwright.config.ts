import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3010',
    trace: 'off',
    screenshot: 'only-on-failure',
    headless: true, // Headless for faster execution
    viewport: { width: 1280, height: 720 },
    actionTimeout: 8000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun run src/index.ts',
    url: 'http://localhost:3010',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
