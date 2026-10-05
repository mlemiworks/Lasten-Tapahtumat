'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Event } from '@/src/lib/dataFetching';
import { CATEGORY_BY_KEY } from '@/src/lib/categories';
import { Category } from '@/src/types/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

export default function AdminClient({ events }: { events: Event[] }) {
  const [q, setQ] = useState('');
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!q.trim()) return events;
    const lower = q.toLowerCase();
    return events.filter((e) =>
      [e.title, e.createdBy, e.city, e.location, e.category]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(lower)),
    );
  }, [events, q]);

  // id is a cuid string — do not wrap in Number()
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Poistetaanko tapahtuma "${title}"?`)) return;
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    // router.refresh() tells Next.js to re-run the server component above,
    // which re-fetches the event list from db.json
    if (res.ok) router.refresh();
  };

  return (
    <div>
      {/* Search */}
      <input
        data-testid="admin-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Etsi nimellä, järjestäjällä, kaupungilla..."
        className="w-full max-w-md rounded-xl border border-border bg-surface px-4 py-3 text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary mb-6"
      />

      <p className="text-sm text-ink-soft mb-4">
        {filtered.length} / {events.length} tapahtumaa
      </p>

      {/* Table */}
      <div className="bg-surface rounded-card border border-border shadow-(--shadow-card) overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-soft text-left">
              <Th>Nimi</Th>
              <Th>Kategoria</Th>
              <Th>Päivämäärä</Th>
              <Th>Kaupunki</Th>
              <Th>Hinta</Th>
              <Th>Järjestäjä</Th>
              <Th>Toiminnot</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-ink-soft">
                  Ei tuloksia.
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const cat = e.category
                  ? CATEGORY_BY_KEY[e.category as Category]
                  : null;
                return (
                  <tr
                    key={e.id}
                    data-testid="admin-event-row"
                    className="border-b border-border last:border-0 hover:bg-surface-soft/50"
                  >
                    <td className="px-4 py-3 font-medium text-ink max-w-[200px] truncate">
                      {e.title}
                    </td>
                    <td className="px-4 py-3">
                      {cat ? (
                        <span
                          className="rounded-pill px-2 py-0.5 text-xs font-bold whitespace-nowrap"
                          style={{ background: cat.color, color: cat.ink }}
                        >
                          {cat.name}
                        </span>
                      ) : (
                        <span className="text-ink-soft">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                      {formatDate(e.date)}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {e.city ?? e.location ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                      {e.price === '0'
                        ? 'Ilmainen'
                        : e.price != null
                          ? `${e.price} €`
                          : '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-soft max-w-[160px] truncate">
                      {e.createdBy ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${e.id}`}
                          className="text-primary-ink text-xs font-semibold hover:underline"
                        >
                          Näytä
                        </Link>
                        <span className="text-border">|</span>
                        <button
                          onClick={() => handleDelete(e.id, e.title)}
                          data-testid="admin-delete-button"
                          className="text-red-600 text-xs font-semibold hover:underline"
                        >
                          Poista
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Table header cell — local helper to keep the thead readable
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-bold text-ink-soft uppercase tracking-wide">
      {children}
    </th>
  );
}
