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
  clip,
  shadow,
  scene,
  room,
  wallQuad,
  wallPoint,
  floorPoint,
  framedWindow,
  windowView,
  pendant,
  books,
  artPrint,
  pottedPlant,
  tree,
  shrub,
  grasses,
  flowers,
  shade,
  rng,
  lerp,
  pts,
} from './lib.mjs';
import {
  sunPatch,
  rug,
  sofaBack,
  sofaFront,
  armchair,
  coffeeTable,
  tableLamp,
  floorLamp,
  cabinets,
  stool,
  diningChairBack,
  diningChairFront,
  openShelf,
  bed,
  nightstand,
  curtain,
  ceilingFan,
} from './furniture.mjs';

const FRAME = '#26272a';

function warmWash(defs, from = 'left', strength = 0.14) {
  return rect(0, 0, W, H, linear(defs, [[0, '#ffe2b0', strength], [0.55, '#ffe2b0', 0]], from === 'left' ? { x1: 0, y1: 0, x2: 1, y2: 0.6 } : { x1: 1, y1: 0, x2: 0, y2: 0.6 }));
}

// ---------------------------------------------------------------------------
// Kitchens
// ---------------------------------------------------------------------------

export function kitchen({
  wall = '#efe9df',
  cabinet = '#8c9b80',
  island = '#efe9df',
  islandTop = '#f7f4ee',
  floor = '#cfa77b',
  pendantColor = '#26272a',
  pendantInner = '#e8c98e',
  hood = '#f1ece3',
  backsplash = '#e9e3d8',
  seed = 1,
} = {}) {
  const defs = [];
  const back = [380, 250, 1540, 820];
  let b = room(defs, back, { wall, floor, floorDark: shade(floor, -0.18) });
  // window on back wall (left)
  b += framedWindow(defs, 470, 320, 300, 250, { cols: 2, rows: 1, trim: shade(wall, 0.4), seed: seed + 3 });
  b += sunPatch([[470, 820], [770, 820], [900, 1280], [300, 1280]], 0.12);
  // backsplash
  b += rect(380, 470, 1160, 140, backsplash);
  for (let x = 380; x < 1540; x += 36) b += line(x, 470, x, 610, shade(backsplash, -0.06), 1.5);
  for (let y = 488; y < 610; y += 18) b += line(380, y, 1540, y, shade(backsplash, -0.06), 1.5);
  b += framedWindow(defs, 470, 320, 300, 150, { cols: 2, rows: 1, seed: seed + 3 });
  // hood + range
  b += path('M860 470 L900 330 L1060 330 L1100 470 Z', hood);
  b += rect(890, 290, 180, 46, shade(hood, -0.04));
  b += rect(852, 462, 256, 16, shade(hood, -0.1));
  // open shelves (right)
  b += openShelf(1160, 380, 340, { seed: seed + 5 });
  b += openShelf(1160, 470, 340, { seed: seed + 6 });
  // lower cabinets + counter
  b += rect(380, 596, 1160, 18, linear(defs, [[0, '#fbf9f5'], [1, '#e7e1d6']]));
  b += cabinets(defs, 380, 614, 470, 206, cabinet, { doors: 3 });
  b += rect(850, 614, 260, 206, '#2f3033');
  b += rect(870, 640, 220, 140, '#1f2022', { rx: 6 }) + rect(880, 626, 200, 8, '#c9c9c9');
  b += cabinets(defs, 1110, 614, 430, 206, cabinet, { doors: 3 });
  b += ellipse(1250, 585, 46, 12, '#e8e0d2') + circle(1236, 575, 12, '#e9c46a') + circle(1258, 572, 12, '#f0d27b') + circle(1270, 580, 11, '#e9c46a');
  // tall pantry on the left wall
  b += poly(wallQuad('left', back, 0.62, 0.98, 0.1, 1), linear(defs, [[0, shade(cabinet, -0.12)], [1, cabinet]], { x1: 0, y1: 0, x2: 1, y2: 0 }));
  const pq = wallQuad('left', back, 0.62, 0.98, 0.1, 1);
  b += line(...lerpMid(pq, 0.5), shade(cabinet, -0.25), 3);
  // window on right wall
  b += poly(wallQuad('right', back, 0.25, 0.7, 0.18, 0.62), FRAME);
  b += poly(wallQuad('right', back, 0.28, 0.67, 0.21, 0.59), linear(defs, [[0, '#cfdbd8'], [1, '#e9e6da']]));
  b += sunPatch([[1540, 820], [1660, 820], [1500, 1280], [1240, 1280]], 0.08);
  // pendants
  b += pendant(defs, 660, 0, 560, { color: pendantColor, inner: pendantInner });
  b += pendant(defs, 960, 0, 560, { color: pendantColor, inner: pendantInner });
  b += pendant(defs, 1260, 0, 560, { color: pendantColor, inner: pendantInner });
  // island
  b += shadow(defs, 960, 1150, 560, 30, 0.3, 18);
  b += poly([[470, 900], [1450, 900], [1380, 850], [540, 850]], linear(defs, [[0, shade(islandTop, -0.03)], [1, islandTop]]));
  for (let i = 0; i < 5; i += 1) b += path(`M${600 + i * 170} 856 q40 20 ${90 + i * 10} 38`, 'none', { stroke: '#d8d2c6', strokeWidth: 1.5, opacity: 0.7 });
  b += rect(470, 900, 980, 16, shade(islandTop, -0.08));
  b += rect(482, 916, 956, 220, island);
  for (let x = 500; x < 1430; x += 26) b += rect(x, 916, 3, 220, shade(island, -0.08));
  b += rect(482, 1120, 956, 16, shade(island, -0.3));
  // island decor
  b += ellipse(700, 846, 70, 14, '#d9cdb8') + circle(684, 832, 16, '#e9c46a') + circle(708, 828, 16, '#f0d27b') + circle(726, 838, 14, '#e9c46a');
  b += path('M1180 850 q-6 -50 14 -60 h20 q20 10 14 60 Z', '#e9e2d6') + ellipse(1196, 772, 40, 26, '#6f8c5a') + ellipse(1220, 752, 22, 30, '#86a06b') + ellipse(1176, 756, 18, 26, '#5c7a4d');
  b += rect(880, 838, 160, 12, '#b98a5f', { rx: 4 });
  // stools
  b += stool(defs, 640, 980, 1250);
  b += stool(defs, 960, 980, 1250);
  b += stool(defs, 1280, 980, 1250);
  b += warmWash(defs);
  return scene(defs, b);
}

