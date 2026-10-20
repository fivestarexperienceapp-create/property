import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { integrations } from '../../config';
import type { Neighborhood, PlaceCategory } from '../../config/types';
import { CATEGORIES, directionsUrl } from './categories';

export type MapStatus = 'loading' | 'ready' | 'failed';

interface Props {
  neighborhood: Neighborhood;
  visible: Set<PlaceCategory>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onStatus: (status: MapStatus) => void;
  interactive: boolean;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function markerHtml(category: PlaceCategory, selected: boolean) {
  const c = CATEGORIES[category];
  const size = selected ? 42 : 34;
  return `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:999px;background:${c.color};border:2.5px solid #fff;box-shadow:0 6px 16px -4px rgb(0 0 0 / .45);transition:all .2s">
    <svg width="${size * 0.48}" height="${size * 0.48}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${c.paths.map((d) => `<path d="${d}"/>`).join('')}</svg>
  </span>`;
}

function icon(category: PlaceCategory, selected: boolean) {
  const size = selected ? 42 : 34;
  return L.divIcon({ html: markerHtml(category, selected), className: 'place-marker', iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2] });
}

export default function LeafletMap({ neighborhood, visible, selectedId, onSelect, onStatus, interactive }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, { marker: L.Marker; category: PlaceCategory }>());
  const handlers = useRef({ onSelect, onStatus });
  handlers.current = { onSelect, onStatus };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = L.map(container, {
      center: [neighborhood.center.lat, neighborhood.center.lng],
      zoom: neighborhood.zoom,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });
    mapRef.current = map;
    map.attributionControl.setPrefix(false);

    const { map: tiles } = integrations;
    let loaded = 0;
    let errors = 0;
    const layer = L.tileLayer(tiles.tileUrl, {
      attribution: tiles.attribution,
      maxZoom: tiles.maxZoom,
      subdomains: tiles.subdomains ?? 'abc',
      referrerPolicy: 'strict-origin-when-cross-origin',
    });
    layer.on('tileload', () => {
      loaded += 1;
      handlers.current.onStatus('ready');
    });
    layer.on('tileerror', () => {
      errors += 1;
      if (errors >= 4 && loaded === 0) handlers.current.onStatus('failed');
    });
    layer.addTo(map);
    const timer = window.setTimeout(() => {
      if (loaded === 0) handlers.current.onStatus('failed');
    }, 9000);

    for (const place of neighborhood.places) {
      const meta = CATEGORIES[place.category];
      const popup = `<div style="min-width:180px"><strong style="font-size:14px">${escapeHtml(place.name)}</strong>
        <div style="color:${meta.color};font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-top:2px">${meta.singular}</div>
        ${place.description ? `<p style="margin:6px 0 0">${escapeHtml(place.description)}</p>` : ''}
        ${place.address ? `<p style="margin:4px 0 0;color:#5f5b54">${escapeHtml(place.address)}</p>` : ''}
        ${
          place.sample
            ? '<p style="margin:8px 0 0;font-size:12px;color:#5f5b54"><em>Illustrative marker, not a real place. Directions are unavailable.</em></p>'
            : `<a style="display:inline-block;margin-top:8px;font-weight:600" href="${directionsUrl(place.lat, place.lng)}" target="_blank" rel="noopener noreferrer">Directions ↗</a>`
        }</div>`;
      const marker = L.marker([place.lat, place.lng], { icon: icon(place.category, false), title: place.name, alt: `${place.name} (${meta.singular})`, keyboard: true, riseOnHover: true })
        .bindPopup(popup, { closeButton: true, autoPanPadding: [24, 24] })
        .on('click', () => handlers.current.onSelect(place.id));
      marker.addTo(map);
      markersRef.current.set(place.id, { marker, category: place.category });
    }
    if (neighborhood.home) {
      L.marker([neighborhood.home.lat, neighborhood.home.lng], { title: neighborhood.home.label, alt: neighborhood.home.label, zIndexOffset: 1000 })
        .bindPopup(`<strong>${escapeHtml(neighborhood.home.label)}</strong>`)
        .addTo(map);
    }

    map.on('focus', () => map.scrollWheelZoom.enable());
    map.on('blur', () => map.scrollWheelZoom.disable());
    const markers = markersRef.current;
    return () => {
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markers.clear();
    };
  }, [neighborhood]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const { marker, category } of markersRef.current.values()) {
      const shown = visible.has(category);
      if (shown && !map.hasLayer(marker)) marker.addTo(map);
      if (!shown && map.hasLayer(marker)) marker.remove();
    }
  }, [visible]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const [id, { marker, category }] of markersRef.current) marker.setIcon(icon(category, id === selectedId));
    const entry = selectedId ? markersRef.current.get(selectedId) : null;
    if (entry && map.hasLayer(entry.marker)) {
      map.panTo(entry.marker.getLatLng(), { animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches });
      entry.marker.openPopup();
    }
  }, [selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    // On touch screens, one-finger page scrolling stays smooth until the visitor opts in.
    if (!coarse || interactive) {
      map.dragging.enable();
      map.touchZoom.enable();
    } else {
      map.dragging.disable();
      map.touchZoom.disable();
    }
  }, [interactive]);

  return <div ref={containerRef} className={`size-full ${integrations.map.tint === 'warm' ? 'map-tint-warm' : ''}`} aria-label={`Map: ${neighborhood.title}`} role="region" />;
}
