import { test, expect } from '@playwright/test';
import { E2E_ADMIN_PASSWORD } from './env';
import {
  ADMIN_EMAIL,
  SEED_USER,
  createEvent,
  deleteEvent,
  login,
  logout,
  visibleTestId,
  uniqueTitle,
} from './helpers';

test('a non-admin is redirected from /admin', async ({ page }) => {
  await login(page, SEED_USER.email, SEED_USER.password);
  await page.goto('/admin');
  await expect(page).toHaveURL(/localhost:\d+\/(\?.*)?$/);
});

test('admin panel search and delete', async ({ page }) => {
  expect(E2E_ADMIN_PASSWORD, 'E2E_ADMIN_PASSWORD in .env').toBeTruthy();
  const title = uniqueTitle('E2E hallinta');

  await login(page, SEED_USER.email, SEED_USER.password);
  const id = await createEvent(page, title);
  await logout(page);

  try {
    await login(page, ADMIN_EMAIL, E2E_ADMIN_PASSWORD!);
    await page.goto('/admin');
    await expect(visibleTestId(page, 'admin-event-row')).toHaveCount(10);

    await visibleTestId(page, 'admin-search').fill(title);
    const rows = visibleTestId(page, 'admin-event-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(title);

    page.once('dialog', (dialog) => dialog.accept());
    await rows.first().getByTestId('admin-delete-button').click();
    await expect(visibleTestId(page, 'admin-event-row')).toHaveCount(0);
  } finally {
    await deleteEvent(page, id);
  }
});
