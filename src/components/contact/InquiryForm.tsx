import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, Copy, ExternalLink, Eye, Mail, Send, ShieldCheck, WifiOff } from 'lucide-react';
import { agent, integrations, properties, site } from '../../config';
import { upcomingWeekday } from '../../config/demo-dates';
import { useOnline } from '../../lib/pwa';
import { copyText, shareLink } from '../../lib/share';
import { href } from '../../lib/router';
import { toast } from '../../state/toast';
import { Button, LinkButton } from '../ui/Button';
import { SampleTag } from '../ui/Badge';

export type InquiryType = 'tour' | 'question';

interface Values {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message: string;
  propertyId: string;
  company: string; // honeypot
}

type Status =
  | { kind: 'idle' }
  | { kind: 'preview' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'drafted'; mailto: string; body: string }
  | { kind: 'error'; message: string };

const TIME_OPTIONS = ['Morning', 'Midday', 'Afternoon', 'Evening', 'I’m flexible'];
const firstName = agent.name.split(' ')[0];

function sampleValues(type: InquiryType, propertyId: string): Values {
  const property = properties.find((p) => p.id === propertyId);
  const home = property?.name ?? 'one of your listings';
  return {
    name: 'Alex Sample',
    email: 'alex.sample@example.com',
    phone: '(314) 555-0175',
    date: upcomingWeekday(6),
    time: 'Afternoon',
    message:
      type === 'tour'
        ? `Hi ${firstName}, we’d love to see ${home} in person. Saturday afternoon works best for us.`
        : `Hi ${firstName}, is the backyard at ${home} fenced, and which appliances are included?`,
    propertyId,
    company: '',
  };
}

const emptyValues = (propertyId: string): Values => ({ name: '', email: '', phone: '', date: '', time: '', message: '', propertyId, company: '' });

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function validate(values: Values, type: InquiryType): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  if (!values.email.trim()) errors.email = 'Please enter your email so the agent can reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  if (values.phone.trim() && values.phone.replace(/\D/g, '').length < 7) errors.phone = 'Please enter a complete phone number or leave it blank.';
  if (type === 'tour' && values.date && values.date < todayIso()) errors.date = 'Please choose today or a future date.';
  if (type === 'question' && !values.message.trim()) errors.message = 'Please add your question.';
  if (values.message.length > 2000) errors.message = 'Please keep your message under 2,000 characters.';
  return errors;
}

function summaryLines(values: Values, type: InquiryType) {
  const property = properties.find((p) => p.id === values.propertyId);
  const lines: Array<[string, string]> = [
    ['Request', type === 'tour' ? 'Tour request' : 'Question'],
    ['Home', property?.name ?? 'General inquiry'],
    ['Name', values.name.trim()],
    ['Email', values.email.trim()],
  ];
  if (values.phone.trim()) lines.push(['Phone', values.phone.trim()]);
  if (type === 'tour' && values.date) lines.push(['Preferred date', new Date(`${values.date}T12:00`).toLocaleDateString(site.locale, { weekday: 'long', month: 'long', day: 'numeric' })]);
  if (type === 'tour' && values.time) lines.push(['Preferred time', values.time]);
  return { property, lines };
}

