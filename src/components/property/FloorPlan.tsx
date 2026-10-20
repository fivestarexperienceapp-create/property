import { useState } from 'react';
import type { FloorLevel, FloorRoom, Property, RoomKind } from '../../config/types';
import { assetUrl } from '../../lib/media';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { SafeImg } from '../ui/SafeImg';

const fills: Record<RoomKind, string> = {
  living: 'var(--color-sage-soft)',
  kitchen: '#efe6d6',
  bedroom: '#f4ede4',
  bath: '#e3ebec',
  office: '#ece6dc',
  utility: '#ebe8e2',
  circulation: '#faf8f4',
  outdoor: 'url(#fp-hatch)',
  garage: '#e5e2dc',
};

const legend: Array<{ kind: RoomKind; label: string }> = [
  { kind: 'living', label: 'Living' },
  { kind: 'kitchen', label: 'Kitchen' },
  { kind: 'bedroom', label: 'Bedrooms' },
  { kind: 'bath', label: 'Baths' },
  { kind: 'outdoor', label: 'Outdoor' },
  { kind: 'garage', label: 'Garage' },
];

function labelLines(room: FloorRoom, size: number): string[] {
  const maxChars = Math.max(4, Math.floor(room.w / (size * 0.56)));
  if (room.name.length <= maxChars) return [room.name];
  const words = room.name.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars && line) {
      lines.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  lines.push(line);
  return lines;
}

function Plan({ level }: { level: FloorLevel }) {
  const pad = 1.5;
  const wall = Math.max(level.width, level.height) * 0.006;
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${level.width + pad * 2} ${level.height + pad * 2}`}
      className="h-auto max-h-[70vh] w-full"
      role="img"
      aria-label={`${level.name} illustrative layout: ${level.rooms.map((r) => r.name).join(', ')}`}
    >
      <defs>
        <pattern id="fp-hatch" width="1.2" height="1.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="1.2" height="1.2" fill="#f6f2ea" />
          <line x1="0" y1="0" x2="0" y2="1.2" stroke="var(--color-sage)" strokeWidth="0.18" strokeOpacity="0.55" />
        </pattern>
      </defs>
      {level.rooms.map((room, i) => (
        <rect
          key={`r${i}`}
          x={room.x}
          y={room.y}
          width={room.w}
          height={room.h}
          fill={fills[room.kind]}
          stroke="var(--color-ink)"
          strokeWidth={room.kind === 'outdoor' ? wall * 0.5 : wall}
          strokeOpacity={room.kind === 'outdoor' ? 0.5 : 0.85}
          strokeDasharray={room.kind === 'outdoor' ? `${wall * 3} ${wall * 2}` : undefined}
        />
      ))}
      {/* Open-concept sides: erase the wall, draw a light dashed line. */}
      {level.rooms.flatMap((room, i) =>
        (room.open ?? []).map((side) => {
          const inset = wall * 2.2;
          const lines = {
            top: [room.x + inset, room.y, room.x + room.w - inset, room.y],
            bottom: [room.x + inset, room.y + room.h, room.x + room.w - inset, room.y + room.h],
            left: [room.x, room.y + inset, room.x, room.y + room.h - inset],
            right: [room.x + room.w, room.y + inset, room.x + room.w, room.y + room.h - inset],
          }[side];
          return (
            <g key={`o${i}${side}`}>
              <line x1={lines[0]} y1={lines[1]} x2={lines[2]} y2={lines[3]} stroke={room.kind === 'kitchen' ? '#efe6d6' : 'var(--color-sage-soft)'} strokeWidth={wall * 1.6} />
              <line x1={lines[0]} y1={lines[1]} x2={lines[2]} y2={lines[3]} stroke="var(--color-ink)" strokeOpacity="0.35" strokeWidth={wall * 0.4} strokeDasharray={`${wall * 1.5} ${wall * 1.5}`} />
            </g>
          );
        }),
      )}
      {level.rooms.map((room, i) => {
        const size = Math.max(0.9, Math.min(1.9, Math.min(room.w, room.h) * 0.17));
        const lines = labelLines(room, size);
        const cx = room.x + room.w / 2;
        const cy = room.y + room.h / 2 - ((lines.length - 1) * size * 1.15) / 2;
        return (
          <text key={`t${i}`} x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={size} fill="var(--color-ink)" fontFamily="var(--font-sans)" fontWeight={500}>
            {lines.map((line, j) => (
              <tspan key={j} x={cx} dy={j === 0 ? 0 : size * 1.15}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

export function FloorPlanSection({ property }: { property: Property }) {
  const plan = property.floorPlan;
  const [levelIndex, setLevelIndex] = useState(0);
  if (!plan || (!plan.levels.length && !plan.image)) return null;
  const level = plan.levels[levelIndex];
  return (
    <section id="floor-plan" aria-labelledby="floor-plan-title" className="py-16 md:py-28">
      <div className="container-page">
        <SectionHeading id="floor-plan-title" eyebrow="Floor plan" title="How the home flows" intro="A simplified layout to help you picture daily life in the home." />
        <Reveal className="rounded-[1.75rem] border border-line bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-6 md:p-10">
          {plan.levels.length > 1 && (
            <div role="tablist" aria-label="Levels" className="mb-6 inline-flex flex-wrap gap-1 rounded-full bg-linen p-1">
              {plan.levels.map((l, i) => (
                <button
                  key={l.id}
                  id={`fp-tab-${l.id}`}
                  type="button"
                  role="tab"
                  aria-selected={i === levelIndex}
                  aria-controls="fp-panel"
                  tabIndex={i === levelIndex ? 0 : -1}
                  onClick={() => setLevelIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + plan.levels.length) % plan.levels.length;
                    setLevelIndex(next);
                    document.getElementById(`fp-tab-${plan.levels[next].id}`)?.focus();
                  }}
                  className={`h-10 rounded-full px-5 text-sm font-semibold transition ${i === levelIndex ? 'bg-surface text-ink shadow-[var(--shadow-soft)]' : 'text-muted hover:text-ink'}`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          )}
          <div id="fp-panel" role={plan.levels.length > 1 ? 'tabpanel' : undefined} aria-labelledby={plan.levels.length > 1 && level ? `fp-tab-${level.id}` : undefined}>
            {plan.image ? (
              <SafeImg src={assetUrl(plan.image)} alt={`${property.name} floor plan`} className="mx-auto max-h-[70vh] w-auto" loading="lazy" />
            ) : (
              level && <Plan key={level.id} level={level} />
            )}
          </div>
          <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-ink">Illustrative layout — not to scale.</p>
            {!plan.image && (
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted" aria-label="Legend">
                {legend.map((item) => (
                  <li key={item.kind} className="flex items-center gap-1.5">
                    <svg aria-hidden className="size-3.5 rounded-sm" viewBox="0 0 14 14">
                      <defs>
                        <pattern id={`lg-${item.kind}`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                          <rect width="3" height="3" fill="#f6f2ea" />
                          <line x1="0" y1="0" x2="0" y2="3" stroke="var(--color-sage)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="14" height="14" fill={item.kind === 'outdoor' ? `url(#lg-${item.kind})` : fills[item.kind]} stroke="var(--color-ink)" strokeOpacity="0.4" />
                    </svg>
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
