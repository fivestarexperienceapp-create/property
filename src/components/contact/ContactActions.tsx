import type { ReactNode } from 'react';
import { CalendarCheck, Mail, MessageCircleQuestion, MessageSquareText, Phone } from 'lucide-react';
import { agent, properties, site } from '../../config';
import { useContact, type DemoContactKind } from './ContactContext';

export interface ContactAction {
  key: 'call' | 'text' | 'email' | 'schedule' | 'ask';
  label: string;
  icon: ReactNode;
  /** Live link (tel:, sms:, mailto:, https:) when available. */
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

/**
 * Contact actions for the agent. In demo mode phone, text and email never open real
 * links; they explain what happens on a live site instead.
 */
export function useContactActions(propertyId?: string): ContactAction[] {
  const { openInquiry, openDemoNotice } = useContact();
  const { phone, sms, email, schedulingUrl } = agent.contact;
  const property = properties.find((p) => p.id === propertyId);
  const demo = site.demoMode;
  const demoClick = (kind: DemoContactKind) => () => openDemoNotice(kind, propertyId);
  const actions: ContactAction[] = [];

  if (phone) {
    actions.push({ key: 'call', label: 'Call', icon: <Phone aria-hidden className="size-[1.1rem]" />, ...(demo ? { onClick: demoClick('call') } : { href: `tel:${phone}` }) });
  }
  const textNumber = sms || phone;
  if (textNumber) {
    const body = property ? `?&body=${encodeURIComponent(`Hi ${agent.name.split(' ')[0]}, I'm interested in ${property.name}.`)}` : '';
    actions.push({ key: 'text', label: 'Text', icon: <MessageSquareText aria-hidden className="size-[1.1rem]" />, ...(demo ? { onClick: demoClick('text') } : { href: `sms:${textNumber}${body}` }) });
  }
  if (email) {
    const subject = encodeURIComponent(property ? `Question about ${property.name}` : `Question for ${agent.name}`);
    actions.push({ key: 'email', label: 'Email', icon: <Mail aria-hidden className="size-[1.1rem]" />, ...(demo ? { onClick: demoClick('email') } : { href: `mailto:${email}?subject=${subject}` }) });
  }
  actions.push({
    key: 'schedule',
    label: 'Schedule a Tour',
    icon: <CalendarCheck aria-hidden className="size-[1.1rem]" />,
    ...(!demo && schedulingUrl ? { href: schedulingUrl, external: true } : { onClick: () => openInquiry({ type: 'tour', propertyId }) }),
  });
  actions.push({
    key: 'ask',
    label: 'Ask a Question',
    icon: <MessageCircleQuestion aria-hidden className="size-[1.1rem]" />,
    onClick: () => openInquiry({ type: 'question', propertyId }),
  });
  return actions;
}

export function ActionControl({ action, className, children }: { action: ContactAction; className: string; children?: ReactNode }) {
  const content = children ?? (
    <>
      {action.icon}
      <span>{action.label}</span>
    </>
  );
  if (action.href) {
    return (
      <a href={action.href} className={className} {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {content}
    </button>
  );
}
