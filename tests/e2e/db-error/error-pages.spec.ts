import { test, expect, type Page } from '@playwright/test';

async function expectErrorPage(page: Page) {
  await expect(page.getByTestId('error-page')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Jokin meni pieleen' }),
  ).toBeVisible();
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.getByTestId('error-retry')).toHaveText('Yritä uudelleen');
  await expect(page.getByTestId('error-home-link')).toHaveAttribute(
    'href',
    '/',
  );
  // Next's built-in page prints a digest; ours must not.
  await expect(page.getByText(/digest/i)).toHaveCount(0);
}

test('home shows the error page when the database is down', async ({
  page,
}) => {
  await page.goto('/');
  await expectErrorPage(page);
});

test('event detail shows the error page when the database is down', async ({
  page,
}) => {
  await page.goto('/cnonexistent0000000000000');
  await expectErrorPage(page);
});

test('retry re-renders without a document request', async ({ page }) => {
  await page.goto('/');
  await expectErrorPage(page);

  const documentRequests: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'document')
      documentRequests.push(request.url());
  });
  await page.getByTestId('error-retry').click();
  // The DB is still down, so the error page comes back.
  await expectErrorPage(page);
  expect(documentRequests).toEqual([]);
});
