import {
  W,
  H,
  rect,
  poly,
  path,
  line,
  circle,
  ellipse,
  group,
  linear,
  radial,
  blur,
  clip,
  shadow,
  scene,
  tree,
  willow,
  shrub,
  grasses,
  flowers,
  windowView,
  rng,
  shade,
} from './lib.mjs';

const CHARCOAL = '#2c2d2f';
const FRAME = '#232427';

function sky(defs, time) {
  if (time === 'dusk') {
    return (
      rect(0, 0, W, H, linear(defs, [[0, '#2f3b57'], [0.45, '#6d6a86'], [0.75, '#d49a86'], [1, '#f2c08e']])) +
      circle(1500, 760, 520, radial(defs, [[0, '#f7c98f', 0.55], [1, '#f7c98f', 0]]))
    );
  }
  return (
    rect(0, 0, W, H, linear(defs, [[0, '#b3c9d2'], [0.5, '#e4e2d3'], [0.8, '#f3dcb4'], [1, '#f5d5a6']])) +
    circle(260, 240, 620, radial(defs, [[0, '#fff3d6', 0.85], [0.4, '#fbe7bf', 0.35], [1, '#fbe7bf', 0]])) +
    ellipse(1350, 190, 260, 26, '#ffffff', { opacity: 0.35, filter: blur(defs, 18) }) +
    ellipse(620, 120, 200, 18, '#ffffff', { opacity: 0.3, filter: blur(defs, 16) })
  );
}

function treeLine(defs, y, time, seed = 4) {
  const r = rng(seed);
  const far = time === 'dusk' ? '#4d566a' : '#a7b5a6';
  const near = time === 'dusk' ? '#3e4a50' : '#8fa38c';
  let out = '';
  for (let i = 0; i < 40; i += 1) out += circle(i * 52 + r() * 30, y - 20 - r() * 60, 60 + r() * 50, far, { opacity: 0.9 });
  out += rect(0, y - 40, W, 200, far);
  for (let i = 0; i < 30; i += 1) out += circle(i * 70 + r() * 40, y + 20 - r() * 50, 50 + r() * 40, near);
  out += rect(0, y + 10, W, 200, near);
  return out;
}

function lawn(defs, y, time) {
  const fill = time === 'dusk' ? linear(defs, [[0, '#56664a'], [1, '#3f4d38']]) : linear(defs, [[0, '#a2b47c'], [1, '#7d955e']]);
  return rect(0, y, W, H - y, fill);
}

function boardAndBatten(x, y, w, h, color, spacing = 22) {
  let out = '';
  for (let bx = x + spacing / 2; bx < x + w; bx += spacing) out += rect(bx, y, 3, h, color);
  return out;
}

function standingSeam(points, fill, seamColor, spacing = 26, defs) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const c = clip(defs, `<polygon points="${points.map((p) => p.join(',')).join(' ')}"/>`);
  let seams = '';
  for (let x = Math.min(...xs); x < Math.max(...xs); x += spacing) seams += rect(x, Math.min(...ys), 2, Math.max(...ys) - Math.min(...ys), seamColor);
  return poly(points, fill) + group(seams, { clipPath: c, opacity: 0.55 });
}

function glassPane(defs, x, y, w, h, time, seed) {
  if (time === 'dusk') {
    return rect(x, y, w, h, linear(defs, [[0, '#f9d79a'], [1, '#e8a95f']])) + rect(x, y, w, h * 0.35, '#fff3d4', { opacity: 0.25 });
  }
  return windowView(defs, x, y, w, h, { time: 'sunset', seed, foliage: false }) + poly([[x, y + h], [x + w, y + h * 0.35], [x + w, y + h]], '#7d8c80', { opacity: 0.35 });
}

function blackWindow(defs, x, y, w, h, time, { cols = 2, rows = 2, seed = 3 } = {}) {
  let out = rect(x - 10, y - 10, w + 20, h + 20, FRAME);
  out += glassPane(defs, x, y, w, h, time, seed);
  for (let c = 1; c < cols; c += 1) out += rect(x + (w / cols) * c - 3, y, 6, h, FRAME);
  for (let r = 1; r < rows; r += 1) out += rect(x, y + (h / rows) * r - 3, w, 6, FRAME);
  return out;
}