function lerpMid(q, t) {
  const a = [lerp(q[0][0], q[1][0], t), lerp(q[0][1], q[1][1], t)];
  const c = [lerp(q[3][0], q[2][0], t), lerp(q[3][1], q[2][1], t)];
  return [a[0], a[1], c[0], c[1]];
}

// ---------------------------------------------------------------------------
// Living spaces
// ---------------------------------------------------------------------------

export function greatRoom({ wall = '#f1ebe1', sofa = '#e3dacb', beam = '#a87a52', stone = '#b9b1a4', floor = '#c9a37a', rugColor = '#e8e0d2', tall = false, time = 'day', seed = 1 } = {}) {
  const defs = [];
  const back = tall ? [300, 140, 1620, 860] : [420, 330, 1500, 860];
  const peak = tall ? 30 : 120;
  let b = room(defs, back, { wall, floor, floorDark: shade(floor, -0.2) });
  if (!tall) {
    // vaulted ceiling: gable-shaped back wall and sloped ceiling planes
    b += poly([[0, 0], [960, 0], [960, peak], [back[0], back[1]]], shade(wall, 0.25));
    b += poly([[W, 0], [960, 0], [960, peak], [back[2], back[1]]], shade(wall, 0.15));
    b += poly([[back[0], back[1]], [960, peak], [back[2], back[1]]], linear(defs, [[0, shade(wall, 0.04)], [1, wall]]));
    // beams
    for (const u of [0.15, 0.5, 0.85]) {
      const l = wallPoint('left', back, u, 0);
      const r = wallPoint('right', back, u, 0);
      const ridgeY = lerp(-420, peak, 1 - Math.pow(1 - u, 1.6));
      b += `<polyline points="${pts([l, [960, ridgeY], r])}" fill="none" stroke="${beam}" stroke-width="${lerp(46, 16, u)}" stroke-linejoin="round"/>`;
    }
    b += line(960, peak, 960, 0, beam, 22);
    b += line(back[0], back[1], 960, peak, shade(beam, -0.1), 14) + line(960, peak, back[2], back[1], shade(beam, -0.1), 14);
  }
  // windows
  if (tall) {
    // two-story wall of windows looking into woods
    const wx0 = 520;
    const wx1 = 1400;
    b += rect(wx0 - 14, 180, wx1 - wx0 + 28, 680, FRAME);
    b += rect(wx0, 194, wx1 - wx0, 652, linear(defs, [[0, '#c6d4d6'], [1, '#e8e7dc']]));
    const woods = clip(defs, rect(wx0, 194, wx1 - wx0, 652, '#000'));
    let trees = '';
    const r = rng(seed + 9);
    for (let i = 0; i < 12; i += 1) trees += tree(defs, wx0 + r() * (wx1 - wx0), 860 + r() * 60, { h: 500 + r() * 300, w: 260 + r() * 160, seed: seed + i * 7, greens: ['#6b8a5c', '#7f9c6c', '#a4bb8c'], trunk: '#5c4c3e' });
    b += group(trees, { clipPath: woods });
    for (let c = 1; c < 4; c += 1) b += rect(wx0 + ((wx1 - wx0) / 4) * c - 5, 194, 10, 652, FRAME);
    b += rect(wx0, 500, wx1 - wx0, 10, FRAME);
    // fireplace on left wall
    const fq = wallQuad('left', back, 0.45, 0.85, 0.18, 1);
    b += poly(fq, stone);
    const fb = wallQuad('left', back, 0.55, 0.75, 0.72, 0.95);
    b += poly(fb, '#1d1c1b');
    b += poly(wallQuad('left', back, 0.58, 0.72, 0.85, 0.95), radial(defs, [[0, '#ffb35c', 0.95], [1, '#d4552c', 0.4]]));
  } else {
    b += framedWindow(defs, 500, 400, 250, 420, { cols: 2, rows: 3, seed: seed + 1, time });
    b += framedWindow(defs, 1170, 400, 250, 420, { cols: 2, rows: 3, seed: seed + 2, time });
    // stone fireplace with chimney breast to the peak
    b += poly([[820, 860], [820, 220], [960, 150], [1100, 220], [1100, 860]], stone);
    const r = rng(seed + 4);
    const sc = clip(defs, `<polygon points="${pts([[820, 860], [820, 220], [960, 150], [1100, 220], [1100, 860]])}"/>`);
    let stones = '';
    for (let y = 150; y < 860; y += 24) for (let x = 820 + r() * 20 - 20; x < 1100; x += 40 + r() * 34) stones += rect(x, y, 36 + r() * 28, 19, shade(stone, (r() - 0.5) * 0.2), { rx: 6 });
    b += group(stones, { clipPath: sc });
    b += rect(800, 646, 320, 26, '#9b7350');
    b += rect(870, 700, 180, 140, '#1d1c1b', { rx: 6 });
    b += ellipse(960, 820, 70, 20, radial(defs, [[0, '#ffc26b', 1], [1, '#e36b2c', 0.6]]));
    b += path('M920 822 q20 -60 40 -70 q-6 40 24 70 Z', '#ffb35c', { opacity: 0.9 });
    b += circle(960, 780, 160, radial(defs, [[0, '#ffbf73', 0.35], [1, '#ffbf73', 0]]));
    b += path('M840 646 q10 -40 30 -50 q14 30 0 50 Z', '#7b9768') + rect(1020, 610, 40, 36, '#e9e2d6', { rx: 6 });
  }
  b += sunPatch(tall ? [[520, 860], [1400, 860], [1700, 1280], [300, 1280]] : [[500, 860], [750, 860], [820, 1280], [300, 1280]], 0.12);
  b += rug(defs, back, 0.15, 0.85, 0.2, 0.8, rugColor, { border: shade(rugColor, -0.15) });
  b += coffeeTable(defs, 960, 960, 300);
  b += armchair(defs, 150, 860, 260, shade(sofa, -0.12));
  b += pottedPlant(1700, 1060, { h: 420, seed: seed + 7, style: 'fiddle' });
  b += floorLamp(defs, 120, 1150, 560);
  b += sofaBack(defs, 520, 1030, 880, 230, sofa);
  b += warmWash(defs);
  return scene(defs, b);
}

