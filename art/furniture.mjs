import { rect, poly, path, line, circle, ellipse, linear, radial, shade, rng, shadow, floorPoint } from './lib.mjs';

export function sunPatch(points, opacity = 0.16) {
  return poly(points, '#fff6dd', { opacity });
}

export function rug(defs, back, u0, u1, w0, w1, color, { border = null, pattern = 0 } = {}) {
  const q = [floorPoint(back, u0, w0), floorPoint(back, u1, w0), floorPoint(back, u1, w1), floorPoint(back, u0, w1)];
  let out = poly(q, color);
  if (border) {
    const inset = [floorPoint(back, u0 + 0.04, w0 + 0.03), floorPoint(back, u1 - 0.02, w0 + 0.03), floorPoint(back, u1 - 0.02, w1 - 0.03), floorPoint(back, u0 + 0.04, w1 - 0.03)];
    out += poly(inset, 'none', { stroke: border, strokeWidth: 4, opacity: 0.7 });
  }
  for (let i = 1; i <= pattern; i += 1) {
    const w = w0 + ((w1 - w0) * i) / (pattern + 1);
    const a = floorPoint(back, u0 + 0.03, w);
    const b = floorPoint(back, u1 - 0.03, w);
    out += line(a[0], a[1], b[0], b[1], shade(color, -0.12), 3, { opacity: 0.6 });
  }
  return out;
}

/** Sofa seen from behind (facing away from the viewer). */
export function sofaBack(defs, x, y, w, h, color) {
  let out = shadow(defs, x + w / 2, y + h, w * 0.52, 18, 0.28, 12);
  out += rect(x, y + h * 0.18, w, h * 0.82, linear(defs, [[0, color], [1, shade(color, -0.12)]]), { rx: 26 });
  out += rect(x - 14, y + h * 0.3, 70, h * 0.7, shade(color, -0.05), { rx: 24 });
  out += rect(x + w - 56, y + h * 0.3, 70, h * 0.7, shade(color, -0.08), { rx: 24 });
  // cushion tops peeking over
  for (let i = 0; i < 3; i += 1) out += rect(x + 40 + i * ((w - 80) / 3), y, (w - 80) / 3 - 10, h * 0.3, shade(color, 0.06), { rx: 18 });
  out += rect(x + 40, y + h * 0.22, w - 80, 4, shade(color, -0.15), { opacity: 0.5 });
  return out;
}

/** Sofa facing the viewer. */
export function sofaFront(defs, x, y, w, h, color, { pillows = ['#c9b79c', '#8c9b80'] } = {}) {
  let out = shadow(defs, x + w / 2, y + h, w * 0.54, 16, 0.25, 12);
  out += rect(x, y, w, h * 0.62, shade(color, -0.06), { rx: 22 });
  const n = Math.max(2, Math.round(w / 260));
  for (let i = 0; i < n; i += 1) out += rect(x + 50 + i * ((w - 100) / n), y + h * 0.08, (w - 100) / n - 10, h * 0.5, color, { rx: 18 });
  out += rect(x - 10, y + h * 0.42, w + 20, h * 0.42, linear(defs, [[0, shade(color, 0.05)], [1, shade(color, -0.08)]]), { rx: 18 });
  out += rect(x - 24, y + h * 0.25, 64, h * 0.6, shade(color, -0.02), { rx: 22 });
  out += rect(x + w - 40, y + h * 0.25, 64, h * 0.6, shade(color, -0.1), { rx: 22 });
  pillows.forEach((p, i) => {
    const px = i % 2 ? x + w - 210 - i * 20 : x + 70 + i * 20;
    out += rect(px, y + h * 0.18, 130, 110, p, { rx: 22, transform: `rotate(${i % 2 ? 6 : -6} ${px + 65} ${y + h * 0.3})` });
  });
  out += rect(x + 10, y + h * 0.84, 12, h * 0.16, '#3a3029') + rect(x + w - 22, y + h * 0.84, 12, h * 0.16, '#3a3029');
  return out;
}

