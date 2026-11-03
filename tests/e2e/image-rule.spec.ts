import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { test, expect } from '@playwright/test';
import {
  SEED_USER,
  deleteEvent,
  login,
  uniqueTitle,
  visibleTestId,
} from './helpers';
import { IMG_URL_ERROR, validImgUrl } from '../../src/lib/imgUrl';

// env.ts stays unchanged, so the public Supabase URL is read here.
const supabaseUrl = parseEnv(readFileSync('.env', 'utf8'))
  .NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing from .env');
process.env.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;

const BUCKET_URL = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/event-images/x.jpg`;
const VALID = ['music', '/testImages/reading.jpg', BUCKET_URL];
const INVALID: [string, unknown][] = [
  ['missing', undefined],
  ['empty', ''],
  ['whitespace', '   '],
  ['other host', 'https://example.com/a.jpg'],
  ['placehold.co', 'https://placehold.co/600x400'],
  ['unknown id', 'unknown'],
];

function body(title: string, imgUrl: unknown) {
  return { title, date: '2030-01-15', city: 'Helsinki', imgUrl };
}

test.describe('imgUrl rule in the APIs', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, SEED_USER.email, SEED_USER.password);
  });

  for (const [name, imgUrl] of INVALID) {
    test(`POST rejects ${name}`, async ({ page }) => {
      const title = uniqueTitle('E2E kuva POST');
      const res = await page.request.post('/api/create-event', {
        data: body(title, imgUrl),
      });
      expect(res.status()).toBe(400);
      expect(await res.json()).toEqual({ error: IMG_URL_ERROR });
    });
  }

  for (const imgUrl of VALID) {
    test(`POST accepts and stores ${imgUrl.slice(-20)}`, async ({ page }) => {
      const res = await page.request.post('/api/create-event', {
        // Padding checks that the trimmed value is stored.
        data: body(uniqueTitle('E2E kuva POST ok'), `  ${imgUrl}  `),
      });
      expect(res.status()).toBe(200);
      const { id } = (await res.json()) as { id: string };
      try {
        await page.goto(`/${id}`);
        const media = page.getByTestId('event-media');
        if (imgUrl.startsWith('/') || imgUrl.startsWith('http')) {
          await expect(media.locator('img:visible')).toHaveAttribute('src', imgUrl);
        } else {
          await expect(media.locator('svg:visible')).toHaveCount(1);
        }
      } finally {
        await deleteEvent(page, id);
      }
    });
  }

  test('PUT rejects invalid imgUrl and leaves the event unchanged', async ({
    page,
  }) => {
    const create = await page.request.post('/api/create-event', {
      data: body(uniqueTitle('E2E kuva PUT'), 'music'),
    });
    const { id } = (await create.json()) as { id: string };
    try {
      for (const [name, imgUrl] of INVALID) {
        const res = await page.request.put(`/api/events/${id}`, {
          data: body('muutettu', imgUrl),
        });
        expect(res.status(), name).toBe(400);
        expect(await res.json(), name).toEqual({ error: IMG_URL_ERROR });
      }
      await page.goto(`/${id}`);
      await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(
        'muutettu',
      );
    } finally {
      await deleteEvent(page, id);
    }
  });

  test('PUT accepts valid imgUrl and stores it', async ({ page }) => {
    const create = await page.request.post('/api/create-event', {
      data: body(uniqueTitle('E2E kuva PUT ok'), 'music'),
    });
    const { id } = (await create.json()) as { id: string };
    try {
      for (const imgUrl of VALID.slice().reverse()) {
        const res = await page.request.put(`/api/events/${id}`, {
          data: body('E2E kuva PUT ok', `  ${imgUrl}  `),
        });
        expect(res.status(), imgUrl).toBe(200);
      }
      await page.goto(`/${id}`);
      await expect(
        page.getByTestId('event-media').locator('svg:visible'),
      ).toHaveCount(1);
    } finally {
      await deleteEvent(page, id);
    }
  });
});

test('create form without an image shows the error and sends nothing', async ({
  page,
}) => {
  await login(page, SEED_USER.email, SEED_USER.password);
  let posts = 0;
  page.on('request', (req) => {
    if (req.url().includes('/api/create-event')) posts++;
  });
  await page.goto('/create-event');
  await page.getByTestId('event-title-input').fill(uniqueTitle('E2E kuva lomake'));
  await page.getByTestId('event-date-input').fill('2030-01-15');
  await visibleTestId(page, 'event-form-submit').click();
  await expect(visibleTestId(page, 'event-form-error')).toHaveText(IMG_URL_ERROR);
  expect(posts).toBe(0);
  await expect(page).toHaveURL(/\/create-event$/);
});

test('every seeded and reset imgUrl passes the rule', () => {
  const files = ['src/app/api/reset/route.ts', 'prisma/seed.ts'];
  let count = 0;
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/imgUrl:\s*'([^']*)'/g)) {
      count++;
      expect(validImgUrl(m[1]), `${file}: ${m[1]}`).toBe(m[1]);
    }
  }
  expect(count).toBe(18);
});
