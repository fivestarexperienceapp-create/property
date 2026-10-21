import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CalendarCheck, Mail, MessageSquareText, Phone } from 'lucide-react';
import { agent, properties } from '../../config';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { InquiryForm, type InquiryType } from './InquiryForm';

export type DemoContactKind = 'call' | 'text' | 'email' | 'schedule';

interface ContactContextValue {
  openInquiry: (options: { type: InquiryType; propertyId?: string }) => void;
  openDemoNotice: (kind: DemoContactKind, propertyId?: string) => void;
}

const ContactContext = createContext<ContactContextValue | null>(null);

export function useContact() {
  const value = useContext(ContactContext);
  if (!value) throw new Error('useContact must be used inside <ContactProvider>');
  return value;
}

const demoCopy: Record<DemoContactKind, { title: string; body: string; icon: ReactNode }> = {
  call: {
    title: 'Calling is turned off in this demo',
    body: `On a live site, this button calls the agent directly from the visitor’s phone. ${agent.name} and the number shown here are fictional, so no call is placed.`,
    icon: <Phone aria-hidden className="size-5" />,
  },
  text: {
    title: 'Texting is turned off in this demo',
    body: `On a live site, this opens a text message to the agent with one tap. ${agent.name} and the number shown here are fictional, so no message is started.`,
    icon: <MessageSquareText aria-hidden className="size-5" />,
  },
  email: {
    title: 'Email is turned off in this demo',
    body: `On a live site, this opens a pre-addressed email to the agent about this home. The address shown here is a placeholder, so no email is started.`,
    icon: <Mail aria-hidden className="size-5" />,
  },
  schedule: {
    title: 'Scheduling preview',
    body: 'On a live site, this links to the agent’s booking calendar or tour request form.',
    icon: <CalendarCheck aria-hidden className="size-5" />,
  },
};

export function ContactProvider({ children }: { children: ReactNode }) {
  const [inquiry, setInquiry] = useState<{ type: InquiryType; propertyId?: string; key: number } | null>(null);
  const [demo, setDemo] = useState<{ kind: DemoContactKind; propertyId?: string } | null>(null);

  const openInquiry = useCallback((options: { type: InquiryType; propertyId?: string }) => {
    setDemo(null);
    setInquiry({ ...options, key: Date.now() });
  }, []);
  const openDemoNotice = useCallback((kind: DemoContactKind, propertyId?: string) => setDemo({ kind, propertyId }), []);
  const value = useMemo(() => ({ openInquiry, openDemoNotice }), [openInquiry, openDemoNotice]);

  const property = properties.find((p) => p.id === inquiry?.propertyId);
  const closeInquiry = useCallback(() => setInquiry(null), []);
  const closeDemo = useCallback(() => setDemo(null), []);
  const copy = demo ? demoCopy[demo.kind] : null;

  return (
    <ContactContext.Provider value={value}>
      {children}
      <Sheet
        open={!!inquiry}
        onClose={closeInquiry}
        eyebrow={property ? property.name : agent.name}
        title={inquiry?.type === 'question' ? 'Ask a question' : 'Schedule a tour'}
        size="lg"
      >
        {inquiry && <InquiryForm key={inquiry.key} initialType={inquiry.type} propertyId={inquiry.propertyId} onClose={closeInquiry} idPrefix="sheet" />}
      </Sheet>
      <Sheet open={!!demo} onClose={closeDemo} title={copy?.title ?? ''} eyebrow="Demo experience" size="sm">
        {copy && demo && (
          <div className="pb-6">
            <div className="flex gap-4 rounded-2xl bg-sage-soft/70 p-4 text-[0.95rem] leading-relaxed text-ink">
              <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-sage-strong">{copy.icon}</span>
              <p>{copy.body}</p>
            </div>
            <p className="mt-4 text-sm text-muted">You can still preview the full inquiry experience with sample details.</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => openInquiry({ type: demo.kind === 'schedule' ? 'tour' : 'question', propertyId: demo.propertyId })}>
                Preview the inquiry form
              </Button>
              <Button variant="secondary" onClick={closeDemo}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </ContactContext.Provider>
  );
}
