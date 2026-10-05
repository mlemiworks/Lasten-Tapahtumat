'use client';
import { useState } from 'react';
// Event now comes from Prisma (via dataFetching), not the old manual types.ts definition
import type { Event } from '@/src/lib/dataFetching';
import { CATEGORIES, CITIES } from '../lib/categories';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { IllustrationPicker } from './ui/Illustrations';
import { ImageUploader } from './ui/ImageUploader';
// Leaflet accesses `window` on import, so it can't run during SSR.
// dynamic with ssr:false defers the import to the browser only.
import dynamic from 'next/dynamic';
const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false });

// All form values are kept as strings because HTML inputs always return strings.
// The caller's onSubmit receives this shape and converts price → number before the API call.
export type FormFields = {
  title: string;
  category: string;
  city: string;
  date: string;
  time: string;
  price: string; // empty string = not set; "0" = free
  age: string;
  location: string;
  description: string;
  imgUrl: string;
  lat: number | null;
  lng: number | null;
};

const EMPTY: FormFields = {
  title: '',
  category: '',
  city: '',
  date: '',
  time: '',
  price: '',
  age: '',
  location: '',
  description: '',
  imgUrl: '',
  lat: null,
  lng: null,
};

// Converts an existing Event to the string-based FormFields shape for pre-filling the edit form.
// Prisma returns nullable fields as string | null; FormFields uses plain strings,
// so we ?? '' to convert null → empty string.
export function eventToFormFields(event: Event): FormFields {
  // age is not yet in the generated Prisma client — cast so the type compiles
  // before the migration is run. Remove the cast after running the migration.
  const e = event as Event & { age?: string | null };
  return {
    title: e.title,
    category: e.category ?? '',
    city: e.city ?? '',
    date: e.date,
    time: e.time ?? '',          // time is string | null in Prisma
    price: e.price != null ? String(e.price) : '',
    age: e.age ?? '',
    location: e.location,
    description: e.description ?? '',   // description is string | null in Prisma
    imgUrl: e.imgUrl,
    lat: e.lat ?? null,
    lng: e.lng ?? null,
  };
}

export default function EventForm({
  initial,
  onSubmit,
  submitLabel = 'Tallenna',
}: {
  initial?: Partial<FormFields>;
  // The caller handles the actual API call; throwing with an Error message displays it below the form.
  onSubmit: (fields: FormFields) => Promise<void>;
  submitLabel?: string;
}) {
  const [fields, setFields] = useState<FormFields>({ ...EMPTY, ...initial });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Determine the starting tab from the existing imgUrl.
  // If the event already has a real image URL (https://...) we open on "Oma kuva"
  // so the user sees their image straight away when editing.
  // useState with an initializer function (lazy init) avoids recomputing on every render.
  const [imageTab, setImageTab] = useState<'illustrations' | 'upload'>(() => {
    const url = initial?.imgUrl ?? '';
    return url.startsWith('http://') || url.startsWith('https://')
      ? 'upload'
      : 'illustrations';
  });

  // Generic field updater — avoids a separate useState + handler for every field.
  // The union event type is intentionally wide so it's compatible with Input,
  // Select, and Textarea without needing three separate helpers.
  const set =
    (key: keyof FormFields) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(fields);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Jokin meni pieleen. Yritä uudelleen.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {/* Title — full width */}
      <Field label="Otsikko" required>
        <Input
          value={fields.title}
          onChange={set('title')}
          required
          placeholder="Tapahtuman nimi"
          data-testid="event-title-input"
        />
      </Field>

      {/* Category + city — two columns */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Kategoria">
          <Select value={fields.category} onChange={set('category')}>
            <option value="">Valitse kategoria</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Kaupunki">
          <Select value={fields.city} onChange={set('city')}>
            <option value="">Valitse kaupunki</option>
            {CITIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {/* Location picker — shown when a city is selected */}
      {fields.city && (
        <Field label="Sijainti kartalla">
          <LocationPicker
            city={fields.city}
            initialLat={fields.lat ?? undefined}
            initialLng={fields.lng ?? undefined}
            onLocationPick={(lat: number, lng: number) =>
              setFields((prev) => ({ ...prev, lat, lng }))
            }
          />
        </Field>
      )}

      {/* Date + time + price — three columns */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Päivämäärä" required>
          <Input
            type="date"
            data-testid="event-date-input"
            value={fields.date}
            onChange={set('date')}
            required
          />
        </Field>
        <Field label="Kellonaika">
          <Input
            value={fields.time}
            onChange={set('time')}
            placeholder="10:00 – 12:00"
          />
        </Field>
        <Field label="Hinta (€)">
          <Input
            type="number"
            value={fields.price}
            onChange={set('price')}
            min="0"
            step="0.5"
            placeholder="0 = ilmainen"
          />
        </Field>
      </div>

      {/* Age recommendation — full width */}
      <Field label="Ikäsuositus">
        <Input
          value={fields.age}
          onChange={set('age')}
          placeholder="esim. 3–8 v"
        />
      </Field>

      {/* Venue name — full width */}
      <Field label="Tapahtumapaikka">
        <Input
          value={fields.location}
          onChange={set('location')}
          placeholder="esim. Kulttuurikeskus Stoa"
        />
      </Field>

      {/* Description — full width */}
      <Field label="Kuvaus">
        <Textarea
          rows={4}
          value={fields.description}
          onChange={set('description')}
          placeholder="Kerro tapahtumasta..."
        />
      </Field>

      {/* Image picker — two tabs: pre-made illustrations or own uploaded photo */}
      <Field label="Valitse kuvitus">
        {/* Tab bar — plain buttons styled as pills, matching the design tokens */}
        <div className="flex gap-2 mb-3" role="tablist" data-testid="image-tab-bar">
          <button
            type="button"
            role="tab"
            aria-selected={imageTab === 'illustrations'}
            data-testid="image-tab-illustrations"
            onClick={() => setImageTab('illustrations')}
            // bg-primary on the active tab; ghost style on the inactive one
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
              imageTab === 'illustrations'
                ? 'bg-primary text-primary-ink'
                : 'text-ink-soft hover:bg-surface-soft'
            }`}
          >
            Kuvitukset
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={imageTab === 'upload'}
            data-testid="image-tab-upload"
            onClick={() => setImageTab('upload')}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
              imageTab === 'upload'
                ? 'bg-primary text-primary-ink'
                : 'text-ink-soft hover:bg-surface-soft'
            }`}
          >
            Oma kuva
          </button>
        </div>

        {imageTab === 'illustrations' ? (
          <IllustrationPicker
            value={fields.imgUrl}
            // setFields directly — avoids constructing a fake React.ChangeEvent
            // that `set()` would expect but TypeScript would reject.
            onChange={(val) => setFields((prev) => ({ ...prev, imgUrl: val }))}
          />
        ) : (
          <ImageUploader
            // Pass the current imgUrl only when it is a real https:// URL.
            // An illustration ID would break the <img> src, so we omit it.
            currentUrl={
              fields.imgUrl.startsWith('https://') || fields.imgUrl.startsWith('http://')
                ? fields.imgUrl
                : undefined
            }
            onUpload={(url) => setFields((prev) => ({ ...prev, imgUrl: url }))}
          />
        )}
      </Field>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button
        type="submit"
        data-testid="event-form-submit"
        size="lg"
        disabled={loading}
        className="w-full mt-2"
      >
        {loading ? 'Tallennetaan...' : submitLabel}
      </Button>
    </form>
  );
}

// Label + optional hint wrapper — used only inside this file
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
