// Small SVG drawing kit for the demo artwork. Everything is flat shapes with soft
// gradients so the illustrations render identically with sharp/librsvg.

export const W = 1920;
export const H = 1280;

let counter = 0;
export const uid = (prefix = 'g') => `${prefix}${(counter += 1)}`;
export const resetIds = () => {
  counter = 0;
};

const attrs = (extra = {}) =>
  Object.entries(extra)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}="${v}"`)
    .join(' ');

export const pts = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export const rect = (x, y, w, h, fill, extra = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${attrs(extra)}/>`;
export const poly = (list, fill, extra = {}) => `<polygon points="${pts(list)}" fill="${fill}" ${attrs(extra)}/>`;
export const path = (d, fill, extra = {}) => `<path d="${d}" fill="${fill}" ${attrs(extra)}/>`;
export const line = (x1, y1, x2, y2, stroke, width = 2, extra = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" ${attrs(extra)}/>`;
export const circle = (cx, cy, r, fill, extra = {}) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${attrs(extra)}/>`;
export const ellipse = (cx, cy, rx, ry, fill, extra = {}) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${attrs(extra)}/>`;
export const group = (content, extra = {}) => `<g ${attrs(extra)}>${content}</g>`;

/** Linear gradient definition. stops: [[offset, color, opacity?], ...] */
export function linear(defs, stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = {}) {
  const id = uid('lg');
  defs.push(
    `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
      .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
      .join('')}</linearGradient>`,
  );
  return `url(#${id})`;
}

export function radial(defs, stops, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy } = {}) {
  const id = uid('rg');
  defs.push(
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx !== undefined ? ` fx="${fx}" fy="${fy}"` : ''}>${stops
      .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
      .join('')}</radialGradient>`,
  );
  return `url(#${id})`;
}

export function blur(defs, std) {
  const id = uid('bl');
  defs.push(`<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${std}"/></filter>`);
  return `url(#${id})`;
}

export function clip(defs, shape) {
  const id = uid('cp');
  defs.push(`<clipPath id="${id}">${shape}</clipPath>`);
  return `url(#${id})`;
}

/** Deterministic pseudo-random numbers so renders are reproducible. */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const lerpPt = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

/** Soft contact shadow under furniture and trees. */
export function shadow(defs, cx, cy, rx, ry, opacity = 0.22, std = 14) {
  return ellipse(cx, cy, rx, ry, '#2a2520', { opacity, filter: blur(defs, std) });
}

/** Wraps a scene: background + content + subtle paper grain + gentle vignette. */
export function scene(defs, body, { grain = 0.05, vignette = 0.18 } = {}) {
  const grainId = uid('grain');
  defs.push(
    `<filter id="${grainId}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 ${grain * 9} -${grain * 4}"/></filter>`,
  );
  const vig = radial(defs, [
    [0.55, '#000', 0],
    [1, '#1a1612', vignette],
  ], { r: 0.75 });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs.join('')}</defs>${body}${
    vignette ? rect(0, 0, W, H, vig) : ''
  }${grain ? rect(0, 0, W, H, '#000', { filter: `url(#${grainId})` }) : ''}</svg>`;
}

// ---------------------------------------------------------------------------
// Nature
// ---------------------------------------------------------------------------

/** Deciduous tree: layered canopy clusters lit from the upper left. */
export function tree(defs, x, groundY, { h = 420, w = 300, trunk = '#6b5a4a', greens = ['#57744b', '#6e8a5e', '#8da477'], seed = 3, shadowOpacity = 0.18 } = {}) {
  const r = rng(seed);
  let out = shadow(defs, x + w * 0.15, groundY + 6, w * 0.55, 16, shadowOpacity, 10);
  out += path(`M${x - 10} ${groundY} C${x - 8} ${groundY - h * 0.25} ${x - 14} ${groundY - h * 0.45} ${x - 4} ${groundY - h * 0.6} L${x + 8} ${groundY - h * 0.6} C${x + 10} ${groundY - h * 0.4} ${x + 6} ${groundY - h * 0.2} ${x + 12} ${groundY} Z`, trunk);
  out += line(x, groundY - h * 0.5, x - w * 0.18, groundY - h * 0.68, trunk, 7, { strokeLinecap: 'round' });
  out += line(x, groundY - h * 0.55, x + w * 0.16, groundY - h * 0.72, trunk, 6, { strokeLinecap: 'round' });
  const cy = groundY - h * 0.68;
  const rx = w * 0.5;
  const ry = h * 0.3;
  const blobs = [];
  for (let i = 0; i < 26; i += 1) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    blobs.push([x + Math.cos(a) * rx * 0.72 * d, cy + Math.sin(a) * ry * 0.72 * d, Math.min(rx, ry) * (0.28 + r() * 0.14)]);
  }
  const dark = shade(greens[0], -0.12);
  out += blobs.map(([bx, by, br]) => circle(bx.toFixed(1), (by + br * 0.12).toFixed(1), br.toFixed(1), dark)).join('');
  out += blobs.map(([bx, by, br]) => circle((bx - br * 0.12).toFixed(1), (by - br * 0.1).toFixed(1), (br * 0.86).toFixed(1), greens[0])).join('');
  out += blobs
    .filter(([bx, by]) => bx < x + rx * 0.2 || by < cy - ry * 0.2)
    .map(([bx, by, br]) => circle((bx - br * 0.25).toFixed(1), (by - br * 0.25).toFixed(1), (br * 0.62).toFixed(1), greens[1]))
    .join('');
  out += blobs
    .filter(([bx, by]) => bx < x && by < cy)
    .map(([bx, by, br]) => ellipse((bx - br * 0.35).toFixed(1), (by - br * 0.35).toFixed(1), (br * 0.34).toFixed(1), (br * 0.26).toFixed(1), greens[2], { opacity: 0.7 }))
    .join('');
  return out;
}

/** Weeping willow: arched branches with long, fine drooping strands. */
export function willow(defs, x, groundY, { h = 640, w = 620, seed = 11, dusk = false } = {}) {
  const r = rng(seed);
  const greens = dusk ? ['#33433a', '#3c4d40', '#465a49', '#506450', '#2c3a32'] : ['#5c7a4d', '#6f8c5a', '#86a06b', '#9db57f', '#4c6a42'];
  const highlight = dusk ? '#6a7d62' : '#bcd09a';
  let out = shadow(defs, x + 80, groundY + 10, w * 0.6, 22, 0.2, 14);
  const bark = dusk ? '#3c352f' : '#5f5246';
  out += path(
    `M${x - 26} ${groundY} C${x - 18} ${groundY - h * 0.2} ${x - 34} ${groundY - h * 0.38} ${x - 14} ${groundY - h * 0.55} C${x - 60} ${groundY - h * 0.7} ${x - 120} ${groundY - h * 0.72} ${x - 170} ${groundY - h * 0.7} L${x - 168} ${groundY - h * 0.73} C${x - 110} ${groundY - h * 0.78} ${x - 40} ${groundY - h * 0.74} ${x} ${groundY - h * 0.6} C${x + 30} ${groundY - h * 0.76} ${x + 90} ${groundY - h * 0.84} ${x + 150} ${groundY - h * 0.8} L${x + 150} ${groundY - h * 0.77} C${x + 90} ${groundY - h * 0.76} ${x + 40} ${groundY - h * 0.66} ${x + 14} ${groundY - h * 0.5} C${x + 22} ${groundY - h * 0.3} ${x + 14} ${groundY - h * 0.15} ${x + 30} ${groundY} Z`,
    bark,
  );
  const crownY = groundY - h * 0.86;
  // soft crown mass made of small clusters
  for (let i = 0; i < 60; i += 1) {
    const t = r();
    const cx = x - w / 2 + t * w;
    const cy = crownY + (1 - Math.sin(t * Math.PI)) * h * 0.2 + r() * h * 0.12;
    out += circle(cx.toFixed(1), cy.toFixed(1), (18 + r() * 26).toFixed(1), greens[Math.floor(r() * 2)], { opacity: 0.9 });
  }
  for (let layer = 0; layer < 2; layer += 1) {
    for (let i = 0; i < 260; i += 1) {
      const t = r();
      const sx = x - w / 2 + t * w;
      const arc = Math.sin(t * Math.PI);
      const sy = crownY + (1 - arc) * h * 0.2 + r() * 40;
      const len = h * (0.3 + arc * 0.45) * (0.7 + r() * 0.4) * (layer ? 0.85 : 1);
      const sway = (t - 0.5) * 50 + (r() - 0.5) * 24;
      const color = greens[Math.floor(r() * greens.length)];
      const width = 3 + r() * 5;
      out += `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} C${(sx + sway * 0.2).toFixed(1)} ${(sy + len * 0.3).toFixed(1)} ${(sx + sway).toFixed(1)} ${(sy + len * 0.7).toFixed(1)} ${(sx + sway * 1.1).toFixed(1)} ${(sy + len).toFixed(1)}" fill="none" stroke="${color}" stroke-width="${width.toFixed(1)}" stroke-linecap="round" opacity="${(0.7 + r() * 0.3).toFixed(2)}"/>`;
    }
  }
  for (let i = 0; i < 70; i += 1) {
    const t = r() * 0.65;
    const sx = x - w / 2 + t * w;
    const sy = crownY + (1 - Math.sin(t * Math.PI)) * h * 0.2 + r() * 50;
    const len = h * 0.28 * (0.5 + r());
    out += `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} q${(r() * 8).toFixed(1)} ${(len * 0.5).toFixed(1)} ${(-5 + r() * 10).toFixed(1)} ${len.toFixed(1)}" fill="none" stroke="${highlight}" stroke-width="${(2 + r() * 3).toFixed(1)}" stroke-linecap="round" opacity="0.6"/>`;
  }
  return out;
}

