import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, PORT } from './tests/e2e/env';

// Port 1 refuses the connection at once, so pages fail without a connect timeout.
const BROKEN_DATABASE_URL = 'postgresql://e2e:e2e@127.0.0.1:1/e2e';

export default defineConfig({
  testDir: 'tests/e2e/db-error',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  forbidOnly: true,
  reporter: [['list']],
  use: { baseURL: BASE_URL, trace: 'off', ...devices['Desktop Chrome'] },
  webServer: {
    command: `npx next dev --port ${PORT}`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { DATABASE_URL: BROKEN_DATABASE_URL },
  },
});
