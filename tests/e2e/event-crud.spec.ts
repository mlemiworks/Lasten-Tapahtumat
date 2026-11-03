import { test, expect } from '@playwright/test';
import {
  SEED_USER,
  deleteEvent,
  login,
  logout,
  uniqueTitle,
  visibleTestId,
} from './helpers';

test('log in, create, see in dashboard, edit, delete, log out', async ({
  page,
}) => {
  const title = uniqueTitle('E2E tapahtuma');
  const edited = `${title} muokattu`;
  let id: string | undefined;

  try {
    await login(page, SEED_USER.email, SEED_USER.password);

    await page.goto('/create-event');
    await page.getByTestId('event-title-input').fill(title);
    await page.getByTestId('event-date-input').fill('2030-01-15');
    await page.getByTestId('event-form-submit').click();
    await expect(page).toHaveURL(/\/c[a-z0-9]{20,}$/);
    id = new URL(page.url()).pathname.slice(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);

    await page.goto('/dashboard');
    // Dev streaming briefly leaves a hidden copy of the card, so count visible ones.
    await expect(
      page
        .locator('[data-testid="event-card"]:visible')
        .filter({ hasText: title }),
    ).toHaveCount(1);

    await page.goto(`/${id}`);
    await visibleTestId(page, 'event-edit-link').click();
    await expect(page).toHaveURL(`/${id}/edit`);
    await page.getByTestId('event-title-input').fill(edited);
    await page.getByTestId('event-form-submit').click();
    await expect(page).toHaveURL(`/${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(edited);

    page.once('dialog', (dialog) => dialog.accept());
    await visibleTestId(page, 'event-delete-button').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByTestId('event-card').filter({ hasText: title }),
    ).toHaveCount(0);
    id = undefined;

    await logout(page);
  } finally {
    if (id) await deleteEvent(page, id);
  }
});