/** Clipped hedge/shrub cluster. */
export function shrub(x, y, w, h, colors = ['#56724a', '#6c8a5b', '#88a26f'], seed = 5) {
  const r = rng(seed);
  let out = '';
  const n = Math.max(3, Math.round(w / (h * 0.8)));
  for (let i = 0; i < n; i += 1) {
    const cx = x + (i + 0.5) * (w / n) + (r() - 0.5) * 10;
    const rad = (h * (0.55 + r() * 0.25));
    out += ellipse(cx, y - rad * 0.55, rad * 0.95, rad * 0.75, colors[0]);
  }
  for (let i = 0; i < n; i += 1) {
    const cx = x + (i + 0.5) * (w / n) + (r() - 0.5) * 10;
    const rad = h * (0.45 + r() * 0.2);
    out += ellipse(cx - rad * 0.2, y - rad * 0.75, rad * 0.7, rad * 0.5, colors[1]);
    out += ellipse(cx - rad * 0.35, y - rad * 0.95, rad * 0.35, rad * 0.22, colors[2], { opacity: 0.85 });
  }
  return out;
}

/** Ornamental grass tufts. */
export function grasses(x, y, w, h, color = '#a9a36b', seed = 9) {
  const r = rng(seed);
  let out = '';
  const tufts = Math.max(2, Math.round(w / 46));
  for (let t = 0; t < tufts; t += 1) {
    const bx = x + (t + 0.5) * (w / tufts);
    for (let i = 0; i < 14; i += 1) {
      const a = (r() - 0.5) * 1.6;
      const len = h * (0.6 + r() * 0.5);
      out += `<path d="M${bx.toFixed(1)} ${y} q${(a * len * 0.3).toFixed(1)} ${(-len * 0.6).toFixed(1)} ${(a * len * 0.7).toFixed(1)} ${(-len).toFixed(1)}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" opacity="${(0.7 + r() * 0.3).toFixed(2)}"/>`;
    }
  }
  return out;
}

