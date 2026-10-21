import { Image as ImageIcon, Info, Map as MapIcon, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { branding, integrations, neighborhoods, properties, site } from '../config';
import { assetUrl } from '../lib/media';

function Block({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.5rem] bg-surface p-6 shadow-[var(--shadow-soft)] md:p-8">
      <h2 className="font-display flex items-center gap-3 text-3xl">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-sage-soft text-sage-strong">{icon}</span>
        {title}
      </h2>
      <div className="mt-4 space-y-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export function AboutPage() {
  const credits = new Map<string, { license: string; author?: string; sourceUrl?: string; licenseUrl?: string; count: number; demo: boolean }>();
  for (const p of properties) {
    for (const photo of p.photos) {
      const key = `${photo.credit.label}|${photo.credit.author ?? ''}|${photo.credit.sourceUrl ?? ''}`;
      const entry = credits.get(key);
      if (entry) entry.count += 1;
      else credits.set(key, { license: photo.credit.license, author: photo.credit.author, sourceUrl: photo.credit.sourceUrl, licenseUrl: photo.credit.licenseUrl, count: 1, demo: !!photo.credit.isDemoArtwork });
    }
  }
  const sampleMap = neighborhoods.some((n) => n.isSample);
  return (
    <div className="container-page max-w-4xl pt-12 pb-24 md:pt-20">
      <p className="eyebrow mb-3">{branding.brokerageName}</p>
      <h1 tabIndex={-1} className="font-display text-5xl leading-none outline-none md:text-7xl">
        About this site
      </h1>
      <div className="mt-10 grid gap-5">
        {site.demoMode && (
          <Block icon={<Info aria-hidden className="size-5" />} title="Demo experience">
            <p>
              This is a demonstration of a property showcase app. {branding.brokerageName}, its agent and every listing shown are fictional. Prices, features, open houses and contact details are
              invented for illustration and are not offers to sell.
            </p>
            <p>Contact buttons and inquiry forms work in preview mode only: nothing is sent and no personal information is collected.</p>
          </Block>
        )}
        <Block icon={<ImageIcon aria-hidden className="size-5" />} title="Image credits">
          {properties.some((p) => p.photos.some((ph) => ph.credit.isDemoArtwork)) && <p>Sample images are illustrative and may depict different homes.</p>}
          <ul className="divide-y divide-line rounded-2xl border border-line">
            {[...credits.values()].map((c, i) => (
              <li key={i} className="p-4 text-sm">
                <p className="font-semibold text-ink">
                  {c.author ? `${c.author}` : 'Images'} ({c.count})
                </p>
                <p>
                  {c.sourceUrl ? (
                    <a className="text-sage-strong underline" href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
                      Source
                    </a>
                  ) : null}
                  {c.sourceUrl ? ' · ' : ''}
                  {c.licenseUrl ? (
                    <a className="text-sage-strong underline" href={c.licenseUrl} target="_blank" rel="noopener noreferrer">
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                </p>
                <p className="text-muted">{c.demo ? 'Original illustration created for this demo.' : ''}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm">
            Typefaces and open-source software used by this site are listed in the{' '}
            <a className="text-sage-strong underline" href={assetUrl('third-party-licenses.md')} target="_blank" rel="noopener">
              license notices
            </a>
            .
          </p>
        </Block>
        {integrations.map.enabled && (
          <Block icon={<MapIcon aria-hidden className="size-5" />} title="Maps">
            <p>
              Map imagery is provided by a third-party tile service and shown with its required attribution. Map data ©{' '}
              <a className="text-sage-strong underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
                OpenStreetMap contributors
              </a>
              {integrations.map.tileUrl.includes('openstreetmap.org') ? '.' : ' and the tile provider.'}
            </p>
            {sampleMap && <p>The sample neighborhood explorer uses illustrative markers that do not represent real businesses, schools or the location of any home.</p>}
          </Block>
        )}
        <Block icon={<ShieldCheck aria-hidden className="size-5" />} title="Privacy">
          <p>This site doesn’t use accounts, cookies for tracking or advertising scripts.</p>
          <p>Saved homes, comparisons and private notes are stored only in this browser on this device. They don’t sync between devices and are never sent to anyone.</p>
          <p>
            {site.demoMode
              ? 'In this demo, inquiry forms only show a preview and never send information.'
              : integrations.inquiry.endpoint
                ? 'Inquiries you submit are delivered to the agent through a secure form service so they can reply to you.'
                : 'Inquiries open a pre-addressed email in your own email app; nothing is sent until you press Send.'}
          </p>
        </Block>
      </div>
    </div>
  );
}
