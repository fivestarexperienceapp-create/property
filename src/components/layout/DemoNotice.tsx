import { Info } from 'lucide-react';
import { site } from '../../config';
import { href } from '../../lib/router';

/** Discreet, always-readable demo disclosure. Hidden automatically on customer sites. */
export function DemoNotice() {
  if (!site.demoMode) return null;
  return (
    <div className="bg-ink text-white/90" data-print-hide>
      <p className="container-page flex min-h-8 items-center justify-center gap-2 py-1.5 text-center text-[0.78rem] leading-snug">
        <Info aria-hidden className="size-3.5 shrink-0 text-sage" />
        <span>Demo experience — fictional agency and properties.</span>
        <a href={href.about()} className="hidden font-semibold text-white underline-offset-4 hover:underline sm:inline">
          Learn more
        </a>
      </p>
    </div>
  );
}
