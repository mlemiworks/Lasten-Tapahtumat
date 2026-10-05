import Link from 'next/link';
import type { Event } from '@/src/lib/dataFetching';
import { CATEGORY_BY_KEY } from '../lib/categories';
import { Illustration, type IllustrationId } from './ui/Illustrations';
import { Category } from '../types/types';

// toLocaleDateString with 'fi-FI' locale formats as "15. huhtikuuta" (Finnish long form)
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fi-FI', {
    day: 'numeric',
    month: 'long',
  });
}

const isValidUrl = (value?: string) => {
  if (!value) return false;
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/testImages')
  );
};

export default function EventCard({ event: _event }: { event: Event }) {
  // age is not yet in the generated Prisma client — cast so the type compiles
  // before the migration is run. Remove the cast after running the migration.
  const event = _event as Event & { age?: string | null };

  // Look up category metadata (name, color, ink) — null if the event has no category
  const cat = event.category
    ? CATEGORY_BY_KEY[event.category as Category]
    : null;

  return (
    // The whole card is a link — no nested <button> or <a> inside, which avoids
    // invalid HTML (interactive elements shouldn't be nested).
    // group enables child elements to react to the card's hover state via group-hover:
    <Link
      href={`/${event.id}`}
      data-testid="event-card"
      className="group flex flex-col bg-surface rounded-card border border-border shadow-(--shadow-card) overflow-hidden transition-shadow hover:shadow-(--shadow-card-hover)"
    >
      {/* Image area — tinted with the category color when no photo is present */}
      {/*
        overflow-hidden clips the absolutely-positioned image to the box.
        The img is absolute so it never contributes to this div's height;
        height comes solely from aspect-4/3, keeping cards consistent
        regardless of the photo's natural proportions (portrait vs landscape).
      */}
      <div
        className="aspect-4/3 w-full relative overflow-hidden"
        style={{ background: cat?.color ?? 'var(--color-surface-soft)' }}
      >
        {isValidUrl(event.imgUrl) ? (
          <img
            src={event.imgUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : event.imgUrl ? (
          <Illustration
            id={event.imgUrl as IllustrationId}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-5xl font-bold opacity-30">
            {event.title.charAt(0)}
          </div>
        )}

        {/* Category badge — positioned over the image, top-left */}
        {cat && (
          <span
            data-testid="event-category-badge"
            className="absolute top-3 left-3 rounded-pill px-3 py-1 text-xs font-bold"
            style={{ background: cat.color, color: cat.ink }}
          >
            {cat.name}
          </span>
        )}

        {/* "Ilmainen" badge — only shown when price is exactly 0, not when undefined */}
        {event.price === '0' && (
          <span className="absolute top-3 right-3 rounded-pill bg-accent text-accent-ink px-3 py-1 text-xs font-bold">
            Ilmainen
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-lg font-bold text-ink leading-tight mb-2">
          {event.title}
        </h3>

        {/* Date · city (or venue if city is missing) */}
        <div className="flex items-center gap-2 text-sm text-ink-soft mb-3">
          <span>{formatDate(event.date)}</span>
          <span>·</span>
          <span>{event.city ?? event.location}</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          {/* ?? '–' gives a dash when age is not set, keeping the row balanced */}
          <span className="text-xs text-ink-soft">Ikä {event.age ?? '–'}</span>
          <span className="text-sm font-semibold text-ink">
            {event.price === '0'
              ? 'Ilmainen'
              : event.price != null
                ? `${event.price} €`
                : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
