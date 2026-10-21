import { useEffect, useId, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { storageAvailable } from '../../lib/storage';
import { formatTimeShort } from '../../lib/format';
import { NOTE_LIMIT, useNotes } from '../../state/collections';

/** Private notes saved only in this browser on this device. */
export function PrivateNotes({ propertyId, propertyName, compact = false }: { propertyId: string; propertyName: string; compact?: boolean }) {
  const { notes, save } = useNotes();
  const stored = notes[propertyId];
  const [text, setText] = useState(stored?.text ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timer = useRef<number | undefined>(undefined);
  const id = useId();

  // Pick up edits made in another tab or on the Saved page.
  useEffect(() => {
    if (status === 'idle' && (stored?.text ?? '') !== text) setText(stored?.text ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stored?.text]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onChange = (value: string) => {
    setText(value);
    setStatus('saving');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      save(propertyId, value);
      setStatus('saved');
      window.setTimeout(() => setStatus('idle'), 1500);
    }, 450);
  };

  return (
    <div>
      <label htmlFor={id} className={`flex items-center gap-2 font-semibold ${compact ? 'text-sm' : ''}`}>
        <Lock aria-hidden className="size-4 text-sage-strong" /> My private notes
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        maxLength={NOTE_LIMIT}
        placeholder={`Thoughts on ${propertyName}: rooms you loved, questions to ask, things to check…`}
        className={`field mt-2 resize-y ${compact ? 'min-h-24 text-sm' : 'min-h-36'}`}
        aria-describedby={`${id}-status`}
      />
      <p id={`${id}-status`} className="mt-1.5 flex justify-between gap-3 text-xs text-muted" aria-live="polite">
        <span>
          {status === 'saving'
            ? 'Saving…'
            : !storageAvailable
              ? 'This browser is blocking storage, so notes last only until you leave.'
              : stored
                ? `Saved on this device · ${formatTimeShort(stored.updatedAt)}`
                : 'Stored only on this device.'}
        </span>
        <span className="tabular-nums">
          {text.length}/{NOTE_LIMIT}
        </span>
      </p>
    </div>
  );
}
