import { expect, type Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kirjaudu', exact: true }).click();
  await page.getByPlaceholder('Sähköposti').fill(email);
  await page.getByPlaceholder('Salasana').fill(password);
  await page.getByRole('button', { name: 'Kirjaudu sisään' }).click();
  await expect(page.getByText(email)).toBeVisible();
}

export const SEED_USER = { email: 'testi@example.com', password: 'testi123' };
export const ADMIN_EMAIL = 'admin@example.fi';

export async function logout(page: Page) {
  await page.getByTestId('logout-button').click();
  await expect(page.getByTestId('login-button')).toBeVisible();
}

// Uses the browser context's session cookie, so call it after login().
export async function createEvent(
  page: Page,
  title: string,
  extra: Record<string, unknown> = {},
): Promise<string> {
  const response = await page.request.post('/api/create-event', {
    data: { title, date: '2030-01-15', city: 'Helsinki', ...extra },
  });
  expect(response.status()).toBe(200);
  const { id } = (await response.json()) as { id: string };
  return id;
}

export async function deleteEvent(page: Page, id: string) {
  await page.request.delete(`/api/events/${id}`);
}

// Dev-mode streaming briefly leaves a hidden copy of server-rendered content,
// so getByTestId alone can hit strict-mode violations right after a navigation.
export function visibleTestId(page: Page, id: string) {
  return page.locator(`[data-testid="${id}"]:visible`);
}

export function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

// Event detail links are /<cuid>; other internal links (/create-event) don't match.
export async function eventLinkCount(page: Page): Promise<number> {
  return page
    .locator('a')
    .evaluateAll(
      (links) =>
        links.filter((a) =>
          /^\/c[a-z0-9]{20,}$/.test(
            new URL((a as HTMLAnchorElement).href).pathname,
          ),
        ).length,
    );
}