export function openLiving({ seed = 1 } = {}) {
  const defs = [];
  const back = [360, 260, 1560, 860];
  const wall = '#f3f1ec';
  let b = room(defs, back, { wall, floor: '#c2ab8f', floorDark: '#a58d70' });
  // tall steel windows
  for (const x of [420, 700]) {
    b += rect(x - 10, 300, 230, 520, FRAME);
    b += windowView(defs, x, 310, 210, 500, { time: 'day', seed: seed + x });
    b += rect(x + 100, 310, 8, 500, FRAME) + rect(x, 470, 210, 6, FRAME) + rect(x, 640, 210, 6, FRAME);
  }
  // kitchen at the back right
  b += rect(1000, 330, 560, 330, '#fbfaf8');
  for (let i = 0; i < 4; i += 1) b += rect(1004 + i * 139, 334, 135, 322, '#f6f5f2') + rect(1060 + i * 139, 600, 28, 4, '#26272a');
  b += rect(1000, 660, 560, 14, '#e5e1d9') + rect(1000, 674, 560, 186, '#f4f3ef');
  for (let i = 0; i < 4; i += 1) b += rect(1050 + i * 139, 700, 40, 4, '#26272a');
  b += rect(1060, 760, 380, 100, '#2f3033') + rect(1050, 748, 400, 14, '#e8e4dc');
  b += pendant(defs, 1250, 0, 600, { r: 34 });
  // sectional (front)
  b += rug(defs, back, 0.1, 0.75, 0.1, 0.7, '#dcd6cc', { pattern: 3 });
  b += coffeeTable(defs, 760, 1000, 260, '#2f2e2c');
  b += sofaFront(defs, 300, 820, 760, 260, '#bfb8ad', { pillows: ['#e8e1d4', '#7b8b8f'] });
  b += pottedPlant(1650, 1100, { h: 460, seed: seed + 3, style: 'olive' });
  b += artPrint(160, 360, 150, 200, { seed: seed + 6 });
  b += sunPatch([[420, 860], [900, 860], [1000, 1280], [200, 1280]], 0.12);
  b += warmWash(defs, 'left', 0.1);
  return scene(defs, b);
}

