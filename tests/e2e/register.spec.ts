import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('a password under 8 characters is rejected', async ({ page, request }) => {
  await page.goto('/register');
  await page.getByTestId('register-email').fill('short@example.com');
  await page.getByTestId('register-password').fill('short');
  await page.getByTestId('register-confirm').fill('short');
  await page.getByTestId('register-submit').click();
  await expect(page).toHaveURL(/\/register$/);
  expect(
    await page
      .getByTestId('register-password')
      .evaluate((el) => (el as HTMLInputElement).validity.tooShort),
  ).toBe(true);

  const response = await request.post('/api/register', {
    data: { email: 'short@example.com', password: 'short' },
  });
  expect(response.status()).toBe(400);
});

test('mismatching passwords show an error', async ({ page }) => {
  await page.goto('/register');
  await page.getByTestId('register-email').fill('mismatch@example.com');
  await page.getByTestId('register-password').fill('password123');
  await page.getByTestId('register-confirm').fill('password456');
  await page.getByTestId('register-submit').click();
  await expect(page.getByTestId('register-error')).toBeVisible();
});

test('register, then log in with the new account', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = 'password123';
  await page.goto('/register');
  await page.getByTestId('register-email').fill(email);
  await page.getByTestId('register-password').fill(password);
  await page.getByTestId('register-confirm').fill(password);
  await page.getByTestId('register-submit').click();
  await expect(page).toHaveURL(/\/$/);

  await login(page, email, password);
});