/** Flower dots for garden beds. */
export function flowers(x, y, w, h, palette = ['#f2e6c9', '#e9b8a0', '#c9a0c4', '#f3d27a'], seed = 13, count = 40) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < count; i += 1) out += circle((x + r() * w).toFixed(1), (y - r() * h).toFixed(1), (3 + r() * 4).toFixed(1), palette[Math.floor(r() * palette.length)], { opacity: 0.95 });
  return out;
}

/** Potted interior plant (olive or fiddle-leaf style). */
export function pottedPlant(x, floorY, { h = 360, pot = '#d9cdb8', potDark = '#c3b59c', leaf = ['#5f7c55', '#7b9768', '#9ab384'], seed = 21, style = 'olive' } = {}) {
  const r = rng(seed);
  const pw = h * 0.28;
  const ph = h * 0.24;
  let out = '';
  out += path(`M${x - pw / 2} ${floorY - ph} L${x + pw / 2} ${floorY - ph} L${x + pw * 0.38} ${floorY} L${x - pw * 0.38} ${floorY} Z`, pot);
  out += path(`M${x + pw * 0.1} ${floorY - ph} L${x + pw / 2} ${floorY - ph} L${x + pw * 0.38} ${floorY} L${x + pw * 0.05} ${floorY} Z`, potDark, { opacity: 0.6 });
  const top = floorY - h;
  out += line(x, floorY - ph, x - 4, top + h * 0.25, '#6b5847', 5, { strokeLinecap: 'round' });
  out += line(x - 2, floorY - ph - h * 0.25, x + h * 0.12, top + h * 0.3, '#6b5847', 3, { strokeLinecap: 'round' });
  const n = style === 'fiddle' ? 18 : 60;
  for (let i = 0; i < n; i += 1) {
    const lx = x + (r() - 0.5) * h * (style === 'fiddle' ? 0.5 : 0.6);
    const ly = top + r() * h * 0.6;
    const rot = (r() - 0.5) * 120;
    const size = style === 'fiddle' ? 26 + r() * 18 : 8 + r() * 7;
    out += ellipse(lx.toFixed(1), ly.toFixed(1), (size * (style === 'fiddle' ? 0.75 : 2.2)).toFixed(1), (size * (style === 'fiddle' ? 1 : 0.6)).toFixed(1), leaf[Math.floor(r() * leaf.length)], {
      transform: `rotate(${rot.toFixed(0)} ${lx.toFixed(1)} ${ly.toFixed(1)})`,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Interiors: one-point perspective room shell
// ---------------------------------------------------------------------------

/** Maps (u, v) on a side wall (u: 0 front → 1 back, v: 0 top → 1 bottom) to screen. */
export function wallPoint(side, back, u, v) {
  const [x0, y0, x1, y1] = back;
  const frontTop = side === 'left' ? [0, 0] : [W, 0];
  const frontBottom = side === 'left' ? [0, H] : [W, H];
  const backTop = side === 'left' ? [x0, y0] : [x1, y0];
  const backBottom = side === 'left' ? [x0, y1] : [x1, y1];
  // Ease u so depth compresses toward the back wall.
  const uu = 1 - Math.pow(1 - u, 1.6);
  const top = lerpPt(frontTop, backTop, uu);
  const bottom = lerpPt(frontBottom, backBottom, uu);
  return lerpPt(top, bottom, v);
}

export function wallQuad(side, back, u0, u1, v0, v1) {
  return [wallPoint(side, back, u0, v0), wallPoint(side, back, u1, v0), wallPoint(side, back, u1, v1), wallPoint(side, back, u0, v1)];
}

/** Maps (u, w) on the floor (u: 0 front → 1 back, w: 0 left → 1 right) to screen. */
export function floorPoint(back, u, w) {
  const [x0, , x1, y1] = back;
  const uu = 1 - Math.pow(1 - u, 1.6);
  const left = lerpPt([0, H], [x0, y1], uu);
  const right = lerpPt([W, H], [x1, y1], uu);
  return lerpPt(left, right, w);
}

export function room(defs, back, { wall = '#efe8dc', wallBack, wallLeft, wallRight, floor = '#c9a37a', floorDark = '#a9845d', ceiling = '#f6f1e8', planks = true, baseboard = '#f8f4ec' } = {}) {
  const [x0, y0, x1, y1] = back;
  const vp = [(x0 + x1) / 2, (y0 + y1) / 2];
  let out = '';
  out += poly([[0, 0], [W, 0], [x1, y0], [x0, y0]], linear(defs, [[0, ceiling], [1, wallBack ?? wall]]));
  out += poly([[0, 0], [x0, y0], [x0, y1], [0, H]], wallLeft ?? linear(defs, [[0, shade(wall, -0.05)], [1, wall]], { x1: 0, y1: 0, x2: 1, y2: 0 }));
  out += poly([[W, 0], [x1, y0], [x1, y1], [W, H]], wallRight ?? linear(defs, [[0, shade(wall, -0.09)], [1, shade(wall, -0.03)]], { x1: 1, y1: 0, x2: 0, y2: 0 }));
  out += rect(x0, y0, x1 - x0, y1 - y0, wallBack ?? linear(defs, [[0, shade(wall, 0.02)], [1, shade(wall, -0.02)]]));
  // Floor
  const floorPoly = [[0, H], [x0, y1], [x1, y1], [W, H]];
  out += poly(floorPoly, linear(defs, [[0, floorDark], [1, floor]], { x1: 0, y1: 0, x2: 0, y2: 1 }));
  if (planks) {
    const c = clip(defs, `<polygon points="${pts(floorPoly)}"/>`);
    let lines = '';
    for (let i = -18; i <= 18; i += 1) {
      const bx = W / 2 + i * 120;
      const t = (H - y1) / (H - vp[1]);
      const tx = bx + (vp[0] - bx) * t;
      lines += line(bx, H, tx.toFixed(1), y1, floorDark, 1.6, { opacity: 0.45 });
    }
    for (let k = 1; k < 9; k += 1) {
      const u = k / 9;
      const yy = lerp(H, y1, 1 - Math.pow(1 - u, 1.6));
      lines += line(0, yy.toFixed(1), W, yy.toFixed(1), floorDark, 1, { opacity: 0.18 });
    }
    out += group(lines, { clipPath: c });
  }
  // Baseboards
  out += rect(x0, y1 - 12, x1 - x0, 12, baseboard);
  out += poly([wallPoint('left', back, 0, 1), wallPoint('left', back, 1, 1), [x0, y1 - 12], lerpPt(wallPoint('left', back, 0, 1), [0, H - 40], 1)], baseboard, { opacity: 0.9 });
  out += poly([wallPoint('right', back, 0, 1), wallPoint('right', back, 1, 1), [x1, y1 - 12], [W, H - 40]], baseboard, { opacity: 0.8 });
  return out;
}

/** Lighten (amt > 0) or darken (amt < 0) a hex color. */
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt)))));
  return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** View through a window: sky + soft foliage. Drawn into the given rectangle. */
