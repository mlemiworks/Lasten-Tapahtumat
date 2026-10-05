import { test, expect } from '@playwright/test';
import { eventLinkCount } from './helpers';

// Roles and text only: these pin today's markup before S3 adds testids.

test('home lists the 9 seeded events', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => eventLinkCount(page)).toBe(9);
});

test('an event detail page has a heading', async ({ page }) => {
  await page.goto('/');
  await page
    .locator('a[href^="/c"]:not([href="/create-event"])')
    .first()
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('login popover shows email and password fields', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kirjaudu', exact: true }).click();
  await expect(page.getByPlaceholder('Sähköposti')).toBeVisible();
  await expect(page.getByPlaceholder('Salasana')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Kirjaudu sisään' }),
  ).toBeVisible();
});

test('register page shows the form', async ({ page }) => {
  await page.goto('/register');
  await expect(
    page.getByRole('heading', { name: 'Rekisteröidy' }),
  ).toBeVisible();
  await expect(page.getByLabel('Sähköposti')).toBeVisible();
  await expect(page.getByLabel('Salasana', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Vahvista salasana')).toBeVisible();
});

test('/admin redirects a visitor to the home page', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/localhost:3100\/(\?.*)?$/);
});
