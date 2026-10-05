'use client';
// useSession reads the current auth state from browser-side React context,
// which is why this must be a client component rather than a server component.
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';

type Props = {
  // IDs are now cuid strings from Prisma, not numbers
  eventId: string;
  createdBy?: string | null;
};

export default function EventActions({ eventId, createdBy }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Haluatko varmasti poistaa tämän tapahtuman?')) return;
    const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    // Navigate home after deletion so the user doesn't land on a 404
    if (res.ok) router.push('/');
  };

  const email = session?.user?.email;
  const isOwner = email && email === createdBy;
  const isAdmin = email === 'admin@example.fi';

  if (!isOwner && !isAdmin) return null;

  return (
    <div className="flex gap-3">
      {isOwner && (
        <Link
          href={`/${eventId}/edit`}
          data-testid="event-edit-link"
          className="rounded-full font-semibold transition-colors bg-surface-soft text-ink hover:bg-border px-4 py-2 text-base"
        >
          Muokkaa
        </Link>
      )}
      <Button
        variant="danger"
        size="md"
        onClick={handleDelete}
        data-testid="event-delete-button"
      >
        Poista
      </Button>
    </div>
  );
}
