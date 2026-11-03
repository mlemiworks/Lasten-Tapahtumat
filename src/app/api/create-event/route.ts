import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { createEvent } from '@/src/lib/dataFetching';
import { CATEGORIES } from '@/src/lib/categories';
import { IMG_URL_ERROR, validImgUrl } from '@/src/lib/imgUrl';
import type { Category } from '@/src/types/types';

export async function POST(request: NextRequest) {
  // getServerSession reads the JWT cookie on the server to verify the user is
  // logged in — the middleware blocks the page, but API routes need their own check
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Kirjautuminen vaaditaan' }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    date?: string;
    time?: string;
    location?: string;
    description?: string;
    imgUrl?: string;
    category?: string;
    city?: string;
    age?: string;
    price?: string; // arrives as string from the form's number input
    lat?: number | null;
    lng?: number | null;
  };

  const { title, date } = body;
  if (!title?.trim() || !date?.trim()) {
    return NextResponse.json(
      { error: 'Otsikko ja päivämäärä ovat pakollisia' },
      { status: 400 },
    );
  }

  const imgUrl = validImgUrl(body.imgUrl);
  if (!imgUrl) {
    return NextResponse.json({ error: IMG_URL_ERROR }, { status: 400 });
  }

  // Validate category against the known list — reject anything outside it
  // Widened to string[] so .includes() accepts the plain string from the request body.
  // Without this, TypeScript infers Category[] and rejects string arguments.
  const validKeys: string[] = CATEGORIES.map((c) => c.key);
  const category: Category | undefined = validKeys.includes(body.category ?? '')
    ? (body.category as Category)
    : undefined;

  const event = await createEvent({
    title:       title.trim(),
    date:        date.trim(),
    time:        body.time?.trim() || null,
    location:    body.location?.trim() ?? '',
    description: body.description?.trim() || null,
    imgUrl,
    // category is validated above; default to '' if user skipped it
    category:    category ?? '',
    // city and age are optional in the form; store null when absent
    city:        body.city?.trim() ?? '',
    age:         body.age?.trim() || null,
    // price stays as a string — the DB stores it as String, not a number
    price:       body.price?.trim() || null,
    createdBy:   session.user.email,
    lat:         body.lat ?? null,
    lng:         body.lng ?? null,
  });

  return NextResponse.json({ id: event.id });
}