function glow(defs, cx, cy, r, color = '#ffcf8a', opacity = 0.55) {
  return circle(cx, cy, r, radial(defs, [[0, color, opacity], [1, color, 0]]));
}

/** The Willow House: contemporary farmhouse, front elevation. */
export function farmhouseFront({ time = 'day' } = {}) {
  const defs = [];
  const dusk = time === 'dusk';
  const ground = 935;
  const wall = dusk ? '#d9d4ca' : '#f6f2ea';
  const batten = dusk ? '#c9c3b8' : '#e7e1d5';
  const wallGrad = linear(defs, [[0, shade(wall, 0.02)], [1, shade(wall, -0.04)]]);
  let b = sky(defs, time);
  b += treeLine(defs, 780, time);
  b += lawn(defs, 880, time);

  // Driveway and walkway
  b += poly([[300, ground], [700, ground], [820, H], [-120, H]], dusk ? '#8d8b86' : linear(defs, [[0, '#ddd6ca'], [1, '#cfc7b8']]));
  b += poly([[995, 955], [1065, 955], [1150, H], [910, H]], dusk ? '#9a958c' : '#e3dccf');
  for (let i = 0; i < 7; i += 1) {
    const t = i / 7;
    const y = 955 + (H - 955) * (t * t * 0.8 + t * 0.2);
    b += line(995 - 85 * ((y - 955) / (H - 955)), y, 1065 + 85 * ((y - 955) / (H - 955)), y, dusk ? '#7d7a73' : '#cfc6b6', 3);
  }

  // Background deciduous tree (right) behind wing
  b += tree(defs, 1790, ground - 10, { h: 640, w: 420, seed: 7, greens: dusk ? ['#33433a', '#3f5144', '#4d5f4d'] : ['#5f7d52', '#749266', '#93ad7c'] });

  // ---- Garage wing (left) -----------------------------------------------------
  b += rect(250, 630, 510, ground - 630, wallGrad);
  b += boardAndBatten(250, 630, 510, ground - 630, batten);
  // roof
  b += poly([[225, 640], [785, 640], [745, 470], [305, 470]], dusk ? '#2a2b2e' : linear(defs, [[0, '#3b3c3f'], [1, '#2a2b2d']]));
  b += rect(220, 636, 570, 12, CHARCOAL);
  b += rect(250, 648, 510, 22, '#000', { opacity: 0.12 });
  // garage door: cedar slats
  const doorX = 320;
  const doorW = 380;
  b += rect(doorX - 12, 725, doorW + 24, ground - 725, CHARCOAL);
  b += rect(doorX, 737, doorW, ground - 737, dusk ? '#8a6448' : linear(defs, [[0, '#c48f62'], [1, '#a8774f']]));
  for (let y = 752; y < ground; y += 15) b += rect(doorX, y, doorW, 2.5, '#7b5539', { opacity: 0.5 });
  b += rect(doorX, 737, doorW, 20, '#000', { opacity: 0.12 });
  // garage lanterns
  for (const lx of [290, 730]) {
    if (dusk) b += glow(defs, lx, 760, 70);
    b += rect(lx - 9, 742, 18, 30, FRAME) + rect(lx - 6, 746, 12, 20, dusk ? '#ffd890' : '#d8cdb3');
  }

  // ---- Right wing --------------------------------------------------------------
  b += rect(1300, 650, 370, ground - 650, wallGrad);
  b += boardAndBatten(1300, 650, 370, ground - 650, batten);
  // stone wainscot
  const stone = dusk ? '#8e877d' : '#b9afa0';
  b += rect(1300, 840, 370, ground - 840, stone);
  const sr = rng(19);
  for (let y = 846; y < ground - 6; y += 22) {
    for (let x = 1300 + (y % 44 ? 0 : 18); x < 1665; x += 40 + sr() * 30) {
      b += rect(x, y, 34 + sr() * 26, 16, shade(stone, (sr() - 0.5) * 0.18), { rx: 4 });
    }
  }
  b += rect(1296, 834, 378, 8, shade(stone, -0.15));
  b += standingSeam([[1280, 660], [1690, 660], [1690, 618], [1290, 588]], dusk ? '#2a2b2e' : '#36373a', '#55575c', 26, defs);
  b += rect(1300, 660, 370, 18, '#000', { opacity: 0.1 });
  b += blackWindow(defs, 1385, 700, 220, 120, time, { cols: 3, rows: 1, seed: 8 });

  // ---- Main two-story gable ------------------------------------------------------
  b += path(`M760 ${ground} L760 440 L1030 230 L1300 440 L1300 ${ground} Z`, wallGrad);
  const mainClip = clip(defs, `<path d="M760 ${ground} L760 440 L1030 230 L1300 440 L1300 ${ground} Z"/>`);
  b += group(boardAndBatten(760, 230, 540, ground - 230, batten), { clipPath: mainClip });
  // rake trim (thick charcoal fascia) and roof edge
  b += path('M728 458 L1030 208 L1332 458 L1312 470 L1030 240 L748 470 Z', CHARCOAL);
  b += path('M760 470 L1030 247 L1300 470 L1300 500 L1030 277 L760 500 Z', '#000', { opacity: 0.08 });
  // gable vent
  b += rect(1000, 315, 60, 70, FRAME);
  for (let y = 325; y < 380; y += 10) b += rect(1006, y, 48, 4, '#4a4b4e');
  // upper windows
  b += blackWindow(defs, 845, 480, 140, 170, time, { seed: 12 });
  b += blackWindow(defs, 1075, 480, 140, 170, time, { seed: 13 });
  // main shadow cast onto right wing
  b += poly([[1300, 650], [1360, 650], [1300, 760]], '#000', { opacity: 0.08 });

  // Porch roof (standing seam) + posts
  b += standingSeam([[705, 690], [1355, 690], [1335, 640], [725, 640]], dusk ? '#2a2b2e' : '#38393c', '#5a5c60', 24, defs);
  b += rect(700, 688, 660, 12, CHARCOAL);
  b += rect(760, 700, 540, 40, '#000', { opacity: 0.1 });
  // lower windows and door
  b += blackWindow(defs, 800, 740, 150, 160, time, { seed: 14 });
  b += blackWindow(defs, 1110, 740, 150, 160, time, { seed: 15 });
  b += rect(978, 742, 104, ground - 742, FRAME);
  b += rect(990, 754, 80, ground - 760, dusk ? '#3a3027' : '#2c2a28');
  b += glassPane(defs, 1003, 768, 54, 100, time, 16);
  b += circle(1062, 850, 4, '#c9a15b');
  for (const lx of [962, 1098]) {
    if (dusk) b += glow(defs, lx, 790, 80);
    b += rect(lx - 9, 772, 18, 34, FRAME) + rect(lx - 6, 777, 12, 23, dusk ? '#ffd890' : '#d8cdb3');
  }
  // cedar posts
  for (const px of [722, 1328]) {
    b += rect(px - 12, 700, 24, ground - 700, dusk ? '#7d5a40' : linear(defs, [[0, '#b98458'], [1, '#9b6c45']], { x1: 0, y1: 0, x2: 1, y2: 0 }));
    b += rect(px - 16, ground - 18, 32, 18, '#9a9184');
  }
  // porch deck + steps
  b += rect(700, ground, 660, 14, dusk ? '#8e877d' : '#b7ad9c');
  b += rect(960, ground + 14, 140, 10, dusk ? '#a09a90' : '#cfc7b8');

  // Foundation shadow
  b += rect(240, ground - 6, 1440, 10, '#000', { opacity: 0.12 });

  // ---- Landscaping ------------------------------------------------------------------
  const greens = dusk ? ['#2f3d31', '#3c4c3c', '#4d5f48'] : ['#56724a', '#6c8a5b', '#8ba571'];
  b += shrub(740, ground + 26, 230, 70, greens, 21);
  b += shrub(1100, ground + 26, 230, 70, greens, 22);
  b += shrub(1310, ground + 20, 360, 64, greens, 23);
  b += grasses(1180, ground + 34, 140, 80, dusk ? '#7b7650' : '#c2b781', 24);
  b += grasses(810, ground + 34, 140, 80, dusk ? '#7b7650' : '#c2b781', 25);
  if (!dusk) {
    b += flowers(750, ground + 40, 200, 30, undefined, 26, 26);
    b += flowers(1120, ground + 40, 200, 30, undefined, 27, 26);
  }
  // foreground shrubs at canvas bottom corners
  b += shrub(1500, H + 20, 520, 150, greens, 28);
  b += grasses(1650, H, 260, 160, dusk ? '#7b7650' : '#c8bc86', 29);

  // Willow, framing the left side
  b += willow(defs, 70, 1010, { h: 900, w: 640, seed: 11, dusk });
  if (!dusk) b += poly([[120, 1010], [520, 1000], [900, 1060], [300, 1080]], '#2a2520', { opacity: 0.08, filter: blur(defs, 18) });

  if (dusk) {
    // landscape uplights
    for (const lx of [780, 1240, 1500]) b += glow(defs, lx, ground + 10, 110, '#ffd48a', 0.35);
    b += rect(0, 0, W, H, '#1b2340', { opacity: 0.12 });
  } else {
    // warm golden-hour wash
    b += rect(0, 0, W, H, linear(defs, [[0, '#ffd99a', 0.18], [0.6, '#ffd99a', 0], [1, '#000', 0.05]], { x1: 0, y1: 0, x2: 1, y2: 1 }));
  }
  return scene(defs, b, { vignette: dusk ? 0.32 : 0.16 });
}

