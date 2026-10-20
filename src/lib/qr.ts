import { branding } from '../config';

async function lib() {
  return (await import('qrcode')).default;
}

/** Crisp SVG QR code (used on screen and in the printed summary). */
export async function qrSvg(text: string): Promise<string> {
  const QRCode = await lib();
  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: { dark: branding.colors.ink, light: '#ffffff' },
  });
}

/** High-resolution PNG with a caption, ready for flyers and yard signs. */
export async function qrPng(text: string, title: string, subtitle: string): Promise<Blob> {
  const QRCode = await lib();
  const size = 1200;
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: size,
    color: { dark: '#1f1e1c', light: '#ffffff' },
  });
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size + 220;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(qrCanvas, 0, 0, size, size);
  await document.fonts?.ready;
  ctx.fillStyle = branding.colors.ink;
  ctx.textAlign = 'center';
  ctx.font = `500 76px "Cormorant Garamond", Georgia, serif`;
  ctx.fillText(title, size / 2, size + 92, size - 80);
  ctx.fillStyle = branding.colors.inkMuted;
  ctx.font = `500 34px "Inter Variable", system-ui, sans-serif`;
  ctx.fillText(subtitle, size / 2, size + 160, size - 80);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png'));
}
