'use client';

// global-error replaces the root layout, so it gets no global styles unless it imports them.
import './globals.css';

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="fi">
      <body>
        <title>Virhe – Lasten tapahtumat</title>
        <main
          data-testid="error-page"
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 py-16 text-center"
        >
          <h1 className="text-3xl font-bold text-ink">Jokin meni pieleen</h1>
          <p className="max-w-md text-ink-soft">
            Sivua ei saatu juuri nyt ladattua. Yritä hetken päästä uudelleen.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              data-testid="error-retry"
              onClick={retry}
              className="rounded-pill bg-primary px-5 py-2 font-semibold text-primary-ink"
            >
              Yritä uudelleen
            </button>
            {/* Plain <a>: the client router may be what failed */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              data-testid="error-home-link"
              className="font-semibold text-ink underline"
            >
              Etusivulle
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
