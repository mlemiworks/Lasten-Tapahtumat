import { test, expect, type Page } from '@playwright/test';

async function openEvent(page: Page, title: string) {
  await page.goto('/');
  await page.getByTestId('event-card').filter({ hasText: title }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
}

test('event details show the title and a test image', async ({ page }) => {
  await openEvent(page, 'Lasten kasvomaalaus');
  await expect(page.getByTestId('event-image')).toBeVisible();
  await expect(page.getByTestId('event-image')).toHaveAttribute(
    'src',
    /\/testImages\//,
  );
});

test('an illustration renders when imgUrl is an illustration id', async ({
  page,
}) => {
  await openEvent(page, 'Perhekonsertti: Eläinten karnevaalit');
  await expect(page.getByTestId('event-image')).toHaveCount(0);
  await expect(page.getByTestId('event-media').locator('svg')).toBeVisible();
});

test('an event with lat/lng shows the map container', async ({ page }) => {
  await openEvent(page, 'Lukuhetki perheille: Sadut heräävät eloon');
  await expect(page.getByTestId('event-map')).toBeVisible();
});

test('an event without lat/lng shows no map', async ({ page }) => {
  await openEvent(page, 'Lasten kasvomaalaus');
  await expect(page.getByTestId('event-map')).toHaveCount(0);
});
