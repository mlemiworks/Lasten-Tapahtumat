import { expect, type Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kirjaudu', exact: true }).click();
  await page.getByPlaceholder('Sähköposti').fill(email);
  await page.getByPlaceholder('Salasana').fill(password);
  await page.getByRole('button', { name: 'Kirjaudu sisään' }).click();
  await expect(page.getByText(email)).toBeVisible();
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