export function armchair(defs, x, y, s, color) {
  let out = shadow(defs, x + s / 2, y + s * 1.02, s * 0.55, 14, 0.25, 10);
  out += rect(x + s * 0.1, y, s * 0.8, s * 0.62, shade(color, -0.05), { rx: 30 });
  out += rect(x, y + s * 0.4, s, s * 0.45, linear(defs, [[0, color], [1, shade(color, -0.1)]]), { rx: 24 });
  out += rect(x - 8, y + s * 0.3, s * 0.22, s * 0.55, shade(color, -0.02), { rx: 20 });
  out += rect(x + s * 0.86, y + s * 0.3, s * 0.22, s * 0.55, shade(color, -0.1), { rx: 20 });
  out += rect(x + s * 0.12, y + s * 0.85, 10, s * 0.17, '#3a3029') + rect(x + s * 0.82, y + s * 0.85, 10, s * 0.17, '#3a3029');
  return out;
}

export function coffeeTable(defs, cx, y, w, color = '#b98a5f') {
  let out = shadow(defs, cx, y + 70, w * 0.5, 14, 0.2, 10);
  out += ellipse(cx, y, w / 2, w * 0.12, shade(color, 0.08));
  out += path(`M${cx - w / 2} ${y} v22 a${w / 2} ${w * 0.12} 0 0 0 ${w} 0 v-22 a${w / 2} ${w * 0.12} 0 0 1 ${-w} 0 Z`, shade(color, -0.12));
  out += rect(cx - w * 0.3, y + 22, 14, 50, shade(color, -0.2)) + rect(cx + w * 0.3 - 14, y + 22, 14, 50, shade(color, -0.2));
  out += ellipse(cx - w * 0.12, y - 12, 40, 12, '#e9e2d6') + rect(cx + w * 0.08, y - 40, 50, 34, '#5f7c55', { rx: 8 });
  return out;
}

export function tableLamp(defs, x, baseY, { h = 160, base = '#d6cbb8', shadeColor = '#f3ede2', on = true } = {}) {
  let out = '';
  if (on) out += circle(x, baseY - h * 0.75, h * 1.1, radial(defs, [[0, '#ffe7b5', 0.5], [1, '#ffe7b5', 0]]));
  out += ellipse(x, baseY - h * 0.18, h * 0.16, h * 0.2, base) + rect(x - 3, baseY - h * 0.55, 6, h * 0.4, '#8a7a66');
  out += path(`M${x - h * 0.28} ${baseY - h * 0.55} L${x - h * 0.18} ${baseY - h} L${x + h * 0.18} ${baseY - h} L${x + h * 0.28} ${baseY - h * 0.55} Z`, shadeColor);
  return out;
}

export function floorLamp(defs, x, floorY, h = 520, on = true) {
  let out = '';
  if (on) out += circle(x, floorY - h * 0.9, 180, radial(defs, [[0, '#ffe7b5', 0.45], [1, '#ffe7b5', 0]]));
  out += rect(x - 3, floorY - h * 0.85, 6, h * 0.85, '#2b2a28') + ellipse(x, floorY, 40, 8, '#2b2a28');
  out += path(`M${x - 60} ${floorY - h * 0.82} L${x - 40} ${floorY - h} L${x + 40} ${floorY - h} L${x + 60} ${floorY - h * 0.82} Z`, '#efe7d8');
  return out;
}