export function dining({ seed = 1 } = {}) {
  const defs = [];
  const back = [380, 260, 1540, 840];
  const wall = '#f1ebe1';
  let b = room(defs, back, { wall, floor: '#c9a37a', floorDark: '#a5815a' });
  // sliding doors to the patio
  b += rect(500, 300, 920, 540, FRAME);
  b += windowView(defs, 512, 312, 896, 528, { time: 'day', seed: seed + 2 });
  b += rect(512, 680, 896, 160, '#a2b47c');
  b += shrub(520, 700, 880, 90, ['#56724a', '#6c8a5b', '#8ba571'], seed + 5);
  for (let i = 1; i < 4; i += 1) b += rect(500 + i * 230 - 6, 312, 12, 528, FRAME);
  b += sunPatch([[500, 840], [1420, 840], [1660, 1280], [260, 1280]], 0.16);
  // sideboard on the left wall + art
  b += poly(wallQuad('left', back, 0.35, 0.9, 0.62, 1), '#9b7350');
  b += poly(wallQuad('left', back, 0.35, 0.9, 0.6, 0.64), '#b98a5f');
  b += poly(wallQuad('left', back, 0.45, 0.8, 0.22, 0.5), '#2f2e2b');
  b += poly(wallQuad('left', back, 0.47, 0.78, 0.25, 0.47), '#e3d6c2');
  // rug + table
  b += rug(defs, back, 0.08, 0.92, 0.18, 0.82, '#e4dccd', { border: '#cbbfa9' });
  // back chairs
  for (const x of [620, 830, 1040, 1250]) b += diningChairFront(x, 700, 110, 220, '#e5dccd');
  // table top
  b += shadow(defs, 960, 1060, 520, 26, 0.26, 16);
  b += poly([[520, 920], [1400, 920], [1320, 820], [600, 820]], linear(defs, [[0, '#a9774c'], [1, '#c4935f']]));
  b += rect(520, 920, 880, 22, '#8f6440');
  b += rect(560, 942, 22, 160, '#7d5638') + rect(1338, 942, 22, 160, '#7d5638');
  b += ellipse(960, 860, 90, 18, '#e9e2d6') + ellipse(940, 850, 30, 20, '#6f8c5a') + ellipse(980, 846, 26, 22, '#86a06b');
  for (const x of [700, 1220]) b += ellipse(x, 880, 50, 12, '#f6f3ee');
  // front chairs (backs to viewer)
  b += diningChairBack(defs, 600, 900, 170, 300, '#e5dccd');
  b += diningChairBack(defs, 1150, 900, 170, 300, '#e5dccd');
  // chandelier: woven dome
  b += line(960, 0, 960, 430, '#3a3936', 3);
  b += circle(960, 520, 260, radial(defs, [[0, '#ffe9bf', 0.45], [1, '#ffe9bf', 0]]));
  b += path('M840 520 Q840 420 960 420 Q1080 420 1080 520 Z', '#c9a77d');
  for (let x = 850; x < 1080; x += 18) b += line(x, 520, 960, 422, '#a9865c', 1.5, { opacity: 0.6 });
  b += ellipse(960, 520, 120, 14, '#f3d9a6');
  b += warmWash(defs);
  return scene(defs, b);
}

