/**
 * Optimizes listing photos for the web.
 *
 * Put originals in photos-src/<property-id>/ (jpg, png, webp, avif, tiff, heic where supported).
 * Then run:  npm run photos            (all listings)
 *            npm run photos -- <id>    (one listing)
 *
 * Writes public/media/<property-id>/<file-name>-{640,1280,1920}.webp, auto-rotated,
 * with metadata (including GPS) stripped, and prints config entries to paste into
 * src/config/properties.ts. Only use photos you are licensed to publish.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'photos-src');
const OUT = path.join(ROOT, 'public/media');
const WIDTHS = [640, 1280, 1920];
const EXT = /\.(jpe?g|png|webp|avif|tiff?|heic|heif)$/i;
const only = process.argv[2];

if (!fs.existsSync(SRC)) {
  console.error(`No photos-src/ folder found. Create photos-src/<property-id>/ and add photos.`);
  process.exit(1);
}

const slug = (name) =>
  name
    .replace(EXT, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

for (const listing of fs.readdirSync(SRC, { withFileTypes: true })) {
  if (!listing.isDirectory() || (only && listing.name !== only)) continue;
  const dir = path.join(SRC, listing.name);
  const files = fs.readdirSync(dir).filter((f) => EXT.test(f)).sort();
  if (!files.length) continue;
  fs.mkdirSync(path.join(OUT, listing.name), { recursive: true });
  console.log(`\n${listing.name}: ${files.length} photo(s)`);
  const entries = [];
  for (const file of files) {
    const id = slug(file);
    const input = sharp(path.join(dir, file)).rotate();
    const meta = await input.metadata();
    for (const width of WIDTHS) {
      const target = path.join(OUT, listing.name, `${id}-${width}.webp`);
      await input
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: width >= 1920 ? 72 : 78, effort: 5 })
        .toFile(target);
    }
    if ((meta.width ?? 0) < 1920) console.warn(`  ! ${file} is ${meta.width}px wide; 1920px or larger looks best on big screens.`);
    entries.push(
      `{ id: '${id}', src: 'media/${listing.name}/${id}', alt: 'TODO: describe the photo', caption: '', credit: { label: 'Photo: TODO', license: 'Used with permission' } },`,
    );
    console.log(`  ✓ ${file} → media/${listing.name}/${id}-{${WIDTHS.join(',')}}.webp`);
  }
  console.log(`\nPaste into the listing's photos array:\n${entries.map((e) => `  ${e}`).join('\n')}`);
}