/** Shaker-style cabinet run seen straight on. */
export function cabinets(defs, x, y, w, h, color, { doors = 4, pull = '#c9a15b', drawers = true } = {}) {
  let out = rect(x, y, w, h, color);
  const dw = w / doors;
  for (let i = 0; i < doors; i += 1) {
    const dx = x + i * dw;
    out += rect(dx + 6, y + 8, dw - 12, h - 16, 'none', { stroke: shade(color, -0.18), strokeWidth: 3 });
    out += rect(dx + 18, y + 20, dw - 36, h - 40, 'none', { stroke: shade(color, 0.12), strokeWidth: 2, opacity: 0.6 });
    if (drawers && h > 160) out += line(dx + 6, y + h * 0.28, dx + dw - 6, y + h * 0.28, shade(color, -0.18), 3);
    out += rect(dx + dw / 2 - 14, y + (drawers && h > 160 ? h * 0.14 : 30), 28, 5, pull, { rx: 2 });
  }
  out += rect(x, y + h - 14, w, 14, shade(color, -0.25));
  return out;
}

export function stool(defs, x, seatY, floorY, { seat = '#b98a5f', legs = '#26272a' } = {}) {
  let out = shadow(defs, x, floorY, 50, 9, 0.25, 6);
  out += line(x - 34, seatY + 16, x - 46, floorY, legs, 6) + line(x + 34, seatY + 16, x + 46, floorY, legs, 6);
  out += line(x - 14, seatY + 16, x - 18, floorY - 4, legs, 5) + line(x + 14, seatY + 16, x + 18, floorY - 4, legs, 5);
  out += line(x - 42, (seatY + floorY) / 2 + 40, x + 42, (seatY + floorY) / 2 + 40, legs, 4);
  out += rect(x - 48, seatY, 96, 22, seat, { rx: 11 }) + rect(x - 48, seatY + 14, 96, 8, shade(seat, -0.2), { rx: 4 });
  return out;
}

export function diningChairBack(defs, x, y, w, h, color = '#e5dccd', frame = '#9b7350') {
  let out = shadow(defs, x + w / 2, y + h, w * 0.5, 10, 0.2, 8);
  out += rect(x + 8, y + h * 0.5, 9, h * 0.5, frame) + rect(x + w - 17, y + h * 0.5, 9, h * 0.5, frame);
  out += rect(x, y, w, h * 0.58, color, { rx: 18 });
  out += rect(x, y + h * 0.44, w, 16, shade(color, -0.1), { rx: 8 });
  return out;
}

export function diningChairFront(x, y, w, h, color = '#e5dccd', frame = '#9b7350') {
  return rect(x + w * 0.1, y, w * 0.8, h * 0.45, shade(color, -0.04), { rx: 16 }) + rect(x, y + h * 0.42, w, h * 0.14, color, { rx: 8 }) + rect(x + 8, y + h * 0.55, 8, h * 0.45, frame) + rect(x + w - 16, y + h * 0.55, 8, h * 0.45, frame);
}

/** Open shelf with dishes, jars and plants. */
export function openShelf(x, y, w, { wood = '#b98a5f', seed = 61 } = {}) {
  const r = rng(seed);
  let out = '';
  let cx = x + 10;
  while (cx < x + w - 40) {
    const kind = r();
    if (kind < 0.35) {
      // stacked plates
      for (let i = 0; i < 4; i += 1) out += ellipse(cx + 30, y - 6 - i * 7, 32, 5, i % 2 ? '#f4f0e8' : '#e6dfd2');
      cx += 76;
    } else if (kind < 0.6) {
      out += rect(cx, y - 56, 30, 56, '#e9e2d6', { rx: 6 }) + rect(cx + 34, y - 44, 26, 44, '#d4c8b4', { rx: 6 });
      cx += 72;
    } else if (kind < 0.8) {
      out += path(`M${cx} ${y} q-6 -40 16 -46 h18 q22 6 16 46 Z`, '#c7b9a2') + ellipse(cx + 24, y - 60, 30, 16, '#6f8c5a') + ellipse(cx + 12, y - 70, 14, 22, '#86a06b');
      cx += 70;
    } else {
      out += rect(cx, y - 40, 50, 40, '#f4f0e8', { rx: 4 }) + rect(cx + 6, y - 34, 38, 6, '#c9b79c');
      cx += 64;
    }
  }
  out += rect(x, y, w, 14, wood) + rect(x, y + 12, w, 4, shade(wood, -0.25));
  return out;
}