export function office({ wall = '#9aa891', seed = 1 } = {}) {
  const defs = [];
  const back = [400, 260, 1520, 840];
  let b = room(defs, back, { wall, floor: '#c9a37a', floorDark: '#a5815a', baseboard: shade(wall, 0.1) });
  // built-ins on back wall sides
  for (const [x0, x1] of [[400, 640], [1280, 1520]]) {
    b += rect(x0, 260, x1 - x0, 580, shade(wall, -0.06));
    for (let y = 360; y < 640; y += 100) {
      b += books(x0 + 14, y, x1 - x0 - 28, { seed: seed + y + x0, maxH: 74 });
      b += rect(x0, y, x1 - x0, 12, shade(wall, 0.08));
    }
    b += cabinets(defs, x0, 640, x1 - x0, 200, shade(wall, -0.02), { doors: 2, drawers: false });
  }
  // window
  b += framedWindow(defs, 720, 320, 480, 330, { cols: 2, rows: 1, trim: shade(wall, 0.3), seed: seed + 2 });
  b += sunPatch([[720, 840], [1200, 840], [1360, 1280], [520, 1280]], 0.15);
  // desk
  b += shadow(defs, 960, 1030, 420, 20, 0.25, 12);
  b += poly([[580, 760], [1340, 760], [1300, 720], [620, 720]], '#b98a5f');
  b += rect(580, 760, 760, 16, '#8f6440');
  b += rect(600, 776, 18, 260, '#7d5638') + rect(1302, 776, 18, 260, '#7d5638');
  b += rect(860, 650, 200, 76, '#2c2d30', { rx: 6 }) + rect(866, 656, 188, 60, '#c4d0d3', { rx: 4 }) + poly([[830, 726], [1090, 726], [1110, 740], [810, 740]], '#3a3b3e');
  b += tableLamp(defs, 700, 724, { h: 150, base: '#2c2d30', shadeColor: '#efe7d8' });
  b += pottedPlant(1220, 724, { h: 140, seed: seed + 4 });
  b += rect(1120, 700, 70, 22, '#e9e2d6');
  // chair, back view
  b += shadow(defs, 960, 1240, 160, 16, 0.28, 10);
  b += rect(950, 1080, 20, 150, '#2c2d30') + rect(860, 1220, 200, 10, '#2c2d30', { rx: 5 });
  b += rect(840, 860, 240, 250, '#c9b79c', { rx: 40 });
  b += rect(860, 880, 200, 210, shade('#c9b79c', 0.08), { rx: 34 });
  b += rug(defs, back, 0.02, 0.6, 0.2, 0.8, '#e6dfd2');
  b += pottedPlant(200, 1220, { h: 520, seed: seed + 6, style: 'fiddle' });
  b += warmWash(defs);
  return scene(defs, b);
}

export function bedroom({ wall = '#f0eae0', headboard = '#d9cfbf', duvet = '#f7f4ef', throwColor = '#8c9b80', accentWall = true, seed = 1 } = {}) {
  const defs = [];
  const back = [400, 260, 1520, 860];
  let b = room(defs, back, { wall, floor: '#c9a37a', floorDark: '#a5815a' });
  if (accentWall) {
    b += rect(400, 560, 1120, 300, shade(wall, -0.05));
    for (let x = 420; x < 1520; x += 56) b += rect(x, 560, 5, 300, shade(wall, 0.05));
    b += rect(400, 552, 1120, 10, shade(wall, 0.08));
  }
  b += artPrint(800, 330, 320, 200, { seed: seed + 3, palette: ['#c9b79c', '#8c9b80', '#e3d4bd', '#b5714f'] });
  // window with curtains on right wall
  b += poly(wallQuad('right', back, 0.2, 0.75, 0.12, 0.72), FRAME);
  b += poly(wallQuad('right', back, 0.23, 0.72, 0.15, 0.69), linear(defs, [[0, '#cfdcd8'], [1, '#efe8da']]));
  b += poly(wallQuad('right', back, 0.12, 0.26, 0.05, 0.98), '#efe7da');
  b += poly(wallQuad('right', back, 0.7, 0.82, 0.05, 0.98), '#efe7da');
  b += sunPatch([[1520, 860], [1660, 860], [1400, 1280], [1100, 1280]], 0.14);
  b += rug(defs, back, 0.05, 0.75, 0.12, 0.88, '#e5ddd0', { border: '#d3c7b4' });
  b += nightstand(defs, 520, 700, 150, 150);
  b += nightstand(defs, 1250, 700, 150, 150);
  b += tableLamp(defs, 595, 700, { h: 170 });
  b += tableLamp(defs, 1325, 700, { h: 170 });
  b += bed(defs, 700, 480, 520, { headboard, duvet, throwColor });
  // bench at the foot
  b += rect(640, 1140, 640, 50, '#c9b79c', { rx: 14 }) + rect(660, 1186, 14, 80, '#7d5638') + rect(1246, 1186, 14, 80, '#7d5638');
  b += pottedPlant(150, 1180, { h: 460, seed: seed + 5 });
  b += warmWash(defs, 'right', 0.12);
  return scene(defs, b);
}

