'use client';
// Registration requires form state and user interaction, so this must be a
// client component. There's no server-side auth check here — anyone can register.
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check passwords match client-side to give instant feedback without a round-trip
    if (password !== confirm) {
      setError('Salasanat eivät täsmää');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      // TypeScript: cast the response so the compiler knows what shape to expect
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Rekisteröinti epäonnistui');
      } else {
        // Go home after registration — the user can log in from the nav dropdown
        router.push('/');
      }
    } catch {
      setError('Jokin meni pieleen. Yritä uudelleen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Rekisteröidy
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-700">
              Sähköposti
            </label>
            <input
              id="email"
              data-testid="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-700">
              Salasana
            </label>
            <input
              id="password"
              data-testid="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="confirm" className="text-sm text-gray-700">
              Vahvista salasana
            </label>
            <input
              id="confirm"
              data-testid="register-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
            />
          </div>
          {error && (
            <p data-testid="register-error" className="text-red-500 text-sm">
              {error}
            </p>
          )}
          {/* Remind the user what they're consenting to before they submit */}
          <p className="text-xs text-gray-500 leading-relaxed">
            Tämä on portfoliodemosivusto. Rekisteröitymällä hyväksyt, että
            tallennamme sähköpostiosoitteesi, salatun salasanasi ja luomasi
            tapahtumat demon toimivuuden osoittamiseksi.{' '}
            <strong>Kaikki tiedot poistetaan automaattisesti 6 tunnin välein.</strong>{' '}
            Lisätietoja sivun alaosan tietosuojaosiosta.
          </p>
          <button
            type="submit"
            data-testid="register-submit"
            disabled={loading}
            className="bg-gray-900 text-white rounded px-4 py-2 hover:opacity-80 disabled:opacity-50"
          >
            {loading ? 'Rekisteröidään...' : 'Rekisteröidy'}
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-600">
          Onko sinulla jo tili?{' '}
          <a href="/" className="underline hover:opacity-70">
            Kirjaudu etusivulla
          </a>
        </p>
      </div>
    </div>
  );
}