/** The Willow House: backyard with covered patio. */
export function farmhouseBack() {
  const defs = [];
  const ground = 860;
  const wall = '#f5f1e9';
  const batten = '#e6e0d4';
  let b = sky(defs, 'day');
  b += treeLine(defs, 700, 'day', 8);
  b += lawn(defs, 820, 'day');
  // house rear
  b += rect(560, 470, 860, ground - 470, linear(defs, [[0, wall], [1, shade(wall, -0.05)]]));
  b += boardAndBatten(560, 470, 860, ground - 470, batten);
  b += path('M520 488 L990 250 L1460 488 L1440 500 L990 282 L540 500 Z', CHARCOAL);
  b += path(`M560 500 L990 282 L1420 500 L1420 470 L990 252 L560 470 Z`, linear(defs, [[0, wall], [1, wall]]));
  b += group(boardAndBatten(560, 250, 860, 250, batten), { clipPath: clip(defs, '<path d="M560 500 L990 282 L1420 500 Z"/>') });
  b += blackWindow(defs, 720, 520, 130, 120, 'day', { seed: 40 });
  b += blackWindow(defs, 1130, 520, 130, 120, 'day', { seed: 41 });
  // covered patio roof
  b += standingSeam([[480, 700], [1500, 700], [1470, 640], [510, 640]], '#36373a', '#5a5c60', 26, defs);
  b += rect(470, 698, 1040, 14, CHARCOAL);
  b += rect(560, 712, 860, ground - 712, '#000', { opacity: 0.16 });
  // sliding doors
  b += rect(700, 735, 580, ground - 735, FRAME);
  for (let i = 0; i < 4; i += 1) b += rect(712 + i * 142, 747, 130, ground - 755, linear(defs, [[0, '#8fa1a3'], [1, '#5f6f70']]));
  b += rect(712, 747, 556, 40, '#fff', { opacity: 0.08 });
  // posts
  for (const px of [500, 990, 1480]) b += rect(px - 12, 712, 24, ground - 712 + 20, linear(defs, [[0, '#b98458'], [1, '#9b6c45']], { x1: 0, y1: 0, x2: 1, y2: 0 }));
  // patio pavers
  b += poly([[470, ground], [1510, ground], [1600, ground + 70], [380, ground + 70]], '#d6cebf');
  for (let x = 400; x < 1600; x += 70) b += line(x, ground + 70, x + (990 - x) * 0.08, ground, '#c4baa8', 2);
  b += line(420, ground + 35, 1560, ground + 35, '#c4baa8', 2);
  // patio furniture silhouettes
  b += rect(640, ground - 40, 200, 50, '#e9e2d6', { rx: 14 }) + rect(640, ground - 70, 200, 34, '#dcd2c2', { rx: 14 });
  b += rect(1120, ground - 46, 180, 10, '#7b5a40') + rect(1130, ground - 36, 8, 46, '#7b5a40') + rect(1282, ground - 36, 8, 46, '#7b5a40');
  b += pottedRound(1380, ground + 10, 70);
  // garden beds: curved
  b += path(`M0 980 C 300 930 600 960 760 1010 C 900 1050 1100 1040 1240 990 C 1480 910 1700 930 1920 990 L1920 1080 C 1700 1020 1480 1010 1240 1080 C 1100 1130 900 1140 760 1100 C 600 1050 300 1020 0 1070 Z`, '#6f5a47');
  b += shrub(-40, 1010, 520, 110, ['#56724a', '#6c8a5b', '#8ba571'], 42);
  b += flowers(40, 1020, 560, 80, ['#f2e6c9', '#e9b8a0', '#c9a0c4', '#f3d27a', '#ffffff'], 43, 70);
  b += shrub(1330, 1010, 640, 120, ['#56724a', '#6c8a5b', '#8ba571'], 44);
  b += flowers(1340, 1020, 560, 90, ['#f2e6c9', '#e9b8a0', '#c9a0c4', '#f3d27a', '#ffffff'], 45, 70);
  b += grasses(780, 1080, 420, 110, '#c2b781', 46);
  // trees
  b += tree(defs, 190, 900, { h: 680, w: 460, seed: 47 });
  b += tree(defs, 1760, 880, { h: 620, w: 420, seed: 48 });
  // horizontal wood fence on sides
  for (let y = 700; y < 880; y += 22) {
    b += rect(0, y, 380, 14, '#a07a58', { opacity: 0.9 });
    b += rect(1600, y, 320, 14, '#a07a58', { opacity: 0.9 });
  }
  b += tree(defs, 140, 1150, { h: 260, w: 220, seed: 49 });
  b += rect(0, 0, W, H, linear(defs, [[0, '#ffd99a', 0.14], [0.6, '#ffd99a', 0]], { x1: 0, y1: 0, x2: 1, y2: 1 }));
  return scene(defs, b);
}

