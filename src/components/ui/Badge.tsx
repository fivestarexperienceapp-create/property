import type { ReactNode } from 'react';

export function Badge({ children, tone = 'sage', className = '' }: { children: ReactNode; tone?: 'sage' | 'ink' | 'light' | 'outline'; className?: string }) {
  const tones = {
    sage: 'bg-sage-soft text-sage-strong',
    ink: 'bg-ink text-white',
    light: 'bg-white/90 text-ink',
    outline: 'border border-line text-muted',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide uppercase ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function SampleTag({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-dashed border-sage px-2 py-0.5 text-[0.65rem] font-semibold tracking-wider text-sage-strong uppercase ${className}`}>
      Sample
    </span>
  );
}
