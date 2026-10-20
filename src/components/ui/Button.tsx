import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'glass';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 ease-[var(--ease-soft)] select-none whitespace-nowrap disabled:opacity-50 aria-disabled:opacity-60 motion-safe:active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary: 'bg-sage-strong text-white shadow-[var(--shadow-soft)] hover:brightness-110',
  secondary: 'border border-ink/20 bg-surface text-ink hover:border-ink/40 hover:bg-white',
  ghost: 'text-ink hover:bg-ink/5',
  light: 'bg-white text-ink shadow-[var(--shadow-soft)] hover:bg-canvas',
  glass: 'border border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white/20',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-13 px-7 text-base',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({ variant, size, icon, children, className = '', type = 'button', ...rest }: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function LinkButton({ variant, size, icon, children, className = '', ...rest }: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </a>
  );
}

export function IconButton({
  label,
  children,
  className = '',
  tone = 'surface',
  ...rest
}: { label: string; children: ReactNode; tone?: 'surface' | 'glass' } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    surface: 'bg-surface text-ink border border-line hover:border-ink/30',
    glass: 'bg-black/25 text-white border border-white/30 backdrop-blur-md hover:bg-black/40',
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-11 items-center justify-center rounded-full transition ${tones[tone]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