export function bath({ seed = 1 } = {}) {
  const defs = [];
  const back = [420, 250, 1500, 860];
  const wall = '#f3efe8';
  let b = room(defs, back, { wall, floor: '#ddd6ca', floorDark: '#c5bcad', planks: false });
  // floor tile grid
  const fc = clip(defs, `<polygon points="${pts([[0, H], [420, 860], [1500, 860], [W, H]])}"/>`);
  let tiles = '';
  for (let i = -12; i <= 12; i += 1) tiles += line(960 + i * 160, H, 960 + i * 160 + ((960 - (960 + i * 160)) * (H - 860)) / (H - 555), 860, '#c5bcad', 2);
  for (let k = 1; k < 7; k += 1) {
    const y = lerp(H, 860, 1 - Math.pow(1 - k / 7, 1.6));
    tiles += line(0, y, W, y, '#c5bcad', 2);
  }
  b += group(tiles, { clipPath: fc });
  // wall tile, lower back wall
  b += rect(420, 560, 1080, 300, '#e7e5df');
  for (let x = 420; x < 1500; x += 30) b += line(x, 560, x, 860, '#d9d6cf', 1.5);
  for (let y = 560; y < 860; y += 90) b += line(420, y, 1500, y, '#d9d6cf', 1.5);
  // window with sheer
  b += framedWindow(defs, 760, 300, 400, 300, { cols: 2, rows: 1, seed: seed + 2, trim: '#fbf9f5' });
  b += rect(760, 300, 400, 300, '#ffffff', { opacity: 0.35 });
  b += sunPatch([[760, 860], [1160, 860], [1300, 1280], [600, 1280]], 0.14);
  // vanity on the left wall with mirror
  b += poly(wallQuad('left', back, 0.3, 0.95, 0.6, 1), '#8c9b80');
  b += poly(wallQuad('left', back, 0.3, 0.95, 0.57, 0.61), '#f7f4ee');
  b += poly(wallQuad('left', back, 0.38, 0.62, 0.2, 0.5), '#c9a15b');
  b += poly(wallQuad('left', back, 0.39, 0.61, 0.21, 0.49), linear(defs, [[0, '#dfe5e3'], [1, '#c9d2cf']]));
  b += poly(wallQuad('left', back, 0.7, 0.9, 0.22, 0.48), '#c9a15b');
  b += poly(wallQuad('left', back, 0.71, 0.89, 0.23, 0.47), linear(defs, [[0, '#dfe5e3'], [1, '#c9d2cf']]));
  // glass shower on right
  b += poly(wallQuad('right', back, 0.35, 1, 0.05, 1), '#dfe7e6', { opacity: 0.5 });
  b += poly(wallQuad('right', back, 0.35, 0.37, 0.05, 1), '#c9a15b');
  // freestanding tub
  b += shadow(defs, 960, 1010, 380, 28, 0.25, 16);
  b += path('M600 820 Q600 1010 960 1010 Q1320 1010 1320 820 Z', linear(defs, [[0, '#ffffff'], [1, '#e9e5de']]));
  b += ellipse(960, 820, 360, 50, '#f7f5f1') + ellipse(960, 826, 330, 38, '#dfe6e6');
  b += rect(1300, 700, 10, 120, '#c9a15b') + path('M1300 700 q-40 0 -40 30', 'none', { stroke: '#c9a15b', strokeWidth: 8 });
  // stool with towels + plant
  b += rect(1400, 900, 120, 16, '#b98a5f') + rect(1410, 916, 12, 120, '#8f6440') + rect(1498, 916, 12, 120, '#8f6440');
  b += rect(1410, 860, 100, 40, '#f1ebe0', { rx: 8 }) + rect(1416, 840, 90, 24, '#c9d2c2', { rx: 8 });
  b += pottedPlant(330, 1200, { h: 420, seed: seed + 3 });
  b += pendant(defs, 960, 0, 230, { r: 40, color: '#c9a15b' });
  b += warmWash(defs);
  return scene(defs, b);
}

// ---------------------------------------------------------------------------
// Outdoor rooms
// ---------------------------------------------------------------------------

function yardView(defs, horizon, { time = 'day', seed = 1, fence = true } = {}) {
  let b = rect(0, 0, W, horizon, linear(defs, time === 'sunset' ? [[0, '#a9bccb'], [1, '#f2cfa2']] : [[0, '#b7cdd6'], [1, '#efe9da']]));
  b += circle(1500, horizon - 200, 500, radial(defs, [[0, '#fff1d1', 0.6], [1, '#fff1d1', 0]]));
  const r = rng(seed);
  for (let i = 0; i < 26; i += 1) b += circle(i * 80 + r() * 40, horizon - 40 - r() * 80, 70 + r() * 60, ['#91a78a', '#a3b79a'][i % 2]);
  b += rect(0, horizon - 40, W, 80, '#91a78a');
  if (fence) for (let y = horizon - 120; y < horizon + 10; y += 20) b += rect(0, y, W, 13, '#a07a58', { opacity: 0.85 });
  b += rect(0, horizon, W, H - horizon, linear(defs, [[0, '#a6b77f'], [1, '#86a064']]));
  return b;
}