export function bed(defs, x, y, w, { headboard = '#d9cfbf', duvet = '#f6f3ee', throwColor = '#8c9b80', pillows = ['#ffffff', '#efe7da', '#c9b79c'] } = {}) {
  // headboard
  let out = path(`M${x} ${y + 260} L${x} ${y + 40} Q${x} ${y} ${x + 40} ${y} L${x + w - 40} ${y} Q${x + w} ${y} ${x + w} ${y + 40} L${x + w} ${y + 260} Z`, headboard);
  for (let i = 1; i < 6; i += 1) out += line(x + (w / 6) * i, y + 18, x + (w / 6) * i, y + 250, shade(headboard, -0.08), 3);
  // pillows
  const pw = (w - 60) / 2;
  out += rect(x + 30, y + 150, pw - 6, 110, pillows[0], { rx: 30 }) + rect(x + 36 + pw, y + 150, pw - 6, 110, pillows[0], { rx: 30 });
  out += rect(x + 70, y + 190, pw - 70, 90, pillows[1], { rx: 26 }) + rect(x + pw + 50, y + 190, pw - 70, 90, pillows[1], { rx: 26 });
  out += rect(x + w / 2 - 80, y + 215, 160, 80, pillows[2], { rx: 22 });
  // mattress top (perspective toward the viewer)
  const top = y + 280;
  const foot = y + 520;
  out += shadow(defs, x + w / 2, foot + 120, w * 0.68, 22, 0.25, 14);
  out += poly([[x - 10, top], [x + w + 10, top], [x + w + 90, foot], [x - 90, foot]], linear(defs, [[0, duvet], [1, shade(duvet, -0.06)]]));
  out += poly([[x - 90, foot], [x + w + 90, foot], [x + w + 90, foot + 110], [x - 90, foot + 110]], shade(duvet, -0.1));
  // folded throw
  out += poly([[x - 50, foot - 140], [x + w + 50, foot - 140], [x + w + 90, foot], [x - 90, foot]], throwColor);
  out += poly([[x - 90, foot], [x + w + 90, foot], [x + w + 90, foot + 70], [x - 90, foot + 70]], shade(throwColor, -0.12));
  out += rect(x - 80, foot + 110, 14, 40, '#5c4a3b') + rect(x + w + 66, foot + 110, 14, 40, '#5c4a3b');
  return out;
}

export function nightstand(defs, x, y, w, h, color = '#b98a5f') {
  return shadow(defs, x + w / 2, y + h, w * 0.6, 10, 0.2, 8) + rect(x, y, w, h, color) + line(x + 8, y + h * 0.45, x + w - 8, y + h * 0.45, shade(color, -0.2), 3) + rect(x + w / 2 - 12, y + h * 0.22, 24, 5, '#c9a15b', { rx: 2 });
}

export function curtain(x, y, w, h, color = '#f1ebe0') {
  let out = rect(x, y, w, h, color);
  for (let i = 1; i < 6; i += 1) out += line(x + (w / 6) * i, y, x + (w / 6) * i + 4, y + h, shade(color, -0.08), 4);
  return out;
}

export function ceilingFan(x, y, s = 1) {
  return (
    line(x, y - 120 * s, x, y, '#2b2a28', 4) +
    ellipse(x, y + 8, 40 * s, 16 * s, '#2b2a28') +
    path(`M${x} ${y + 6} L${x - 260 * s} ${y - 10 * s} L${x - 250 * s} ${y + 20 * s} Z`, '#8a6a4c') +
    path(`M${x} ${y + 6} L${x + 260 * s} ${y - 10 * s} L${x + 250 * s} ${y + 20 * s} Z`, '#7b5d42') +
    path(`M${x} ${y + 6} L${x - 70 * s} ${y + 34 * s} L${x + 60 * s} ${y + 40 * s} Z`, '#6f543c')
  );
}