export function windowView(defs, x, y, w, h, { time = 'day', seed = 31, foliage = true } = {}) {
  const sky =
    time === 'dusk'
      ? linear(defs, [[0, '#5d6f8f'], [0.6, '#d9a17f'], [1, '#f0c48f']])
      : time === 'sunset'
        ? linear(defs, [[0, '#9fb4c4'], [0.7, '#f1cfa5'], [1, '#f6d9b0']])
        : linear(defs, [[0, '#b9cfd8'], [1, '#eef1ea']]);
  let out = rect(x, y, w, h, sky);
  if (foliage) {
    const r = rng(seed);
    const c = clip(defs, rect(x, y, w, h, '#000'));
    let f = '';
    const base = y + h * (0.55 + r() * 0.15);
    for (let i = 0; i < Math.max(4, w / 40); i += 1) {
      const fx = x + r() * w;
      const fr = 30 + r() * Math.min(90, h * 0.3);
      f += circle(fx.toFixed(1), (base + r() * h * 0.2).toFixed(1), fr.toFixed(1), time === 'dusk' ? '#4b5a4a' : ['#8aa577', '#9db58a', '#7a966a'][i % 3], { opacity: 0.9 });
    }
    f += rect(x, base + h * 0.25, w, h, time === 'dusk' ? '#56664f' : '#9db27f');
    out += group(f, { clipPath: c });
  }
  // glass sheen
  out += poly([[x, y], [x + w * 0.35, y], [x + w * 0.05, y + h], [x, y + h]], '#ffffff', { opacity: 0.12 });
  return out;
}

