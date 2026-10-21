/**
 * Renders the demo's original illustrations to optimized WebP files at the
 * standard photo widths. Demo-only: customer sites use real photos (see photos.mjs).
 *
 *   node scripts/render-artwork.mjs                # all scenes
 *   node scripts/render-artwork.mjs kitchen        # scenes whose name contains "kitchen"
 *   node scripts/render-artwork.mjs --preview DIR  # also write 960px PNG previews to DIR
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { resetIds } from '../art/lib.mjs';
import { scenes } from '../art/scenes.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const WIDTHS = [640, 1280, 1920];
const args = process.argv.slice(2);
const previewIndex = args.indexOf('--preview');
const previewDir = previewIndex >= 0 ? args[previewIndex + 1] : null;
const filters = args.filter((a, i) => !a.startsWith('--') && i !== previewIndex + 1);

let total = 0;
for (const [name, draw] of Object.entries(scenes)) {
  if (filters.length && !filters.some((f) => name.includes(f))) continue;
  resetIds();
  const svg = Buffer.from(draw());
  const base = sharp(svg, { density: 72 });
  const raster = await base.png().toBuffer();
  const outBase = path.join(ROOT, 'public/media', name);
  fs.mkdirSync(path.dirname(outBase), { recursive: true });
  for (const width of WIDTHS) {
    const file = `${outBase}-${width}.webp`;
    await sharp(raster).resize({ width }).webp({ quality: width >= 1920 ? 74 : 78, effort: 6, smartSubsample: true }).toFile(file);
    total += fs.statSync(file).size;
  }
  if (previewDir) {
    fs.mkdirSync(previewDir, { recursive: true });
    await sharp(raster).resize({ width: 960 }).png().toFile(path.join(previewDir, `${name.replace(/\//g, '__')}.png`));
  }
  console.log(`rendered ${name}`);
}
console.log(`total ${(total / 1024).toFixed(0)} KB`);
