import { useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';
import type { Photo } from '../../config/types';
import { photoSrcSet, photoUrl } from '../../lib/media';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'alt'> {
  photo: Photo;
  sizes: string;
  priority?: boolean;
  /** Decorative usage (alt=""), e.g. thumbnails next to a text label. */
  decorative?: boolean;
}

/** Optimized listing image with srcset, lazy loading and a graceful placeholder if it can't load. */
export function ResponsiveImage({ photo, sizes, priority = false, decorative = false, className = '', style, ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (failed) {
    return (
      <div
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : `${photo.alt} (image unavailable)`}
        className={`flex flex-col items-center justify-center gap-2 bg-linen text-muted ${className}`}
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 14px, rgb(0 0 0 / 0.025) 14px 15px)', ...style }}
      >
        <ImageOff aria-hidden className="size-6 opacity-60" />
        <span className="px-4 text-center text-xs">Photo unavailable offline</span>
      </div>
    );
  }
  return (
    <img
      src={photoUrl(photo, 1280)}
      srcSet={photoSrcSet(photo)}
      sizes={sizes}
      alt={decorative ? '' : photo.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setFailed(true)}
      onLoad={() => setLoaded(true)}
      className={`bg-linen object-cover transition-opacity duration-500 ${loaded || priority ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ objectPosition: photo.focus, ...style }}
      draggable={false}
      {...rest}
    />
  );
}