/** Black-framed window with mullions over a view. */
export function framedWindow(defs, x, y, w, h, { cols = 2, rows = 1, frame = '#26272a', bar = 10, time = 'day', seed = 31, trim = null } = {}) {
  let out = '';
  if (trim) out += rect(x - 18, y - 18, w + 36, h + 36, trim);
  out += windowView(defs, x, y, w, h, { time, seed });
  out += rect(x, y, w, h, 'none', { stroke: frame, strokeWidth: bar });
  for (let c = 1; c < cols; c += 1) out += rect(x + (w / cols) * c - bar / 2, y, bar * 0.8, h, frame);
  for (let rr = 1; rr < rows; rr += 1) out += rect(x, y + (h / rows) * rr - bar / 2, w, bar * 0.8, frame);
  return out;
}

/** Hanging dome pendant with a warm glow. */
export function pendant(defs, x, topY, dropY, { r = 46, color = '#26272a', inner = '#f3d9a6', glow = true } = {}) {
  let out = line(x, topY, x, dropY - r * 0.55, '#3a3936', 2.5);
  if (glow) out += circle(x, dropY + r * 0.6, r * 2.6, radial(defs, [[0, '#ffe9bf', 0.55], [1, '#ffe9bf', 0]]));
  out += path(`M${x - r} ${dropY + r * 0.35} Q${x - r} ${dropY - r * 0.6} ${x} ${dropY - r * 0.62} Q${x + r} ${dropY - r * 0.6} ${x + r} ${dropY + r * 0.35} Z`, color);
  out += ellipse(x, dropY + r * 0.35, r, r * 0.16, inner);
  return out;
}

