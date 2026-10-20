import { useContactActions } from '../contact/ContactActions';
import { ActionControl } from '../contact/ContactActions';

/** Sticky contact actions on phones and tablets. */
export function MobileContactBar({ propertyId }: { propertyId?: string }) {
  const actions = useContactActions(propertyId);
  const secondary = actions.filter((a) => a.key === 'call' || a.key === 'text').slice(0, 2);
  const fallback = secondary.length ? secondary : actions.filter((a) => a.key === 'email' || a.key === 'ask').slice(0, 2);
  const tour = actions.find((a) => a.key === 'schedule')!;
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pt-2.5 backdrop-blur-lg lg:hidden" data-print-hide>
      <div className="container-page flex items-center gap-2">
        {fallback.map((a) => (
          <ActionControl
            key={a.key}
            action={a}
            className="flex h-12 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border border-line bg-surface text-[0.7rem] font-semibold text-ink active:bg-linen"
          />
        ))}
        <ActionControl action={tour} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-sage-strong px-4 text-[0.95rem] font-semibold text-white shadow-[var(--shadow-soft)] active:brightness-110" />
      </div>
    </div>
  );
}
