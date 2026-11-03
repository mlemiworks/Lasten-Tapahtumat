import React from 'react';
import type { ILLUSTRATION_IDS } from '@/src/lib/imgUrl';

/* ---------- Types ---------- */

export type IllustrationId = (typeof ILLUSTRATION_IDS)[number];

type IllustrationItem = {
  id: IllustrationId;
  label: string;
  palette: [string, string, string];
  render: (p: string[]) => React.ReactNode;
};

/* ---------- SVG renderers ---------- */

// Individual SVG render functions
const musicSvg = (p: string[]) => (
  <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
    <rect width="200" height="140" fill={p[2]} />
    <path
      d="M0 90 Q 50 70 100 90 T 200 90"
      stroke={p[1]}
      strokeWidth="3"
      fill="none"
    />
    <circle cx="45" cy="78" r="14" fill={p[0]} />
    <circle cx="105" cy="88" r="18" fill={p[0]} />
    <circle cx="160" cy="82" r="12" fill={p[0]} />
    <rect x="57" y="40" width="3" height="38" fill={p[1]} />
    <rect x="119" y="40" width="3" height="48" fill={p[1]} />
    <rect x="170" y="44" width="3" height="38" fill={p[1]} />
  </svg>
);

const sirkusSvg = (p: string[]) => (
  <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
    <rect width="200" height="140" fill={p[2]} />
    <path d="M100 20 L40 110 L160 110 Z" fill={p[0]} />
    <path d="M100 20 L100 110" stroke={p[2]} strokeWidth="3" />
    <path d="M70 65 L130 65" stroke={p[2]} strokeWidth="3" />
    <circle cx="100" cy="20" r="5" fill={p[1]} />
    <rect x="88" y="90" width="24" height="20" fill={p[1]} />
  </svg>
);