function pottedRound(x, y, s) {
  return path(`M${x - s * 0.4} ${y - s * 0.6} h${s * 0.8} l-${s * 0.1} ${s * 0.6} h-${s * 0.6} Z`, '#cbbda5') + circle(x, y - s * 0.9, s * 0.45, '#6c8a5b') + circle(x - s * 0.15, y - s, s * 0.25, '#8ba571');
}

/** The Linden Townhome: row of modern townhomes. */
export function townhomes() {
  const defs = [];
  const ground = 1010;
  let b = rect(0, 0, W, H, linear(defs, [[0, '#bccbd1'], [0.7, '#ece4d4'], [1, '#f2dfc0']]));
  b += circle(1650, 260, 500, radial(defs, [[0, '#fff1d1', 0.7], [1, '#fff1d1', 0]]));
  // distant buildings
  for (let i = 0; i < 12; i += 1) b += rect(i * 170 - 40, 520 + (i % 3) * 40, 150, 600, '#c9cfcc', { opacity: 0.7 });
  const units = [
    { x: 160, brick: '#8a5a4a', accent: '#c49a6c' },
    { x: 700, brick: '#3f3e3c', accent: '#c49a6c' },
    { x: 1240, brick: '#9c6d58', accent: '#d5b38a' },
  ];
  for (const [i, u] of units.entries()) {
    const w = 540;
    const top = 250 + (i === 1 ? -30 : 0);
    b += rect(u.x, top, w, ground - top, u.brick);
    // brick texture
    const br = rng(60 + i);
    for (let y = top + 8; y < ground; y += 16) {
      for (let x = u.x + (Math.floor(y / 16) % 2 ? 0 : 20); x < u.x + w; x += 40) b += rect(x, y, 36, 12, shade(u.brick, (br() - 0.5) * 0.14));
    }
    // wood cladding panel
    b += rect(u.x + w - 190, top, 190, ground - top, linear(defs, [[0, u.accent], [1, shade(u.accent, -0.15)]]));
    for (let x = u.x + w - 190; x < u.x + w; x += 14) b += rect(x, top, 2, ground - top, shade(u.accent, -0.3), { opacity: 0.5 });
    // parapet + rooftop rail
    b += rect(u.x - 10, top - 14, w + 20, 16, CHARCOAL);
    b += rect(u.x + 20, top - 80, w - 40, 4, CHARCOAL);
    for (let x = u.x + 20; x <= u.x + w - 20; x += 40) b += rect(x, top - 80, 3, 66, CHARCOAL);
    if (i === 1) b += tree(defs, u.x + 120, top - 14, { h: 120, w: 110, seed: 70 }) + rect(u.x + 260, top - 60, 120, 46, '#d8cdb8', { rx: 10 });
    // windows (3 floors)
    for (let f = 0; f < 3; f += 1) {
      const wy = top + 60 + f * 230;
      b += rect(u.x + 40, wy - 10, 290, 170, FRAME);
      b += windowView(defs, u.x + 48, wy - 2, 274, 154, { time: 'sunset', seed: 80 + i * 3 + f, foliage: false });
      b += rect(u.x + 182, wy - 2, 6, 154, FRAME);
      b += rect(u.x + 48, wy + 118, 274, 6, FRAME);
    }
    // entry door
    b += rect(u.x + 380, ground - 210, 110, 210, FRAME);
    b += rect(u.x + 392, ground - 198, 86, 198, '#2c2a28');
    b += rect(u.x + 404, ground - 186, 24, 150, glassFill(defs));
    b += rect(u.x + 360, ground - 236, 150, 14, CHARCOAL);
    b += rect(u.x + 380, ground, 110, 12, '#c9c1b4');
  }
  // sidewalk + street
  b += rect(0, ground, W, 80, '#d9d2c6');
  for (let x = 0; x < W; x += 120) b += line(x, ground, x - 30, ground + 80, '#c8bfb1', 2);
  b += rect(0, ground + 80, W, 14, '#bdb4a6');
  b += rect(0, ground + 94, W, H - ground - 94, linear(defs, [[0, '#8d8a85'], [1, '#76736e']]));
  b += rect(0, ground + 180, W, 6, '#e8e1d4', { opacity: 0.6 });
  // street trees + planters
  for (const [i, x] of [100, 680, 1220, 1780].entries()) b += tree(defs, x, ground + 40, { h: 520, w: 300, seed: 90 + i });
  b += shrub(200, ground + 2, 260, 50, undefined, 95) + shrub(1300, ground + 2, 260, 50, undefined, 96);
  b += rect(0, 0, W, H, linear(defs, [[0, '#ffd99a', 0.12], [0.6, '#ffd99a', 0]], { x1: 1, y1: 0, x2: 0, y2: 1 }));
  return scene(defs, b);
}

