import { Heart, Rows3, Smartphone } from 'lucide-react';
import type { Property } from '../../config/types';
import { href } from '../../lib/router';
import { COMPARE_LIMIT, useCompare, useFavorites } from '../../state/collections';
import { toast } from '../../state/toast';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { PrivateNotes } from './PrivateNotes';
import { ShareQr } from './ShareQr';

export function TrackTools({ property, onShare }: { property: Property; onShare: () => void }) {
  const favorites = useFavorites();
  const compare = useCompare();
  const saved = favorites.has(property.id);
  const comparing = compare.has(property.id);
  return (
    <section id="my-tools" aria-labelledby="tools-title" className="bg-linen py-16 md:py-24" data-print-hide>
      <div className="container-page">
        <SectionHeading
          id="tools-title"
          eyebrow="Your shortlist"
          title="Keep track of this home"
          intro={
            <p className="flex items-start gap-2 text-sm">
              <Smartphone aria-hidden className="mt-0.5 size-4 shrink-0 text-sage-strong" />
              Saved homes, comparisons and notes are stored only in this browser on this device. They don’t sync between devices.
            </p>
          }
        />
        <div className="grid gap-5 lg:grid-cols-3">
          <Reveal className="flex flex-col rounded-[1.5rem] bg-surface p-6 shadow-[var(--shadow-soft)]">
            <p className="font-semibold">Save &amp; compare</p>
            <p className="mt-2 text-sm text-muted">Build a shortlist and line up to {COMPARE_LIMIT} homes side by side.</p>
            <div className="mt-5 grid gap-2">
              <Button
                variant={saved ? 'primary' : 'secondary'}
                aria-pressed={saved}
                icon={<Heart aria-hidden className={`size-4 ${saved ? 'fill-white' : ''}`} />}
                onClick={() => toast(favorites.toggle(property.id) ? 'Saved to this device' : 'Removed from saved homes', 'success')}
              >
                {saved ? 'Saved' : 'Save this home'}
              </Button>
              <Button
                variant={comparing ? 'primary' : 'secondary'}
                aria-pressed={comparing}
                icon={<Rows3 aria-hidden className="size-4" />}
                onClick={() => {
                  const r = compare.toggle(property.id);
                  toast(r === 'full' ? `You can compare up to ${COMPARE_LIMIT} homes. Remove one first.` : r === 'added' ? 'Added to compare' : 'Removed from compare');
                }}
              >
                {comparing ? 'In compare list' : 'Add to compare'}
              </Button>
            </div>
            <div className="mt-auto flex gap-4 pt-5 text-sm font-semibold">
              <a href={href.saved()} className="text-sage-strong underline-offset-4 hover:underline">
                Saved ({favorites.ids.length})
              </a>
              <a href={href.compare()} className="text-sage-strong underline-offset-4 hover:underline">
                Compare ({compare.ids.length})
              </a>
            </div>
          </Reveal>
          <Reveal delay={80} className="rounded-[1.5rem] bg-surface p-6 shadow-[var(--shadow-soft)]">
            <PrivateNotes propertyId={property.id} propertyName={property.name} />
          </Reveal>
          <Reveal delay={160} className="rounded-[1.5rem] bg-surface p-6 shadow-[var(--shadow-soft)]">
            <ShareQr property={property} onShare={onShare} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
