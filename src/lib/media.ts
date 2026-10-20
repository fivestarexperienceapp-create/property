import type { Photo } from '../config/types';
import { PHOTO_WIDTHS } from '../config/validate';

/** Resolves a path under public/ against the deployed base (works under a repository subpath). */
export function assetUrl(publicPath: string): string {
  if (/^https?:\/\//.test(publicPath)) return publicPath;
  return `${import.meta.env.BASE_URL}${publicPath.replace(/^\/+/, '')}`;
}

export function photoUrl(photo: Pick<Photo, 'src'>, width: (typeof PHOTO_WIDTHS)[number] = 1280): string {
  return assetUrl(`${photo.src}-${width}.webp`);
}

export function photoSrcSet(photo: Pick<Photo, 'src'>): string {
  return PHOTO_WIDTHS.map((w) => `${photoUrl(photo, w)} ${w}w`).join(', ');
}
