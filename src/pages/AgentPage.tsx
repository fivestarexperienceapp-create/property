import { MapPin, Languages, Sparkles } from 'lucide-react';
import { agent, branding, site } from '../config';
import { AgentAvatar } from '../components/contact/AgentCard';
import { ActionControl, useContactActions } from '../components/contact/ContactActions';
import { InquiryForm } from '../components/contact/InquiryForm';
import { MobileContactBar } from '../components/layout/MobileContactBar';
import { BrandMark } from '../components/ui/BrandMark';
import { buttonClass } from '../components/ui/Button';

export function AgentPage() {
  const actions = useContactActions();
  return (
    <div className="pb-28">
      <section className="bg-linen">
        <div className="container-page grid gap-10 py-14 md:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <AgentAvatar size="lg" />
            <p className="eyebrow mt-6 mb-3">{branding.brokerageName}</p>
            <h1 tabIndex={-1} className="font-display text-5xl leading-none outline-none md:text-7xl">
              {agent.name}
            </h1>
            <p className="mt-2 text-lg text-muted">
              {agent.title}
              {site.demoMode ? ' · Fictional profile for this demo' : ''}
            </p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed">{agent.intro}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {actions.map((a) => (
                <ActionControl key={a.key} action={a} className={buttonClass(a.key === 'schedule' ? 'primary' : 'secondary', 'md')} />
              ))}
            </div>
          </div>
          <div className="rounded-[1.75rem] bg-surface p-7 shadow-[var(--shadow-soft)] md:p-9">
            <div className="space-y-4 text-[1.02rem] leading-relaxed text-muted">
              {agent.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <dl className="mt-6 grid gap-4 border-t border-line pt-6 text-sm">
              {agent.serviceArea && (
                <div className="flex gap-3">
                  <MapPin aria-hidden className="size-4 shrink-0 text-sage-strong" />
                  <div>
                    <dt className="font-semibold">Service area</dt>
                    <dd className="text-muted">{agent.serviceArea}</dd>
                  </div>
                </div>
              )}
              {agent.specialties.length > 0 && (
                <div className="flex gap-3">
                  <Sparkles aria-hidden className="size-4 shrink-0 text-sage-strong" />
                  <div>
                    <dt className="font-semibold">Focus</dt>
                    <dd className="text-muted">{agent.specialties.join(' · ')}</dd>
                  </div>
                </div>
              )}
              {agent.languages && agent.languages.length > 0 && (
                <div className="flex gap-3">
                  <Languages aria-hidden className="size-4 shrink-0 text-sage-strong" />
                  <div>
                    <dt className="font-semibold">Languages</dt>
                    <dd className="text-muted">{agent.languages.join(', ')}</dd>
                  </div>
                </div>
              )}
            </dl>
            {agent.credentials && <p className="mt-6 text-xs text-muted">{agent.credentials}</p>}
          </div>
        </div>
      </section>
      <section aria-labelledby="agent-contact-title" className="container-page grid gap-8 py-14 md:py-20 lg:grid-cols-[1fr_1.5fr]">
        <div>
          <p className="eyebrow mb-3">Get in touch</p>
          <h2 id="agent-contact-title" className="font-display text-4xl leading-tight md:text-5xl">
            Tell {agent.name.split(' ')[0]} what you’re looking for
          </h2>
          <p className="mt-4 text-muted">Request a tour of any home or ask a question. {site.demoMode ? 'In this demo, the form shows a preview with sample details.' : ''}</p>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-line p-4">
            <BrandMark className="size-10" />
            <div>
              <p className="font-display text-xl font-semibold">{branding.brokerageName}</p>
              <p className="text-sm text-muted">{branding.tagline}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-8">
          <InquiryForm initialType="question" idPrefix="agent" showPropertyPicker />
        </div>
      </section>
      <MobileContactBar />
    </div>
  );
}
