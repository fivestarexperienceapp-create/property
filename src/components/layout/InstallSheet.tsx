import { useState } from 'react';
import { CheckCircle2, Download, MoreVertical, PlusSquare, Share } from 'lucide-react';
import { site } from '../../config';
import { promptInstall, useInstallPlatform, type InstallPlatform } from '../../lib/install';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';

function Steps({ steps }: { steps: React.ReactNode[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sm font-semibold text-sage-strong">{i + 1}</span>
          <span className="pt-0.5 leading-relaxed">{step}</span>
        </li>
      ))}
    </ol>
  );
}

const ico = 'mx-0.5 inline size-4 -translate-y-px text-sage-strong';

function guidance(platform: InstallPlatform) {
  switch (platform) {
    case 'ios':
      return (
        <Steps
          steps={[
            <>Tap the Share button <Share aria-label="Share" className={ico} /> in your browser’s toolbar.</>,
            <>Scroll down and choose <strong>Add to Home Screen</strong> <PlusSquare aria-hidden className={ico} />.</>,
            <>Tap <strong>Add</strong>. The app icon appears on your home screen.</>,
          ]}
        />
      );
    case 'mac-safari':
      return <Steps steps={[<>In the menu bar, choose <strong>File</strong>, then <strong>Add to Dock</strong>.</>, <>Click <strong>Add</strong>. Open the app from your Dock or Launchpad.</>]} />;
    case 'android-firefox':
      return <Steps steps={[<>Open the browser menu <MoreVertical aria-label="menu" className={ico} />.</>, <>Tap <strong>Add app to Home screen</strong> (or <strong>Install</strong>).</>]} />;
    case 'samsung':
      return <Steps steps={[<>Open the browser menu (☰).</>, <>Tap <strong>Add page to</strong>, then <strong>Home screen</strong>.</>]} />;
    case 'android-other':
      return <Steps steps={[<>Open the browser menu <MoreVertical aria-label="menu" className={ico} />.</>, <>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.</>]} />;
    case 'chromium-desktop':
      return <Steps steps={[<>Look for the install icon <Download aria-hidden className={ico} /> at the right end of the address bar.</>, <>Or open the browser menu and choose <strong>Install</strong> or <strong>Apps → Install this site as an app</strong>.</>]} />;
    case 'firefox-desktop':
      return <p className="leading-relaxed">Firefox on desktop doesn’t install web apps. Bookmark this page, or open it in Chrome, Edge or Safari to add it as an app.</p>;
    default:
      return <p className="leading-relaxed">Use your browser’s menu and look for <strong>Add to Home Screen</strong> or <strong>Install app</strong>. You can also bookmark this page.</p>;
  }
}

export function InstallSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const platform = useInstallPlatform();
  const [result, setResult] = useState<string | null>(null);
  return (
    <Sheet open={open} onClose={onClose} title={`Install ${site.appShortName}`} description="Keep these homes one tap away. The app opens full screen and works offline for pages you’ve viewed." size="sm">
      <div className="pb-6 text-[0.95rem]">
        {platform === 'installed' ? (
          <p className="flex items-center gap-2 font-semibold text-sage-strong">
            <CheckCircle2 aria-hidden className="size-5" /> You’re already using the installed app.
          </p>
        ) : platform === 'prompt' ? (
          <div>
            <p className="mb-4 text-muted">Your browser can install this app directly.</p>
            <Button
              icon={<Download aria-hidden className="size-4" />}
              onClick={async () => {
                const outcome = await promptInstall();
                setResult(outcome === 'accepted' ? 'Installed. Look for the app icon on your device.' : outcome === 'dismissed' ? 'No problem. You can install any time from this menu.' : null);
              }}
            >
              Install app
            </Button>
            {result && <p className="mt-3 text-sm text-muted" role="status">{result}</p>}
          </div>
        ) : (
          guidance(platform)
        )}
        <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-muted">Saved homes and notes stay on this device. Installing doesn’t create an account or share any information.</p>
      </div>
    </Sheet>
  );
}