function glassFill(defs) {
  return linear(defs, [[0, '#9fb2b6'], [1, '#e7ddcb']]);
}

/** Hawthorne Ridge Residence: transitional two-story with stone and three-car garage. */
export function transitional() {
  const defs = [];
  const ground = 930;
  const siding = '#c9c6bd';
  const sidingDark = '#b8b4aa';
  const trim = '#f4f1ea';
  const stone = '#a99f90';
  let b = sky(defs, 'day');
  b += treeLine(defs, 760, 'day', 12);
  // big trees behind
  b += tree(defs, 300, 820, { h: 760, w: 520, seed: 101 });
  b += tree(defs, 1640, 820, { h: 820, w: 560, seed: 102 });
  b += lawn(defs, 860, 'day');
  b += poly([[180, ground], [760, ground], [900, H], [-200, H]], linear(defs, [[0, '#ddd6ca'], [1, '#cfc7b8']]));
  // garage wing
  b += rect(120, 600, 660, ground - 600, siding);
  for (let y = 606; y < ground; y += 18) b += rect(120, y, 660, 2, sidingDark);
  b += poly([[90, 610], [810, 610], [720, 470], [180, 470]], '#4a4b4e');
  b += rect(84, 606, 732, 12, '#3a3b3e');
  for (let i = 0; i < 3; i += 1) {
    const gx = 160 + i * 205;
    b += rect(gx - 8, 720, 186, ground - 720, trim);
    b += rect(gx, 728, 170, ground - 728, '#e9e5dc');
    for (let y = 760; y < ground; y += 34) b += rect(gx, y, 170, 3, '#d3cdc1');
    for (let x = 0; x < 4; x += 1) b += rect(gx + 12 + x * 40, 740, 30, 18, glassFill(defs));
  }
  // main house
  b += rect(780, 380, 900, ground - 380, siding);
  for (let y = 386; y < ground; y += 18) b += rect(780, y, 900, 2, sidingDark);
  // stone base and stone front gable
  b += rect(780, 800, 900, ground - 800, stone);
  b += path('M1060 ' + ground + ' L1060 430 L1250 270 L1440 430 L1440 ' + ground + ' Z', stone);
  const sr = rng(103);
  const stoneClip = clip(defs, `<path d="M1060 ${ground} L1060 430 L1250 270 L1440 430 L1440 ${ground} Z"/><rect x="780" y="800" width="900" height="${ground - 800}"/>`);
  let stones = '';
  for (let y = 280; y < ground; y += 26) {
    for (let x = 780 + sr() * 20; x < 1680; x += 46 + sr() * 30) stones += rect(x, y, 40 + sr() * 26, 20, shade(stone, (sr() - 0.5) * 0.2), { rx: 6 });
  }
  b += group(stones, { clipPath: stoneClip });
  // roofs
  b += poly([[750, 400], [1710, 400], [1600, 250], [860, 250]], linear(defs, [[0, '#55565a'], [1, '#424347']]));
  b += rect(744, 396, 972, 12, '#3a3b3e');
  b += path('M1030 446 L1250 250 L1470 446 L1452 456 L1250 280 L1048 456 Z', '#3a3b3e');
  // windows (white trim, black grids)
  const win = (x, y, w, h) => rect(x - 12, y - 12, w + 24, h + 24, trim) + windowView(defs, x, y, w, h, { time: 'sunset', seed: x, foliage: false }) + rect(x + w / 2 - 3, y, 6, h, FRAME) + rect(x, y + h / 2 - 3, w, 6, FRAME);
  b += win(840, 470, 140, 160) + win(1520, 470, 140, 160) + win(1180, 470, 140, 150);
  b += win(840, 640, 140, 150) + win(1520, 640, 140, 150);
  // entry
  b += rect(1170, 690, 160, ground - 690, trim);
  b += path(`M1185 ${ground} L1185 740 Q1250 680 1315 740 L1315 ${ground} Z`, '#3c4a57');
  b += rect(1246, 740, 4, ground - 740, '#2a3540');
  b += circle(1230, 840, 4, '#c9a15b') + circle(1270, 840, 4, '#c9a15b');
  b += rect(1140, ground, 220, 16, '#bfb6a8');
  // landscaping
  b += shrub(790, ground + 30, 360, 80, undefined, 104) + shrub(1360, ground + 30, 330, 80, undefined, 105);
  b += grasses(1080, ground + 30, 80, 70, '#c2b781', 106) + flowers(800, ground + 40, 340, 30, undefined, 107, 30);
  b += tree(defs, 1840, 1080, { h: 380, w: 300, seed: 108 });
  b += shrub(-60, H + 30, 600, 160, undefined, 109);
  b += rect(0, 0, W, H, linear(defs, [[0, '#ffd99a', 0.16], [0.6, '#ffd99a', 0]], { x1: 0, y1: 0, x2: 1, y2: 1 }));
  return scene(defs, b);
}
