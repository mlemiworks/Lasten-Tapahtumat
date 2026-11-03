import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import {
  fetchEventById,
  deleteEvent,
  updateEvent,
} from '@/src/lib/dataFetching';
import { CATEGORIES } from '@/src/lib/categories';
import { IMG_URL_ERROR, validImgUrl } from '@/src/lib/imgUrl';
import { ADMIN_EMAIL } from '@/src/app/admin/page';

// Shared auth + ownership guard used by both DELETE and PUT
async function resolveEvent(params: Promise<{ id: string }>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: 'Kirjautuminen vaaditaan', status: 401 } as const;
  }

  const { id } = await params;

  // id is now a plain string (cuid) — no parseInt needed
  const event = await fetchEventById(id);
  if (!event) {
    return { error: 'Tapahtumaa ei löydy', status: 404 } as const;
  }

  const isAdmin = session.user.email === ADMIN_EMAIL;
  if (!isAdmin && event.createdBy !== session.user.email) {
    return {
      error: 'Ei oikeutta muokata tätä tapahtumaa',
      status: 403,
    } as const;
  }

  return { event, email: session.user.email };
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await resolveEvent(params);
  if ('error' in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  await deleteEvent(result.event.id);
  return NextResponse.json({ success: true });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await resolveEvent(params);
  if ('error' in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
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
    price?: string;
    lat?: number | null;
    lng?: number | null;
  };

  if (!body.title?.trim() || !body.date?.trim()) {
    return NextResponse.json(
      { error: 'Otsikko ja päivämäärä ovat pakollisia' },
      { status: 400 },
    );
  }

  const imgUrl = validImgUrl(body.imgUrl);
  if (!imgUrl) {
    return NextResponse.json({ error: IMG_URL_ERROR }, { status: 400 });
  }

  // 'as string[]' widens the type from Category[] to string[] so that
  // includes() accepts body.category which is typed as string | undefined
  const validKeys = CATEGORIES.map((c) => c.key) as string[];
  const category = validKeys.includes(body.category ?? '')
    ? body.category
    : undefined;

  // price is stored as a string in Prisma (e.g. "5€" or "Vapaa pääsy").
  // We pass it through as-is, or null if empty.
  const price = body.price?.trim() || null;

  const updated = await updateEvent(result.event.id, {
    title: body.title.trim(),
    date: body.date.trim(),
    time: body.time?.trim() ?? null,
    location: body.location?.trim() ?? '',
    description: body.description?.trim() ?? null,
    imgUrl,
    category,
    city: body.city?.trim() || undefined,
    age: body.age?.trim() || null,
    price,
    // undefined means "don't touch the existing value"; null means "clear it"
    lat: body.lat !== undefined ? body.lat : undefined,
    lng: body.lng !== undefined ? body.lng : undefined,
  });

  return NextResponse.json({ id: updated?.id });
}
