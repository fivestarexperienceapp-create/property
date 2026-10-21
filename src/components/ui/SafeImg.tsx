import { useState, type ImgHTMLAttributes } from 'react';

/** Plain image that quietly becomes a neutral tile if it can't load (e.g. offline). */
export function SafeImg({ className = '', alt = '', ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span role={alt ? 'img' : undefined} aria-label={alt || undefined} className={`block bg-linen ${className}`} />;
  return <img alt={alt} className={className} onError={() => setFailed(true)} {...rest} />;
}
