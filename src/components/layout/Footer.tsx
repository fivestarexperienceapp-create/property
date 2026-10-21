import { useCallback, useState } from 'react';
import { agent, branding, integrations, site } from '../../config';
import { href } from '../../lib/router';
import { Wordmark } from '../ui/BrandMark';
import { InstallSheet } from './InstallSheet';

export function Footer() {
  const [installOpen, setInstallOpen] = useState(false);
  const closeInstall = useCallback(() => setInstallOpen(false), []);
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-ink text-white/80" data-print-hide>
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
        <div>
          <Wordmark inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{branding.tagline}.</p>
          {site.demoMode && (
            <p className="mt-5 inline-flex rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80">Demo experience — fictional agency and properties.</p>
          )}
        </div>
        <nav aria-label="Footer">
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">Explore</p>
          <ul className="grid gap-2 text-sm">
            <li><a className="hover:text-white" href={href.home()}>Featured home</a></li>
            <li><a className="hover:text-white" href={href.homes()}>Browse homes</a></li>
            <li><a className="hover:text-white" href={href.saved()}>Saved homes &amp; notes</a></li>
            <li><a className="hover:text-white" href={href.compare()}>Compare homes</a></li>
            <li><a className="hover:text-white" href={href.agent()}>Contact {agent.name}</a></li>
          </ul>
        </nav>
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">This site</p>
          <ul className="grid gap-2 text-sm">
            <li>
              <button type="button" className="hover:text-white" onClick={() => setInstallOpen(true)}>
                Install the app
              </button>
            </li>
            <li><a className="hover:text-white" href={href.about()}>About, credits &amp; privacy</a></li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-white/55">Saved homes and notes stay on this device only.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {branding.brokerageName}.{' '}
            {site.demoMode ? 'All listings, people and details are fictional.' : 'Information is deemed reliable but not guaranteed.'}
          </p>
          {integrations.map.enabled && <p>Map data © OpenStreetMap contributors (where shown).</p>}
        </div>
        {branding.legal.length > 0 && (
          <div className="container-page pb-6 text-xs text-white/55">
            {branding.legal.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}
      </div>
      <InstallSheet open={installOpen} onClose={closeInstall} />
    </footer>
  );
}
