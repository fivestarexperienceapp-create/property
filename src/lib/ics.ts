import type { OpenHouse, Property } from '../config/types';
import { site } from '../config';

function stamp(date: string, time: string) {
  return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
}

function escapeText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => `\\${c}`);
}

/** Calendar file for an open house, in the site's time zone. */
export function openHouseIcs(property: Property, openHouse: OpenHouse, url: string | null): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const title = `${site.demoMode ? '[Demo] ' : ''}Open house: ${property.name}`;
  const description = [property.summary, openHouse.note, url].filter(Boolean).join('\n');
  const location = property.location.streetAddress || `${property.community}, ${property.location.area}`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Property Showcase//Open House//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${property.id}-${openHouse.date}-${openHouse.start.replace(':', '')}@${site.appId}`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=${site.timeZone}:${stamp(openHouse.date, openHouse.start)}`,
    `DTEND;TZID=${site.timeZone}:${stamp(openHouse.date, openHouse.end)}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    ...(url ? [`URL:${url}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
