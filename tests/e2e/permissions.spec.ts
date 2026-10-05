import { test, expect } from '@playwright/test';
import {
  SEED_USER,
  createEvent,
  deleteEvent,
  login,
  uniqueTitle,
} from './helpers';

test('a non-owner gets 403 on PUT and DELETE', async ({
  page,
  browser,
  baseURL,
}) => {
  await login(page, SEED_USER.email, SEED_USER.password);
  const id = await createEvent(page, uniqueTitle('E2E oikeudet'));

  // browser.newContext() ignores the config's baseURL, so pass it. A separate context keeps the second user's session apart from the owner's.
  const context = await browser.newContext({ baseURL });
  try {
    const other = await context.newPage();
    const email = `e2e-other-${Date.now()}@example.com`;
    const register = await other.request.post('/api/register', {
      data: { email, password: 'password123' },
    });
    expect(register.status()).toBe(200);
    await login(other, email, 'password123');

    const put = await other.request.put(`/api/events/${id}`, {
      data: { title: 'kaapattu', date: '2030-01-15' },
    });
    expect(put.status()).toBe(403);
    const del = await other.request.delete(`/api/events/${id}`);
    expect(del.status()).toBe(403);
  } finally {
    await context.close();
    await deleteEvent(page, id);
  }
});