/** Books on a shelf: returns rectangles along [x, x + w]. */
export function books(x, shelfY, w, { maxH = 70, seed = 41, palette = ['#c9b79c', '#8c9b80', '#d8cbb5', '#6f7f65', '#b7845c', '#e6dccb', '#4e5e48', '#a39b8e'] } = {}) {
  const r = rng(seed);
  let out = '';
  let cx = x;
  while (cx < x + w - 12) {
    if (r() < 0.12) {
      // decorative vase or object
      const vw = 26 + r() * 20;
      out += path(`M${cx + 4} ${shelfY} q-4 ${-maxH * 0.5} ${vw * 0.3} ${-maxH * 0.62} h${vw * 0.4} q${vw * 0.3} ${maxH * 0.12} ${vw * 0.3} ${maxH * 0.62} Z`, ['#e9e2d6', '#c7b9a2', '#5c5a55'][Math.floor(r() * 3)]);
      cx += vw + 10;
      continue;
    }
    const bw = 8 + r() * 12;
    const bh = maxH * (0.62 + r() * 0.38);
    const lean = r() < 0.08 ? 8 : 0;
    out += path(`M${cx.toFixed(1)} ${shelfY} L${(cx + lean).toFixed(1)} ${(shelfY - bh).toFixed(1)} L${(cx + lean + bw).toFixed(1)} ${(shelfY - bh).toFixed(1)} L${(cx + bw).toFixed(1)} ${shelfY} Z`, palette[Math.floor(r() * palette.length)]);
    cx += bw + 1.5;
    if (r() < 0.1) cx += 18;
  }
  return out;
}

/** Framed abstract art print. */
export function artPrint(x, y, w, h, { frame = '#2f2e2b', mat = '#fbf8f2', seed = 51, palette = ['#c9b79c', '#8c9b80', '#e3d4bd', '#b5714f'] } = {}) {
  const r = rng(seed);
  let out = rect(x, y, w, h, frame) + rect(x + 6, y + 6, w - 12, h - 12, mat);
  const ix = x + w * 0.16;
  const iy = y + h * 0.16;
  const iw = w * 0.68;
  const ih = h * 0.68;
  out += rect(ix, iy, iw, ih, '#efe7da');
  out += circle(ix + iw * (0.3 + r() * 0.4), iy + ih * 0.4, Math.min(iw, ih) * 0.22, palette[0]);
  out += path(`M${ix} ${iy + ih * 0.75} Q${ix + iw * 0.4} ${iy + ih * 0.45} ${ix + iw} ${iy + ih * 0.7} L${ix + iw} ${iy + ih} L${ix} ${iy + ih} Z`, palette[1]);
  out += path(`M${ix} ${iy + ih * 0.88} Q${ix + iw * 0.6} ${iy + ih * 0.7} ${ix + iw} ${iy + ih * 0.9} L${ix + iw} ${iy + ih} L${ix} ${iy + ih} Z`, palette[3], { opacity: 0.7 });
  return out;
}
