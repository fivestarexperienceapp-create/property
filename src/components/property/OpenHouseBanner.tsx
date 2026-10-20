import { CalendarCheck, CalendarDays, CalendarPlus } from 'lucide-react';
import type { Property } from '../../config/types';
import { site } from '../../config';
import { formatOpenHouse, upcomingOpenHouses } from '../../lib/format';
import { downloadBlob, openHouseIcs } from '../../lib/ics';
import { propertyLink } from '../../lib/share';
import { useContact } from '../contact/ContactContext';
import { Button } from '../ui/Button';
import { SampleTag } from '../ui/Badge';
import { Reveal } from '../ui/Reveal';

export function OpenHouseBanner({ property }: { property: Property }) {
  const { openInquiry } = useContact();
  const upcoming = upcomingOpenHouses(property.openHouses);
  if (!upcoming.length) return null;
  return (
    <section aria-labelledby="open-house-title" className="pb-16 md:pb-24">
      <Reveal className="container-page">
        <div className="flex flex-col gap-6 rounded-[1.75rem] bg-sage-strong p-6 text-white md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex gap-5">
            <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-white/12 sm:inline-flex">
              <CalendarDays aria-hidden className="size-7" />
            </span>
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-white/75 uppercase">
                Open house {site.demoMode && <SampleTag className="border-white/50 text-white" />}
              </p>
              <h2 id="open-house-title" className="font-display mt-1 text-3xl md:text-4xl">
                Come see it in person
              </h2>
              <ul className="mt-3 space-y-1">
                {upcoming.map((oh) => {
                  const f = formatOpenHouse(oh);
                  return (
                    <li key={oh.date + oh.start} className="text-white/90">
                      <span className="font-semibold text-white">
                        {f.day}, {f.date}
                      </span>{' '}
                      · {f.time}
                      {oh.note && <span className="block text-sm text-white/70">{oh.note}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
            <Button
              variant="light"
              icon={<CalendarPlus aria-hidden className="size-4" />}
              onClick={() => downloadBlob(`${property.id}-open-house.ics`, new Blob([openHouseIcs(property, upcoming[0], propertyLink(property.id))], { type: 'text/calendar' }))}
            >
              Add to calendar
            </Button>
            <Button variant="glass" icon={<CalendarCheck aria-hidden className="size-4" />} onClick={() => openInquiry({ type: 'tour', propertyId: property.id })}>
              Request a private tour
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
