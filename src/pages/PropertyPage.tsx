import { useCallback, useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import type { Property } from '../config/types';
import { href } from '../lib/router';
import { copyText, shareLink, shareOrCopy } from '../lib/share';
import { toast } from '../state/toast';
import { AgentCard } from '../components/contact/AgentCard';
import { InquiryForm } from '../components/contact/InquiryForm';
import { MobileContactBar } from '../components/layout/MobileContactBar';
import { MoreHomes } from '../components/listings/MoreHomes';
import { NeighborhoodExplorer } from '../components/map/NeighborhoodExplorer';
import { Details } from '../components/property/Details';
import { FloorPlanSection } from '../components/property/FloorPlan';
import { GallerySection } from '../components/property/GallerySection';
import { Hero } from '../components/property/Hero';
import { Highlights } from '../components/property/Highlights';
import { KeyFacts } from '../components/property/KeyFacts';
import { Lightbox } from '../components/property/Lightbox';
import { MortgageCalculator } from '../components/property/MortgageCalculator';
import { OpenHouseBanner } from '../components/property/OpenHouseBanner';
import { Overview } from '../components/property/Overview';
import { PrintSummary } from '../components/property/PrintSummary';
import { scrollToSection, SectionNav, type NavSection } from '../components/property/SectionNav';
import { TourSection } from '../components/property/TourSection';
import { TrackTools } from '../components/property/TrackTools';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Sheet } from '../components/ui/Sheet';

export function PropertyPage({ property }: { property: Property }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [manualLink, setManualLink] = useState<string | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const closeManual = useCallback(() => setManualLink(null), []);

  const share = useCallback(async () => {
    const url = shareLink(href.property(property.id));
    const outcome = await shareOrCopy({ title: property.name, text: property.summary, url });
    if (outcome === 'copied') toast('Link copied to clipboard', 'success');
    if (outcome === 'manual') setManualLink(url);
  }, [property]);

  const sections = useMemo<NavSection[]>(() => {
    const list: NavSection[] = [{ id: 'overview', label: 'Overview' }];
    if (property.highlights.length) list.push({ id: 'highlights', label: 'Highlights' });
    list.push({ id: 'photos', label: 'Photos' }, { id: 'details', label: 'Details' });
    if (property.floorPlan) list.push({ id: 'floor-plan', label: 'Floor plan' });
    if (property.tour) list.push({ id: 'tour', label: 'Tour' });
    list.push({ id: 'neighborhood', label: 'Neighborhood' }, { id: 'payment', label: 'Payment' }, { id: 'contact', label: 'Contact' });
    return list;
  }, [property]);

  return (
    <>
      <div data-print-hide>
        <Hero property={property} onOpenGallery={setLightbox} onExplore={() => scrollToSection('overview')} onShare={share} />
        <KeyFacts property={property} />
        <SectionNav sections={sections} />
        <Overview property={property} onOpenGallery={setLightbox} />
        <OpenHouseBanner property={property} />
        <Highlights property={property} onOpenGallery={setLightbox} />
        <GallerySection property={property} onOpenGallery={setLightbox} />
        <Details property={property} />
        <FloorPlanSection property={property} />
        <TourSection property={property} />
        <NeighborhoodExplorer property={property} />
        <MortgageCalculator key={property.id} property={property} />
        <TrackTools property={property} onShare={share} />
        <section id="contact" aria-labelledby="contact-title" className="py-16 md:py-28">
          <div className="container-page">
            <SectionHeading id="contact-title" eyebrow="Visit" title="Schedule a tour or ask a question" />
            <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
              <Reveal>
                <AgentCard propertyId={property.id} />
              </Reveal>
              <Reveal delay={100} className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-8">
                <InquiryForm propertyId={property.id} idPrefix="page" />
              </Reveal>
            </div>
          </div>
        </section>
        <MoreHomes excludeId={property.id} />
        <div className="h-20 lg:hidden" aria-hidden />
      </div>
      <PrintSummary property={property} />
      <Lightbox photos={property.photos} index={lightbox} onIndex={setLightbox} onClose={closeLightbox} title={property.name} />
      <MobileContactBar propertyId={property.id} />
      <Sheet open={!!manualLink} onClose={closeManual} title="Share this home" description="Copy this link to share it." size="sm">
        <div className="flex gap-2 pb-6">
          <input className="field" readOnly value={manualLink ?? ''} onFocus={(e) => e.currentTarget.select()} aria-label="Link to this home" />
          <Button
            variant="secondary"
            icon={<Copy aria-hidden className="size-4" />}
            onClick={async () => manualLink && toast((await copyText(manualLink)) ? 'Link copied' : 'Select the link and copy it manually')}
          >
            Copy
          </Button>
        </div>
      </Sheet>
    </>
  );
}
