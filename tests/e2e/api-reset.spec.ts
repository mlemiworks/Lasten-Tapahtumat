import { test, expect } from '@playwright/test';
import { RESET_TOKEN } from './env';

test('/api/reset returns 200 with the .env token', async ({ request }) => {
  const response = await request.post('/api/reset', {
    headers: { 'x-reset-token': RESET_TOKEN },
  });
  expect(response.status()).toBe(200);
});

test('/api/reset returns 401 with a wrong token', async ({ request }) => {
  const response = await request.post('/api/reset', {
    headers: { 'x-reset-token': `${RESET_TOKEN}-wrong` },
  });
  expect(response.status()).toBe(401);
});

test('/api/reset returns 401 without a token', async ({ request }) => {
  const response = await request.post('/api/reset');
  expect(response.status()).toBe(401);
});
