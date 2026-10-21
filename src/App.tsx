import { useEffect, useRef } from 'react';
import { branding, properties, site } from './config';
import { parseHash, useHash, type Route } from './lib/router';
import { ContactProvider } from './components/contact/ContactContext';
import { DemoNotice } from './components/layout/DemoNotice';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { NetworkStatus } from './components/layout/NetworkStatus';
import { Toaster } from './components/ui/Toaster';
import { AboutPage } from './pages/AboutPage';
import { AgentPage } from './pages/AgentPage';
import { ComparePage } from './pages/ComparePage';
import { ListingsPage } from './pages/ListingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PropertyPage } from './pages/PropertyPage';
import { SavedPage } from './pages/SavedPage';

const featured = properties.find((p) => p.id === site.featuredPropertyId) ?? properties[0];

function resolve(route: Route) {
  switch (route.name) {
    case 'home':
      return { key: 'home', nav: 'home', title: site.title, page: <PropertyPage property={featured} />, propertyId: featured.id };
    case 'property': {
      const property = properties.find((p) => p.id === route.id);
      if (!property) return { key: `missing-${route.id}`, nav: 'homes', title: `Home not found · ${branding.brokerageName}`, page: <NotFoundPage kind="property" /> };
      return { key: `property-${property.id}`, nav: property.id === featured.id ? 'home' : 'homes', title: `${property.name} · ${branding.brokerageName}`, page: <PropertyPage property={property} />, propertyId: property.id };
    }
    case 'homes':
      return { key: 'homes', nav: 'homes', title: `Homes for sale · ${branding.brokerageName}`, page: <ListingsPage /> };
    case 'compare':
      return { key: 'compare', nav: 'compare', title: `Compare homes · ${branding.brokerageName}`, page: <ComparePage /> };
    case 'saved':
      return { key: 'saved', nav: 'saved', title: `Saved homes · ${branding.brokerageName}`, page: <SavedPage /> };
    case 'agent':
      return { key: 'agent', nav: 'agent', title: `Contact the agent · ${branding.brokerageName}`, page: <AgentPage /> };
    case 'about':
      return { key: 'about', nav: '', title: `About this site · ${branding.brokerageName}`, page: <AboutPage /> };
    default:
      return { key: 'not-found', nav: '', title: `Page not found · ${branding.brokerageName}`, page: <NotFoundPage /> };
  }
}

export function App() {
  const hash = useHash();
  const view = resolve(parseHash(hash));
  const first = useRef(true);

  useEffect(() => {
    document.title = view.title;
    if (first.current) {
      first.current = false;
      return;
    }
    // New "page": start at the top and move focus to its heading for screen readers.
    window.scrollTo({ top: 0, behavior: 'auto' });
    requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true }));
  }, [view.key, view.title]);

  return (
    <ContactProvider>
      <div className="flex min-h-dvh flex-col">
        <button
          type="button"
          onClick={() => document.querySelector<HTMLElement>('main h1')?.focus()}
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </button>
        <DemoNotice />
        <Header active={view.nav} propertyId={view.propertyId} />
        <NetworkStatus />
        <main id="main" className="flex-1" key={view.key}>
          {view.page}
        </main>
        <Footer />
        <Toaster />
      </div>
    </ContactProvider>
  );
}
