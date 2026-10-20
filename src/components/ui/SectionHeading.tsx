import type { ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  align = 'left',
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  align?: 'left' | 'center';
  action?: ReactNode;
}) {
  return (
    <div className={`mb-8 flex flex-col gap-4 md:mb-12 ${align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'}`}>
      <div className={align === 'center' ? 'max-w-2xl' : 'max-w-3xl'}>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 id={id} className="font-display text-[2.1rem] leading-[1.08] text-ink md:text-5xl">
          {title}
        </h2>
        {intro && <div className="mt-4 text-[1.02rem] leading-relaxed text-muted">{intro}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
