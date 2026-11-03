export const ILLUSTRATION_IDS = [
  'music',
  'sirkus',
  'taide',
  'luonto',
  'teatteri',
  'liikunta',
  'savi',
  'piano',
  'vesi',
] as const;

export const IMG_URL_ERROR = 'Valitse kuvitus tai lataa oma kuva';

const TEST_IMAGES_PREFIX = '/testImages/';

// Next inlines only literal process.env.NEXT_PUBLIC_* reads in the client bundle,
// so the variable is read as a literal expression, not through a helper.
function bucketPrefix(): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  return base ? `${base}/storage/v1/object/public/event-images/` : null;
}

// Returns the trimmed value if it is allowed, otherwise null.
export function validImgUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if ((ILLUSTRATION_IDS as readonly string[]).includes(v)) return v;
  for (const prefix of [TEST_IMAGES_PREFIX, bucketPrefix()]) {
    if (prefix && v.startsWith(prefix) && v.length > prefix.length) return v;
  }
  return null;
}
