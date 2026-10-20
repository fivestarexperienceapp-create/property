import { branding } from '../../config';

const tokenColor: Record<string, string> = {
  accent: 'var(--color-sage)',
  accentStrong: 'var(--color-sage-strong)',
  ink: 'var(--color-ink)',
  background: 'var(--color-canvas)',
  surface: 'var(--color-surface)',
};

export function BrandMark({ className = 'size-8', inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox={branding.mark.viewBox} className={className} aria-hidden focusable="false">
      {branding.mark.paths.map((p, i) => (
        <path key={i} d={p.d} fill={inverted && p.fill === 'ink' ? '#ffffff' : (tokenColor[p.fill] ?? p.fill)} fillOpacity={p.opacity} />
      ))}
    </svg>
  );
}

export function Wordmark({ inverted = false, compact = false }: { inverted?: boolean; compact?: boolean }) {
  const { primary, secondary } = branding.wordmark;
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark className={compact ? 'size-7' : 'size-8'} inverted={inverted} />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.35rem] font-semibold tracking-tight ${inverted ? 'text-white' : 'text-ink'}`}>{primary}</span>
        {secondary && (
          <span className={`mt-0.5 text-[0.6rem] font-semibold tracking-[0.32em] uppercase ${inverted ? 'text-white/75' : 'text-muted'}`}>{secondary}</span>
        )}
      </span>
    </span>
  );
}
