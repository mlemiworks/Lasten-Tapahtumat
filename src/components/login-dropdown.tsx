'use client';
import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import * as Popover from '@radix-ui/react-popover';

// open/onToggle/onClose are controlled by Header so that auth-gated nav links
// can open this dropdown from outside the component.
type Props = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  message?: string; // optional prompt shown when triggered by a protected nav link
  fullWidth?: boolean; // true in the mobile menu so the button fills the row like other nav items
};

export default function LoginDropdown({
  open,
  onToggle,
  onClose,
  message,
  fullWidth = false,
}: Props) {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // redirect: false prevents NextAuth from doing a full page redirect on
    // success — we handle the result ourselves and close the dropdown instead.
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError('Väärä sähköposti tai salasana');
    } else {
      onClose();
      setEmail('');
      setPassword('');
    }
  };

  if (status === 'loading') {
    return (
      <div
        className={`px-3.5 py-2 rounded-[18px] text-[15px] font-bold cursor-pointer border border-[rgb(158,197,232)] bg-[rgb(158,197,232)] text-[rgb(15,48,80)] opacity-40${fullWidth ? ' w-full' : ''}`}
      >
        Kirjaudu
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div
        className={`flex items-center gap-3${fullWidth ? ' w-full justify-between' : ''}`}
      >
        <span className="text-sm text-primary-ink/70 font-medium">
          {session.user?.email}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ redirect: false })}
          data-testid="logout-button"
          // text-primary-ink so it stays legible on the green header background
          className="text-primary-ink hover:bg-primary-ink/10"
        >
          Kirjaudu ulos
        </Button>
      </div>
    );
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(open) => (open ? onToggle() : onClose())}
    >
      <Popover.Trigger asChild>
        <button
          data-testid="login-button"
          className={`px-3.5 py-2 rounded-[18px] text-[15px] font-bold cursor-pointer border border-[rgb(158,197,232)] bg-[rgb(158,197,232)] text-[rgb(15,48,80)] transition-transform hover:brightness-105${fullWidth ? ' w-full' : ''}`}
        >
          Kirjaudu
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="bg-surface border border-border rounded-xl shadow-(--shadow-card-hover) p-5 w-72"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {message && (
              <p className="text-sm text-ink-soft">{message}</p>
            )}
            <Input
              type="email"
              placeholder="Sähköposti"
              data-testid="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Salasana"
              data-testid="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <Button
              type="submit"
              data-testid="login-submit"
              variant="primary"
              size="md"
              className="w-full"
            >
              Kirjaudu sisään
            </Button>
          </form>

          <p className="mt-4 text-xs text-ink-soft">
            Ei tiliä?{' '}
            <a href="/register" className="text-ink underline hover:opacity-70">
              Rekisteröidy
            </a>
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
