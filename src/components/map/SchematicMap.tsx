import type { Neighborhood, PlaceCategory } from '../../config/types';
import { CATEGORIES } from './categories';

/** Offline-friendly simplified layout of the same places, used when map imagery can't load. */
export function SchematicMap({ neighborhood, visible, selectedId, onSelect }: { neighborhood: Neighborhood; visible: Set<PlaceCategory>; selectedId: string | null; onSelect: (id: string) => void }) {
  const pts = neighborhood.places;
  const lats = pts.map((p) => p.lat).concat(neighborhood.center.lat);
  const lngs = pts.map((p) => p.lng).concat(neighborhood.center.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const W = 100;
  const H = 62;
  const pad = 7;
  const x = (lng: number) => pad + ((lng - minLng) / (maxLng - minLng || 1)) * (W - pad * 2);
  const y = (lat: number) => pad + (1 - (lat - minLat) / (maxLat - minLat || 1)) * (H - pad * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="size-full" role="group" aria-label="Simplified layout of nearby places">
      <rect width={W} height={H} fill="var(--color-linen)" />
      <g stroke="var(--color-surface)" strokeWidth="1.6" fill="none" strokeLinecap="round" aria-hidden>
        <path d="M-2 20 C 25 16, 40 30, 62 24 S 92 12, 104 18" />
        <path d="M-2 46 C 20 40, 46 52, 70 44 S 96 40, 104 48" />
        <path d="M30 -2 C 34 18, 26 38, 34 64" />
        <path d="M72 -2 C 66 20, 78 40, 70 64" />
      </g>
      <g stroke="var(--color-line)" strokeWidth="0.6" fill="none" aria-hidden>
        <path d="M-2 33 C 30 30, 60 38, 104 31" />
        <path d="M50 -2 C 52 20, 46 44, 52 64" />
      </g>
      <ellipse cx="18" cy="52" rx="7" ry="3.6" fill="var(--color-sage-soft)" aria-hidden />
      <ellipse cx="86" cy="10" rx="8" ry="4" fill="var(--color-sage-soft)" aria-hidden />
      {pts
        .filter((p) => visible.has(p.category))
        .map((p) => {
          const c = CATEGORIES[p.category];
          const selected = p.id === selectedId;
          return (
            <g
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`${p.name} (${c.singular})`}
              aria-pressed={selected}
              onClick={() => onSelect(p.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(p.id);
                }
              }}
              className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-ink"
            >
              <circle cx={x(p.lng)} cy={y(p.lat)} r={selected ? 2.6 : 1.9} fill={c.color} stroke="#fff" strokeWidth="0.7" />
              {selected && (
                <text x={x(p.lng)} y={y(p.lat) - 3.6} textAnchor="middle" fontSize="2.6" fontWeight="600" fill="var(--color-ink)" fontFamily="var(--font-sans)">
                  {p.name}
                </text>
              )}
            </g>
          );
        })}
    </svg>
  );
}
