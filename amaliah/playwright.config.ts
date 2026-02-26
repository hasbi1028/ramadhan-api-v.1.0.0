import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { 
		command: 'npm run dev -- --port 4179 --strictPort',
		port: 4179,
		timeout: 30000,
		reuseExistingServer: false
	},
	testDir: './tests',
	fullyParallel: false,
	workers: 1,
	timeout: 30000,
	use: {
		headless: true,
		viewport: { width: 1280, height: 720 },
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure'
	}
});
