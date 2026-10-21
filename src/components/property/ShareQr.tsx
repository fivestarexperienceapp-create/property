import { useEffect, useState } from 'react';
import { Copy, Download, Printer, QrCode, Share2 } from 'lucide-react';
import type { Property } from '../../config/types';
import { qrPng, qrSvg } from '../../lib/qr';
import { downloadBlob } from '../../lib/ics';
import { copyText, propertyLink } from '../../lib/share';
import { toast } from '../../state/toast';
import { Button } from '../ui/Button';

export function useQrSvg(url: string | null) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (url) qrSvg(url).then((s) => alive && setSvg(s)).catch(() => alive && setSvg(null));
    return () => {
      alive = false;
    };
  }, [url]);
  return svg;
}

export function ShareQr({ property, onShare }: { property: Property; onShare: () => void }) {
  const url = propertyLink(property.id);
  const svg = useQrSvg(url);
  const shortUrl = url?.replace(/^https:\/\//, '').replace(/#\/homes\/.*/, '') ?? '';

  return (
    <div className="flex h-full flex-col">
      <p className="flex items-center gap-2 font-semibold">
        <QrCode aria-hidden className="size-4 text-sage-strong" /> Share this home
      </p>
      <div className="mt-4 flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-white p-1.5">
          {url && svg ? (
            <div className="size-full [&>svg]:size-full" role="img" aria-label={`QR code linking to ${url}`} dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <p className="px-3 text-center text-xs text-muted">{url ? 'Generating…' : 'QR code unavailable in this preview'}</p>
          )}
        </div>
        <div className="w-full min-w-0 text-sm text-muted">
          <p>Scan to open this home on any phone, or download the code for flyers and signs.</p>
          {url && <p className="mt-2 truncate text-xs" title={url}>{shortUrl}</p>}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button size="sm" variant="primary" icon={<Share2 aria-hidden className="size-4" />} onClick={onShare}>
          Share
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={<Copy aria-hidden className="size-4" />}
          onClick={async () => {
            const link = url ?? window.location.href;
            toast((await copyText(link)) ? 'Link copied' : 'Couldn’t copy. Long-press the address bar instead.', 'success');
          }}
        >
          Copy link
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!url}
          icon={<Download aria-hidden className="size-4" />}
          onClick={async () => {
            if (!url) return;
            try {
              downloadBlob(`${property.id}-qr.png`, await qrPng(url, property.name, shortUrl));
            } catch {
              toast('Couldn’t create the QR image in this browser.');
            }
          }}
        >
          QR code
        </Button>
        <Button size="sm" variant="secondary" icon={<Printer aria-hidden className="size-4" />} onClick={() => window.print()}>
          Print
        </Button>
      </div>
    </div>
  );
}