export function InquiryForm({
  initialType = 'tour',
  propertyId,
  onClose,
  idPrefix = 'inquiry',
  showPropertyPicker = false,
}: {
  initialType?: InquiryType;
  propertyId?: string;
  onClose?: () => void;
  idPrefix?: string;
  showPropertyPicker?: boolean;
}) {
  const demo = site.demoMode;
  const [type, setType] = useState<InquiryType>(initialType);
  const startProperty = propertyId ?? (showPropertyPicker ? '' : site.featuredPropertyId);
  const [values, setValues] = useState<Values>(() => (demo ? sampleValues(initialType, startProperty || site.featuredPropertyId) : emptyValues(startProperty)));
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const online = useOnline();
  const resultRef = useRef<HTMLElement>(null);
  const uid = useId();
  const fieldId = (name: string) => `${idPrefix}-${uid}-${name}`;
  const endpoint = integrations.inquiry.endpoint;

  const switchType = (next: InquiryType) => {
    setType(next);
    setErrors({});
    if (demo) setValues(sampleValues(next, values.propertyId || site.featuredPropertyId));
  };

  const set = (key: keyof Values) => (event: { target: { value: string } }) => {
    if (demo) return;
    setValues((v) => ({ ...v, [key]: event.target.value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Bring each result (preview, sent, draft) into view and announce it.
  useEffect(() => {
    if (status.kind !== 'idle' && status.kind !== 'sending' && status.kind !== 'error') resultRef.current?.focus();
  }, [status.kind]);

  const pageUrl = useMemo(() => shareLink(values.propertyId ? href.property(values.propertyId) : href.home()), [values.propertyId]);

  const buildBody = () => {
    const { lines } = summaryLines(values, type);
    return [...lines.map(([k, v]) => `${k}: ${v}`), '', values.message.trim(), '', `Sent from ${pageUrl}`].join('\n');
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (demo) {
      setStatus({ kind: 'preview' });
      return;
    }
    if (values.company) return; // honeypot: ignore automated submissions
    const found = validate(values, type);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      document.getElementById(fieldId(first))?.focus();
      return;
    }
    const { property } = summaryLines(values, type);
    const subject = `${type === 'tour' ? 'Tour request' : 'Question'}: ${property?.name ?? site.appName}`;

    if (!endpoint) {
      const body = buildBody();
      const mailto = `mailto:${agent.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      setStatus({ kind: 'drafted', mailto, body });
      return;
    }
    if (!online) {
      setStatus({ kind: 'error', message: 'You appear to be offline. Reconnect to the internet to send your message.' });
      return;
    }
    setStatus({ kind: 'sending' });
    const payload: Record<string, string> = {
      ...integrations.inquiry.extraFields,
      type: type === 'tour' ? 'Tour request' : 'Question',
      subject,
      property: property?.name ?? 'General inquiry',
      propertyId: values.propertyId,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      preferredDate: type === 'tour' ? values.date : '',
      preferredTime: type === 'tour' ? values.time : '',
      message: values.message.trim(),
      page: pageUrl,
    };
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: integrations.inquiry.format === 'json' ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
        body: integrations.inquiry.format === 'json' ? JSON.stringify(payload) : new URLSearchParams(payload),
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      setStatus({ kind: 'sent' });
    } catch {
      setStatus({ kind: 'error', message: 'Your message couldn’t be sent right now. Please try again in a moment.' });
    } finally {
      window.clearTimeout(timer);
    }
  }

  // ----- Result screens --------------------------------------------------------
  if (status.kind === 'preview') {
    const { lines } = summaryLines(values, type);
    return (
      <div className="pb-6" aria-live="polite">
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-sage bg-sage-soft/60 p-4">
          <Eye aria-hidden className="mt-0.5 size-5 shrink-0 text-sage-strong" />
          <div>
            <p ref={resultRef as RefObject<HTMLParagraphElement>} tabIndex={-1} className="font-semibold outline-none">
              Demo preview: this inquiry was not sent.
            </p>
            <p className="mt-1 text-sm text-muted">
              No information was collected or stored. On a live site, {firstName} receives this message by email or through the agent’s form service.
            </p>
          </div>
        </div>
        <p className="eyebrow mt-6 mb-3">What {firstName} would receive</p>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-soft)]">
          <dl className="grid gap-2 text-sm sm:grid-cols-[9rem_1fr]">
            {lines.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          {values.message && <p className="mt-4 border-t border-line pt-4 text-[0.95rem] leading-relaxed whitespace-pre-line">{values.message}</p>}
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" icon={<ArrowLeft aria-hidden className="size-4" />} onClick={() => setStatus({ kind: 'idle' })}>
            Back to the form
          </Button>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (status.kind === 'sent') {
    return (
      <div className="pb-6 text-center" role="status">
        <CheckCircle2 aria-hidden className="mx-auto size-10 text-sage-strong" />
        <h3 ref={resultRef as RefObject<HTMLHeadingElement>} tabIndex={-1} className="font-display mt-3 text-3xl outline-none">
          Message sent
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          Thanks, {values.name.split(' ')[0]}. Your {type === 'tour' ? 'tour request' : 'question'} was delivered to {agent.name}, who will reply by email or phone.
        </p>
        {onClose && (
          <Button className="mt-6" onClick={onClose}>
            Done
          </Button>
        )}
      </div>
    );
  }

  if (status.kind === 'drafted') {
    return (
      <div className="pb-6" role="status">
        <div className="flex items-start gap-3 rounded-2xl bg-sage-soft/70 p-4">
          <Mail aria-hidden className="mt-0.5 size-5 shrink-0 text-sage-strong" />
          <div>
            <p ref={resultRef as RefObject<HTMLParagraphElement>} tabIndex={-1} className="font-semibold outline-none">
              Your email app should now be open.
            </p>
            <p className="mt-1 text-sm text-muted">
              We prepared a message to {agent.name}. It’s only sent when you press Send in your email app. If nothing opened, copy the message and email it to {agent.contact.email}.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <LinkButton href={status.mailto} icon={<Mail aria-hidden className="size-4" />}>
            Open email again
          </LinkButton>
          <Button
            variant="secondary"
            icon={<Copy aria-hidden className="size-4" />}
            onClick={async () => toast((await copyText(`${agent.contact.email}\n\n${status.body}`)) ? 'Message copied' : 'Copy isn’t available in this browser')}
          >
            Copy message
          </Button>
          <Button variant="ghost" icon={<ArrowLeft aria-hidden className="size-4" />} onClick={() => setStatus({ kind: 'idle' })}>
            Edit
          </Button>
        </div>
      </div>
    );
  }

  // ----- Form ------------------------------------------------------------------
  const readOnly = demo;
  const describedBy = (key: keyof Values) => (errors[key] ? `${fieldId(key)}-error` : undefined);
  const field = (key: keyof Values, label: string, input: ReactNode, hint?: string) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId(key)} className="flex items-center gap-2 text-sm font-semibold">
        {label}
        {demo && <SampleTag />}
      </label>
      {input}
      {hint && !errors[key] && <p className="text-xs text-muted">{hint}</p>}
      {errors[key] && (
        <p id={`${fieldId(key)}-error`} className="flex items-center gap-1.5 text-sm text-[#a2462f]">
          <AlertCircle aria-hidden className="size-4" /> {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="pb-6">
      <div role="radiogroup" aria-label="Type of inquiry" className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1">
        {(['tour', 'question'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => switchType(t)}
            className={`h-10 rounded-full text-sm font-semibold transition ${type === t ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}
          >
            {t === 'tour' ? 'Schedule a tour' : 'Ask a question'}
          </button>
        ))}
      </div>

      {demo && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-dashed border-sage bg-sage-soft/50 p-4 text-sm">
          <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-sage-strong" />
          <p>
            <span className="font-semibold">Demo preview.</span> The fields below contain sample details and can’t be edited. Nothing is sent, and no personal information is collected.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {field('name', 'Name', <input id={fieldId('name')} className="field" autoComplete={demo ? 'off' : 'name'} value={values.name} onChange={set('name')} readOnly={readOnly} aria-invalid={!!errors.name} aria-describedby={describedBy('name')} required />)}
        {field('email', 'Email', <input id={fieldId('email')} className="field" type="email" inputMode="email" autoComplete={demo ? 'off' : 'email'} value={values.email} onChange={set('email')} readOnly={readOnly} aria-invalid={!!errors.email} aria-describedby={describedBy('email')} required />)}
        {field('phone', 'Phone (optional)', <input id={fieldId('phone')} className="field" type="tel" inputMode="tel" autoComplete={demo ? 'off' : 'tel'} value={values.phone} onChange={set('phone')} readOnly={readOnly} aria-invalid={!!errors.phone} aria-describedby={describedBy('phone')} />)}
        {showPropertyPicker || !propertyId
          ? field(
              'propertyId',
              'Home',
              <select id={fieldId('propertyId')} className="field" value={values.propertyId} onChange={set('propertyId')} disabled={readOnly}>
                <option value="">General inquiry</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>,
            )
          : null}
        {type === 'tour' && (
          <>
            {field('date', 'Preferred date', <input id={fieldId('date')} className="field" type="date" min={todayIso()} value={values.date} onChange={set('date')} readOnly={readOnly} aria-invalid={!!errors.date} aria-describedby={describedBy('date')} />)}
            {field(
              'time',
              'Preferred time',
              <select id={fieldId('time')} className="field" value={values.time} onChange={set('time')} disabled={readOnly}>
                <option value="">No preference</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>,
            )}
          </>
        )}
        <div className="sm:col-span-2">
          {field(
            'message',
            type === 'question' ? 'Your question' : 'Message (optional)',
            <textarea id={fieldId('message')} className="field min-h-28 resize-y" value={values.message} onChange={set('message')} readOnly={readOnly} maxLength={2000} aria-invalid={!!errors.message} aria-describedby={describedBy('message')} />,
          )}
        </div>
      </div>

      {/* Honeypot for automated submissions; hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" value={values.company} onChange={set('company')} />
        </label>
      </div>

      {status.kind === 'error' && (
        <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e3b7a9] bg-[#fbefea] p-4 text-sm">
          <AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-[#a2462f]" />
          <div>
            <p className="font-semibold">{status.message}</p>
            {agent.contact.email && (
              <p className="mt-1 text-muted">
                You can also email {agent.name} at{' '}
                <a className="font-semibold text-sage-strong underline" href={`mailto:${agent.contact.email}`}>
                  {agent.contact.email}
                </a>
                .
              </p>
            )}
          </div>
        </div>
      )}
      {!demo && endpoint && !online && status.kind !== 'error' && (
        <p className="mt-5 flex items-center gap-2 text-sm text-muted">
          <WifiOff aria-hidden className="size-4" /> You’re offline. Reconnect to send your message.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted sm:max-w-xs">
          {demo
            ? 'Sample details only. This preview never sends or stores anything.'
            : endpoint
              ? `Your details go only to ${agent.name} to respond to this request.`
              : `This opens your email app with a message to ${agent.name}. Nothing is sent until you press Send.`}
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={status.kind === 'sending' || (!demo && !!endpoint && !online)}
          icon={demo ? <Eye aria-hidden className="size-4" /> : endpoint ? <Send aria-hidden className="size-4" /> : <Mail aria-hidden className="size-4" />}
        >
          {demo ? 'Preview inquiry' : status.kind === 'sending' ? 'Sending…' : endpoint ? 'Send message' : 'Open email draft'}
        </Button>
      </div>

      {!demo && type === 'tour' && agent.contact.schedulingUrl && (
        <a
          href={agent.contact.schedulingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center gap-2 text-sm font-semibold text-sage-strong underline-offset-4 hover:underline"
        >
          <CalendarDays aria-hidden className="size-4" /> Prefer to pick a time? Book on {firstName}’s calendar
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      )}
    </form>
  );
}