export function coveredPatio({ seed = 1 } = {}) {
  const defs = [];
  const horizon = 700;
  let b = yardView(defs, horizon, { seed });
  b += tree(defs, 420, 720, { h: 560, w: 420, seed: seed + 2 });
  b += tree(defs, 1500, 730, { h: 620, w: 460, seed: seed + 3 });
  b += shrub(200, 770, 700, 90, undefined, seed + 4) + flowers(220, 770, 680, 60, undefined, seed + 5, 50);
  b += shrub(1100, 780, 700, 90, undefined, seed + 6) + flowers(1120, 780, 680, 60, undefined, seed + 7, 50);
  b += grasses(900, 790, 200, 90, '#c2b781', seed + 8);
  // patio pavers (foreground)
  b += poly([[0, 880], [W, 880], [W, H], [0, H]], '#d8d0c1');
  for (let i = -10; i <= 10; i += 1) b += line(960 + i * 180, H, 960 + i * 60, 880, '#c4baa8', 2);
  for (const y of [930, 1010, 1120, 1250]) b += line(0, y, W, y, '#c4baa8', 2);
  // ceiling: tongue-and-groove wood
  b += poly([[0, 0], [W, 0], [W, 150], [0, 150]], '#b8875b');
  b += poly([[0, 150], [W, 150], [W, 230], [0, 230]], linear(defs, [[0, '#c4935f'], [1, '#a87a52']]));
  for (let x = -400; x < W + 400; x += 60) b += line(x, 0, 960 + (x - 960) * 0.6, 230, '#9a6c45', 2, { opacity: 0.6 });
  b += rect(0, 222, W, 28, '#2c2d2f');
  b += ceilingFan(960, 150, 1.1);
  // posts
  b += rect(90, 250, 70, 700, linear(defs, [[0, '#b98458'], [1, '#93653f']], { x1: 0, y1: 0, x2: 1, y2: 0 }));
  b += rect(1760, 250, 70, 700, linear(defs, [[0, '#b98458'], [1, '#93653f']], { x1: 0, y1: 0, x2: 1, y2: 0 }));
  // outdoor sofa (left) and dining set (right)
  b += sofaFront(defs, 300, 820, 640, 230, '#e9e3d8', { pillows: ['#8c9b80', '#c9b79c'] });
  b += coffeeTable(defs, 620, 1110, 280, '#8a7a66');
  b += shadow(defs, 1430, 1080, 260, 20, 0.25, 12);
  b += rect(1180, 930, 500, 20, '#7b5a40') + rect(1200, 950, 14, 130, '#6b4d36') + rect(1646, 950, 14, 130, '#6b4d36');
  for (const x of [1170, 1370, 1570]) b += diningChairFront(x, 870, 110, 210, '#2f2e2c', '#2f2e2c');
  b += pottedPlant(1050, 1080, { h: 300, seed: seed + 9, pot: '#cbbda5' });
  b += warmWash(defs, 'right', 0.16);
  return scene(defs, b);
}

