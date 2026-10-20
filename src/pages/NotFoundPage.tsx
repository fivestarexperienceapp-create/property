import { Compass } from 'lucide-react';
import { href } from '../lib/router';
import { LinkButton } from '../components/ui/Button';

export function NotFoundPage({ kind = 'page' }: { kind?: 'page' | 'property' }) {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center md:py-36">
      <Compass aria-hidden className="size-10 text-sage" />
      <h1 tabIndex={-1} className="font-display mt-5 text-5xl outline-none md:text-6xl">
        {kind === 'property' ? 'This home isn’t listed anymore' : 'We couldn’t find that page'}
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted">
        {kind === 'property' ? 'It may have been sold or removed. Take a look at the homes that are available now.' : 'The link may be incomplete. Try the featured home or browse every listing.'}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href={href.homes()}>Browse homes</LinkButton>
        <LinkButton variant="secondary" href={href.home()}>
          Featured home
        </LinkButton>
      </div>
    </div>
  );
}
