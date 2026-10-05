import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, DATABASE_URL, PORT, RESET_TOKEN } from './tests/e2e/env';

export default defineConfig({
  testDir: 'tests/e2e',
  testIgnore: 'db-error/**',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  forbidOnly: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  // Trace is off: it would record typed passwords.
  use: { baseURL: BASE_URL, trace: 'off' },
  webServer: {
    command: `npx next dev --port ${PORT}`,
    // A port (TCP) probe sends no HTTP request to a server we did not start.
    port: PORT,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { DATABASE_URL, RESET_TOKEN },
  },
  projects: [
    { name: 'setup', testMatch: /reset\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testMatch: /.*\.spec\.ts/,
    },
  ],
});