export function rooftopTerrace({ seed = 1 } = {}) {
  const defs = [];
  const horizon = 640;
  let b = rect(0, 0, W, H, linear(defs, [[0, '#7f93ad'], [0.5, '#e2b9a0'], [0.75, '#f3cf9e'], [1, '#f0c48f']]));
  b += circle(1400, 560, 90, '#fff1cf') + circle(1400, 560, 420, radial(defs, [[0, '#ffe2b0', 0.6], [1, '#ffe2b0', 0]]));
  // skyline silhouettes
  const r = rng(seed);
  let x = 0;
  while (x < W) {
    const w = 60 + r() * 120;
    const h = 80 + r() * 220;
    b += rect(x, horizon - h, w, h + 40, ['#7c7a8a', '#6f6e80', '#86829a'][Math.floor(r() * 3)], { opacity: 0.9 });
    x += w + 8;
  }
  b += rect(1180, horizon - 330, 22, 330, '#6f6e80');
  // deck
  b += poly([[0, 760], [W, 760], [W, H], [0, H]], '#a98a6a');
  for (let i = -16; i <= 16; i += 1) b += line(960 + i * 140, H, 960 + i * 40, 760, '#8f7254', 2);
  // railing
  b += rect(0, 640, W, 120, '#dfe7ea', { opacity: 0.25 });
  b += rect(0, 636, W, 8, '#2c2d2f') + rect(0, 756, W, 6, '#2c2d2f');
  for (let px = 0; px < W; px += 240) b += rect(px, 636, 8, 124, '#2c2d2f');
  // string lights
  for (const [x0, x1] of [[0, 960], [960, W]]) {
    b += path(`M${x0} 120 Q${(x0 + x1) / 2} 260 ${x1} 120`, 'none', { stroke: '#2c2d2f', strokeWidth: 2 });
    for (let t = 0.05; t < 1; t += 0.09) {
      const lx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t * t * x1;
      const ly = (1 - t) * (1 - t) * 120 + 2 * (1 - t) * t * 260 + t * t * 120;
      b += circle(lx, ly + 14, 26, radial(defs, [[0, '#ffe2a8', 0.8], [1, '#ffe2a8', 0]])) + circle(lx, ly + 12, 7, '#fff1c9');
    }
  }
  // planters
  for (const px of [80, 1560]) {
    b += rect(px, 820, 300, 160, '#3a3b3e');
    b += grasses(px + 10, 822, 280, 170, '#b8b07a', seed + px) + shrub(px + 10, 830, 280, 70, ['#4f6a46', '#62805a', '#7f9b6a'], seed + px + 1);
  }
  // loungers + side table
  for (const [i, lx] of [520, 1000].entries()) {
    b += shadow(defs, lx + 180, 1150, 210, 18, 0.25, 10);
    b += poly([[lx, 1120], [lx + 360, 1120], [lx + 330, 1000], [lx + 30, 1000]], '#efe7da');
    b += poly([[lx + 30, 1000], [lx + 330, 1000], [lx + 300, 880], [lx + 60, 880]], shade('#efe7da', -0.06));
    b += rect(lx, 1120, 360, 20, '#7b5a40') + rect(lx + 10, 1140, 12, 40, '#6b4d36') + rect(lx + 338, 1140, 12, 40, '#6b4d36');
    b += rect(lx + 120, 900, 120, 70, i ? '#8c9b80' : '#c9a27c', { rx: 18 });
  }
  b += ellipse(930, 1080, 60, 14, '#2c2d2f') + rect(924, 1080, 12, 80, '#2c2d2f') + rect(905, 1050, 18, 28, '#f6ead3', { rx: 4 });
  b += rect(0, 0, W, H, '#ffb98a', { opacity: 0.06 });
  return scene(defs, b, { vignette: 0.22 });
}

export function screenedPorch({ seed = 1 } = {}) {
  const defs = [];
  const horizon = 760;
  let b = rect(0, 0, W, H, linear(defs, [[0, '#c8d6d3'], [1, '#e9e8dc']]));
  const r = rng(seed);
  for (let i = 0; i < 16; i += 1) b += tree(defs, r() * W, horizon + 40 + r() * 80, { h: 700 + r() * 400, w: 300 + r() * 200, seed: seed + i * 5, greens: ['#5f7d52', '#749266', '#93ad7c'], trunk: '#5c4c3e' });
  b += rect(0, horizon + 60, W, H, '#8aa06b');
  // screen tint + framing
  b += rect(0, 0, W, 900, '#3a3b3e', { opacity: 0.12 });
  for (let x = 0; x <= W; x += 384) b += rect(x - 14, 0, 28, 900, '#f4f1ea');
  b += rect(0, 520, W, 18, '#f4f1ea') + rect(0, 0, W, 120, '#e9e3d6') + rect(0, 110, W, 16, '#cfc6b6');
  for (let x = 0; x < W; x += 80) b += line(x, 0, 960 + (x - 960) * 0.8, 120, '#d7cfbf', 2);
  b += ceilingFan(960, 100, 0.9);
  // floor
  b += poly([[0, 900], [W, 900], [W, H], [0, H]], '#b89067');
  for (let i = -14; i <= 14; i += 1) b += line(960 + i * 160, H, 960 + i * 110, 900, '#9c7650', 2);
  b += rect(0, 880, W, 24, '#f4f1ea');
  // wicker chairs + table
  for (const cx of [560, 1360]) {
    b += shadow(defs, cx, 1180, 220, 20, 0.25, 12);
    b += path(`M${cx - 200} 1160 L${cx - 220} 860 Q${cx} 780 ${cx + 220} 860 L${cx + 200} 1160 Z`, '#c9a77d');
    for (let y = 870; y < 1160; y += 18) b += line(cx - 210, y, cx + 210, y, '#a9865c', 2, { opacity: 0.5 });
    b += rect(cx - 170, 1000, 340, 80, '#efe7da', { rx: 24 }) + rect(cx - 150, 900, 300, 110, '#e5dccd', { rx: 28 });
  }
  b += coffeeTable(defs, 960, 1100, 280, '#8a7a66');
  b += pottedPlant(1800, 1220, { h: 380, seed: seed + 4, style: 'fiddle' });
  b += warmWash(defs, 'left', 0.12);
  return scene(defs, b);
}