const taideSvg = (p: string[]) => (
  <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
    <rect width="200" height="140" fill={p[2]} />
    <ellipse cx="100" cy="75" rx="70" ry="48" fill={p[0]} />
    <circle cx="75" cy="60" r="9" fill={p[1]} />
    <circle cx="110" cy="55" r="9" fill="#fff" />
    <circle cx="135" cy="75" r="9" fill={p[1]} />
    <circle cx="80" cy="95" r="9" fill="#fff" />
    <path
      d="M150 30 L175 110"
      stroke={p[1]}
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

const luontoSvg = (p: string[]) => (
  <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
    <rect width="200" height="140" fill={p[2]} />
    <circle cx="160" cy="30" r="16" fill={p[1]} />
    <path d="M30 120 L55 60 L80 120 Z" fill={p[0]} />
    <path d="M85 120 L115 50 L145 120 Z" fill={p[0]} />
    <path d="M130 120 L155 70 L180 120 Z" fill={p[0]} />
    <rect x="0" y="118" width="200" height="22" fill={p[1]} opacity="0.5" />
  </svg>
);

const teatteriSvg = (p: string[]) => (
  <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
    <rect width="200" height="140" fill={p[2]} />
    <rect x="0" y="0" width="200" height="14" fill={p[1]} />
    <path d="M0 14 Q 25 60 0 140 L 60 140 Q 40 80 60 14 Z" fill={p[0]} />
    <path
      d="M200 14 Q 175 60 200 140 L 140 140 Q 160 80 140 14 Z"
      fill={p[0]}
    />
    <circle cx="100" cy="80" r="22" fill={p[1]} />
    <circle cx="92" cy="76" r="3" fill={p[2]} />
    <circle cx="108" cy="76" r="3" fill={p[2]} />
    <path
      d="M90 88 Q 100 96 110 88"
      stroke={p[2]}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const liikuntaSvg = (p: string[]) => (
  <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
    <rect width="200" height="140" fill={p[2]} />
    <circle cx="100" cy="75" r="45" fill={p[0]} />
    <path
      d="M55 75 Q 100 50 145 75"
      stroke={p[1]}
      strokeWidth="3"
      fill="none"
    />
    <path
      d="M55 75 Q 100 100 145 75"
      stroke={p[1]}
      strokeWidth="3"
      fill="none"
    />
    <path d="M100 30 L100 120" stroke={p[1]} strokeWidth="3" />
    <path d="M20 120 L 180 120" stroke={p[1]} strokeWidth="3" />
  </svg>
);

const saviSvg = (p: string[]) => (
  <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
    <rect width="200" height="140" fill={p[2]} />
    <path d="M70 50 Q 60 90 80 120 L 120 120 Q 140 90 130 50 Z" fill={p[0]} />
    <ellipse cx="100" cy="50" rx="30" ry="8" fill={p[1]} />
    <path
      d="M85 75 Q 100 82 115 75"
      stroke={p[1]}
      strokeWidth="2.5"
      fill="none"
    />
    <circle cx="40" cy="110" r="8" fill={p[1]} />
    <circle cx="160" cy="105" r="6" fill={p[1]} />
  </svg>
);

const pianoSvg = (p: string[]) => (
  <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
    <rect width="200" height="140" fill={p[2]} />
    <rect x="30" y="70" width="140" height="50" rx="6" fill={p[0]} />
    <rect x="40" y="80" width="12" height="32" fill="#fff" />
    <rect x="55" y="80" width="12" height="32" fill="#fff" />
    <rect x="70" y="80" width="12" height="32" fill="#fff" />
    <rect x="85" y="80" width="12" height="32" fill="#fff" />
    <rect x="100" y="80" width="12" height="32" fill="#fff" />
    <rect x="115" y="80" width="12" height="32" fill="#fff" />
    <rect x="130" y="80" width="12" height="32" fill="#fff" />
    <rect x="145" y="80" width="12" height="32" fill="#fff" />
    <circle cx="100" cy="40" r="10" fill={p[1]} />
  </svg>
);

const vesiSvg = (p: string[]) => (
  <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
    <rect width="200" height="140" fill={p[2]} />
    <path
      d="M0 90 Q 30 75 60 90 T 120 90 T 200 90 L 200 140 L 0 140 Z"
      fill={p[0]}
    />
    <path
      d="M0 105 Q 30 92 60 105 T 120 105 T 200 105 L 200 140 L 0 140 Z"
      fill={p[1]}
      opacity="0.65"
    />
    <circle cx="150" cy="40" r="14" fill={p[1]} />
  </svg>
);

/* ---------- Data ---------- */

export const illustrations: IllustrationItem[] = [
  {
    id: 'music',
    label: 'Musiikki',
    palette: ['#9ec5e8', '#f2c75c', '#e8efe6'],
    render: musicSvg,
  },
  {
    id: 'sirkus',
    label: 'Sirkus',
    palette: ['#e89f7a', '#f2c75c', '#fbf0e4'],
    render: sirkusSvg,
  },
  {
    id: 'taide',
    label: 'Taide',
    palette: ['#f2a65c', '#e8efe6', '#9ec5e8'],
    render: taideSvg,
  },
  {
    id: 'luonto',
    label: 'Luonto',
    palette: ['#a8d5ba', '#f2c75c', '#e8efe6'],
    render: luontoSvg,
  },
  {
    id: 'teatteri',
    label: 'Teatteri',
    palette: ['#e89f7a', '#9ec5e8', '#fbf0e4'],
    render: teatteriSvg,
  },
  {
    id: 'liikunta',
    label: 'Liikunta',
    palette: ['#f2c75c', '#a8d5ba', '#e8efe6'],
    render: liikuntaSvg,
  },
  {
    id: 'savi',
    label: 'Savi',
    palette: ['#e8efe6', '#f2a65c', '#9ec5e8'],
    render: saviSvg,
  },
  {
    id: 'piano',
    label: 'Piano',
    palette: ['#9ec5e8', '#e89f7a', '#fbf0e4'],
    render: pianoSvg,
  },
  {
    id: 'vesi',
    label: 'Vesi',
    palette: ['#a8d5ba', '#e8efe6', '#f2c75c'],
    render: vesiSvg,
  },
];

/* ---------- Single Illustration ---------- */

export function Illustration({
  id,
  className = '',
}: {
  id: IllustrationId;
  className?: string;
}) {
  const item = illustrations.find((x) => x.id === id);
  if (!item) return null;

  return (
    <div className={`w-full h-full ${className}`}>
      {item.render(item.palette)}
    </div>
  );
}

/* ---------- Selector Grid (like Pill but for picking) ---------- */

export function IllustrationPicker({
  value,
  onChange,
  className = '',
}: {
  // string instead of IllustrationId so callers can pass a plain form field
  // string without a cast — the comparison `value === item.id` still works.
  // Also accepts http/https URLs from the upload tab so that switching tabs
  // doesn't clear a previously selected illustration.
  value?: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  return (
    <div
      data-testid="illustration-picker"
      className={`grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-3 ${className}`}
    >
      {illustrations.map((item) => {
        const selected = value === item.id;

        return (
          <button
            key={item.id}
            type="button"
            data-testid={`illustration-option-${item.id}`}
            onClick={() => onChange(item.id)}
            className={`
              rounded-lg border-2 p-2 text-center transition
              ${selected ? 'border-primary shadow-sm' : 'border-transparent'}
              hover:scale-[1.03]
            `}
          >
            <div className="aspect-4/3 w-full">
              <Illustration id={item.id} />
            </div>

            <div className="mt-1 text-xs">{item.label}</div>
          </button>
        );
      })}
    </div>
  );
}
