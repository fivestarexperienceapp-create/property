import { useCallback, useEffect, useState } from 'react';
import { CalendarCheck, Download, Heart, Home, Info, LayoutGrid, Menu, Rows3, UserRound } from 'lucide-react';
import { agent, site } from '../../config';
import { href } from '../../lib/router';
import { useCompare, useFavorites } from '../../state/collections';
import { useContact } from '../contact/ContactContext';
import { Wordmark } from '../ui/BrandMark';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { InstallSheet } from './InstallSheet';

const navItems = [
  { key: 'home', label: 'Featured home', short: 'Featured', href: href.home(), icon: Home },
  { key: 'homes', label: 'Browse homes', short: 'Homes', href: href.homes(), icon: LayoutGrid },
  { key: 'saved', label: 'Saved', short: 'Saved', href: href.saved(), icon: Heart },
  { key: 'compare', label: 'Compare', short: 'Compare', href: href.compare(), icon: Rows3 },
  { key: 'agent', label: `About ${agent.name.split(' ')[0]}`, short: 'Agent', href: href.agent(), icon: UserRound },
] as const;

export function Header({ active, propertyId }: { active: string; propertyId?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const favorites = useFavorites();
  const compare = useCompare();
  const { openInquiry } = useContact();
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeInstall = useCallback(() => setInstallOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const count = (key: string) => (key === 'saved' ? favorites.ids.length : key === 'compare' ? compare.ids.length : 0);

  return (
    <header
      data-print-hide
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${scrolled ? 'border-line bg-canvas/92 backdrop-blur-lg' : 'border-transparent bg-canvas'}`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a href={href.home()} className="shrink-0 rounded-lg" aria-label={`${site.appName} home`}>
          <Wordmark />
        </a>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const n = count(item.key);
              const isActive = active === item.key;
              return (
                <li key={item.key}>
                  <a
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition ${isActive ? 'bg-ink/[0.06] text-ink' : 'text-muted hover:text-ink'}`}
                  >
                    {item.short}
                    {n > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sage-strong px-1.5 text-[0.7rem] font-semibold text-white">{n}</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={href.saved()}
            className="relative inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
            aria-label={`Saved homes${favorites.ids.length ? ` (${favorites.ids.length})` : ''}`}
          >
            <Heart aria-hidden className="size-5" />
            {favorites.ids.length > 0 && (
              <span className="absolute top-1.5 right-1.5 inline-flex size-4 items-center justify-center rounded-full bg-sage-strong text-[0.6rem] font-bold text-white">
                {favorites.ids.length}
              </span>
            )}
          </a>
          <div className="hidden sm:block">
            <Button size="sm" icon={<CalendarCheck aria-hidden className="size-4" />} onClick={() => openInquiry({ type: 'tour', propertyId })}>
              Schedule a Tour
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink hover:border-ink/30 lg:hidden"
            aria-label="Open menu"
            aria-haspopup="dialog"
          >
            <Menu aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setInstallOpen(true)}
            className="hidden size-10 items-center justify-center rounded-full text-muted hover:bg-ink/5 hover:text-ink lg:inline-flex"
            aria-label="Install app"
            title="Install app"
          >
            <Download aria-hidden className="size-[1.1rem]" />
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onClose={closeMenu} title="Menu" size="sm">
        <nav aria-label="Mobile">
          <ul className="grid gap-1 pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const n = count(item.key);
              return (
                <li key={item.key}>
                  <a
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={active === item.key ? 'page' : undefined}
                    className={`flex h-13 items-center gap-3 rounded-2xl px-4 text-[1.02rem] font-medium ${active === item.key ? 'bg-sage-soft text-ink' : 'hover:bg-ink/5'}`}
                  >
                    <Icon aria-hidden className="size-5 text-sage-strong" />
                    <span className="flex-1">{item.label}</span>
                    {n > 0 && <span className="rounded-full bg-sage-strong px-2 text-xs font-semibold text-white">{n}</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-2 grid gap-2 border-t border-line pt-4 pb-6">
          <Button
            icon={<CalendarCheck aria-hidden className="size-4" />}
            onClick={() => {
              closeMenu();
              openInquiry({ type: 'tour', propertyId });
            }}
          >
            Schedule a Tour
          </Button>
          <Button
            variant="secondary"
            icon={<Download aria-hidden className="size-4" />}
            onClick={() => {
              closeMenu();
              setInstallOpen(true);
            }}
          >
            Install app
          </Button>
          <a href={href.about()} onClick={closeMenu} className="mt-1 flex items-center justify-center gap-1.5 py-2 text-sm text-muted hover:text-ink">
            <Info aria-hidden className="size-4" /> About this site
          </a>
        </div>
      </Sheet>
      <InstallSheet open={installOpen} onClose={closeInstall} />
    </header>
  );
}
