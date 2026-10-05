'use client';

import Link from 'next/link';

// The error prop is ignored on purpose: visitors never see error details, and
// Next already logs the original server error in the server terminal.
export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <div
      data-testid="error-page"
      className="flex flex-1 flex-col items-center justify-center gap-4 bg-bg px-4 py-16 text-center"
    >
      <h1 className="text-3xl font-bold text-ink">Jokin meni pieleen</h1>
      <p className="max-w-md text-ink-soft">
        Sivua ei saatu juuri nyt ladattua. Yritä hetken päästä uudelleen.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* retry() re-fetches server data; reset() would re-render the cached error */}
        <button
          type="button"
          data-testid="error-retry"
          onClick={retry}
          className="rounded-pill bg-primary px-5 py-2 font-semibold text-primary-ink"
        >
          Yritä uudelleen
        </button>
        <Link
          href="/"
          data-testid="error-home-link"
          className="font-semibold text-ink underline"
        >
          Etusivulle
        </Link>
      </div>
    </div>
  );
}
