import { test, expect } from '@playwright/test';
import {
  SEED_USER,
  createEvent,
  deleteEvent,
  login,
  uniqueTitle,
  visibleTestId,
} from './helpers';

test.describe('browse events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('lists the 9 seeded events on page 1', async ({ page }) => {
    await expect(page.getByTestId('event-card')).toHaveCount(9);
  });

  test('search narrows the list by title', async ({ page }) => {
    await visibleTestId(page, 'event-search').fill('Tuhkimo');
    const cards = page.getByTestId('event-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText('Tuhkimo');
  });

  test('a search with no match shows the empty state', async ({ page }) => {
    await visibleTestId(page, 'event-search').fill('zzzz-ei-tapahtumaa');
    await expect(page.getByTestId('no-results')).toBeVisible();
    await expect(page.getByTestId('event-card')).toHaveCount(0);
  });

  test('city filter narrows the list', async ({ page }) => {
    await visibleTestId(page, 'city-filter').selectOption('Helsinki');
    const cards = page.getByTestId('event-card');
    await expect(cards).toHaveCount(2);
    for (const card of await cards.all()) {
      await expect(card).toContainText('Helsinki');
    }
  });

  test('category pill narrows the list', async ({ page }) => {
    await visibleTestId(page, 'category-pill-musiikki').click();
    await expect(page.getByTestId('event-card')).toHaveCount(1);
    await expect(page.getByTestId('event-category-badge')).toHaveText([
      'Musiikki',
    ]);
    await visibleTestId(page, 'category-pill-all').click();
    await expect(page.getByTestId('event-card')).toHaveCount(9);
  });

  test('a 10th event adds page 2', async ({ page }) => {
    await expect(page.getByTestId('page-button-2')).toHaveCount(0);
    await login(page, SEED_USER.email, SEED_USER.password);
    const id = await createEvent(page, uniqueTitle('E2E sivutus'));
    try {
      await page.goto('/');
      await visibleTestId(page, 'page-button-2').click();
      await expect(page.getByTestId('event-card')).toHaveCount(1);
    } finally {
      await deleteEvent(page, id);
    }
  });
});
