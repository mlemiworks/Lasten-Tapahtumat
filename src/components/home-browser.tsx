'use client';
import { useMemo, useState } from 'react';
import type { Category } from '../types/types';
import type { Event } from '../lib/dataFetching';
import EventCard from './eventCard';
import { CATEGORIES, CITIES } from '../lib/categories';

const PAGE_SIZE = 9;

export default function HomeBrowser({ events }: { events: Event[] }) {
  const [q, setQ] = useState(''); // search query
  const [city, setCity] = useState('');
  const [cat, setCat] = useState<Category | ''>('');
  const [page, setPage] = useState(1);

  // what is usememo and how does it work:
  // Recalculate the filtered event list only when events, q, city, or cat change.
  // Not when user does something unrelated like switch page or hover over a card.
  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (cat && e.category !== cat) return false;
        if (city && e.city !== city) return false;
        if (q && !`${e.title} `.toLowerCase().includes(q.toLowerCase()))
          return false;
        return true;
      }),
    [events, q, city, cat],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* HERO + SEARCH ROW — card-style wrapper */}
      <div
        style={{
          background: 'rgb(255, 255, 255)',
          borderRadius: '28px',
          border: '1px solid rgb(221, 229, 217)',
          boxShadow: 'rgba(40, 60, 50, 0.1) 0px 6px 24px',
          padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div className="flex-[1_1_320px]">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink leading-[1.05] tracking-tight">
            Lapsille, perheille,
            <br />
            joka viikolle.
          </h1>
          <p className="text-ink-soft mt-3 max-w-md">
            Selaa lähialueesi lasten tapahtumia — musiikkia, leikkiä,
            askartelua, liikuntaa.
          </p>
        </div>
        <div className="flex gap-2 flex-[2_1_420px] min-w-[300px]">
          <div className="relative flex-[2]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">
              🔍
            </span>
            <input
              data-testid="event-search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Etsi nimellä, paikalla..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 pl-10 placeholder:text-ink-soft focus:outline-none focus:border-primary"
            />
          </div>
          <select
            data-testid="city-filter"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-ink focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="">Kaikki kaupungit</option>
            {CITIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CATEGORY CHIPS */}
      <div className="flex flex-wrap gap-2 mb-8">
        {/* "Kaikki" is selected when no category filter is active */}
        <button
          data-testid="category-pill-all"
          onClick={() => {
            setCat('');
            setPage(1);
          }}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors border ${
            cat === ''
              ? 'bg-ink text-bg border-ink'
              : 'bg-white text-ink border-border hover:bg-surface-soft'
          }`}
        >
          Kaikki
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            data-testid={`category-pill-${c.key}`}
            onClick={() => {
              setCat(c.key === cat ? '' : c.key);
              setPage(1);
            }}
            // Only apply category color when this chip is selected;
            // unselected chips get a plain white look via className
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              cat === c.key
                ? ''
                : 'bg-white text-ink border border-border hover:bg-surface-soft'
            }`}
            style={
              cat === c.key ? { background: c.color, color: c.ink } : undefined
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* RESULTS */}
      {filtered.length === 0 ? (
        <div
          data-testid="no-results"
          className="rounded-2xl border border-border bg-surface p-16 text-center"
        >
          <div className="font-display text-2xl text-ink mb-2">Ei tuloksia</div>
          <div className="text-ink-soft">
            Kokeile toista hakusanaa tai tyhjennä suodattimet.
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
            {pageItems.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  data-testid={`page-button-${i + 1}`}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-full font-semibold transition-colors ${
                    page === i + 1
                      ? 'bg-ink text-bg'
                      : 'bg-surface text-ink hover:bg-surface-soft'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
