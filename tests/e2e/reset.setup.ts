import { test as setup, expect } from '@playwright/test';
import { RESET_TOKEN } from './env';

setup('reset the dev database to the seed', async ({ request }) => {
  const response = await request.post('/api/reset', {
    headers: { 'x-reset-token': RESET_TOKEN },
  });
  expect(response.status()).toBe(200);
});
