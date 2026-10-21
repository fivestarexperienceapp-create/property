import { useId, useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, Info, RotateCcw } from 'lucide-react';
import type { Property } from '../../config/types';
import { estimatePayment, parseMortgageForm, parseNumber, type MortgageField, type MortgageFormValues } from '../../lib/mortgage';
import { formatMoney, formatNumber } from '../../lib/format';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

/** Illustrative assumptions only, clearly labeled in the UI. */
export const DEFAULT_ASSUMPTIONS = { downPercent: 20, ratePercent: 6.5, termYears: 30, pmiRatePercent: 0.5 };

function defaults(property: Property): MortgageFormValues {
  return {
    price: formatNumber(property.price),
    downPayment: String(DEFAULT_ASSUMPTIONS.downPercent),
    downPaymentMode: 'percent',
    ratePercent: String(DEFAULT_ASSUMPTIONS.ratePercent),
    termYears: String(DEFAULT_ASSUMPTIONS.termYears),
    annualTaxes: formatNumber(property.annualTaxes),
    annualInsurance: formatNumber(property.annualInsurance),
    hoaMonthly: formatNumber(property.hoaMonthly),
    includePmi: false,
    pmiMonthly: '',
  };
}

const SEGMENTS = [
  { key: 'principalAndInterest', label: 'Principal & interest', color: 'var(--color-sage-strong)' },
  { key: 'taxes', label: 'Property taxes', color: 'var(--color-sage)' },
  { key: 'insurance', label: 'Homeowners insurance', color: '#c3b49a' },
  { key: 'hoa', label: 'HOA fees', color: '#8f8a80' },
  { key: 'pmi', label: 'Mortgage insurance', color: '#b5714f' },
] as const;

export function MortgageCalculator({ property }: { property: Property }) {
  const [values, setValues] = useState<MortgageFormValues>(() => defaults(property));
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const parsed = useMemo(() => parseMortgageForm(values), [values]);
  const result = parsed.ok ? estimatePayment(parsed.input) : null;
  const errors = parsed.ok ? {} : parsed.errors;
  const isDefault = JSON.stringify(values) === JSON.stringify(defaults(property));

  const set = (key: keyof MortgageFormValues) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const switchMode = (mode: 'amount' | 'percent') => {
    if (mode === values.downPaymentMode) return;
    const price = parseNumber(values.price);
    const current = parseNumber(values.downPayment);
    let next = values.downPayment;
    if (price && price > 0 && current !== null) {
      next = mode === 'amount' ? formatNumber(Math.round((price * current) / 100)) : formatNumber(Math.round((current / price) * 1000) / 10);
    }
    setValues((v) => ({ ...v, downPaymentMode: mode, downPayment: next }));
  };

  const togglePmi = (on: boolean) => {
    setValues((v) => {
      if (!on) return { ...v, includePmi: false };
      let suggestion = v.pmiMonthly;
      if (!suggestion && parsed.ok) {
        const loan = parsed.input.price - parsed.downPaymentAmount;
        suggestion = formatNumber(Math.round((loan * DEFAULT_ASSUMPTIONS.pmiRatePercent) / 100 / 12));
      }
      return { ...v, includePmi: true, pmiMonthly: suggestion || '0' };
    });
  };

  const field = (name: MortgageField, label: string, control: ReactNode, hint?: string) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id(name)} className="text-sm font-semibold">
        {label}
      </label>
      {control}
      {errors[name] ? (
        <p id={`${id(name)}-err`} className="flex items-center gap-1.5 text-sm text-[#a2462f]">
          <AlertCircle aria-hidden className="size-4 shrink-0" /> {errors[name]}
        </p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );

  const money = (name: MortgageField, key: keyof MortgageFormValues, suffix?: string) => (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">$</span>
      <input
        id={id(name)}
        className={`field pl-7 ${suffix ? 'pr-16' : ''}`}
        inputMode="decimal"
        autoComplete="off"
        value={values[key] as string}
        onChange={set(key)}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${id(name)}-err` : undefined}
      />
      {suffix && <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-muted">{suffix}</span>}
    </div>
  );

  const downPercent = parsed.ok ? parsed.downPaymentPercent : null;
  const showPmiHint = parsed.ok && !values.includePmi && downPercent !== null && downPercent < 20 && parsed.input.price > parsed.downPaymentAmount;

  return (
    <section id="payment" aria-labelledby="payment-title" className="py-16 md:py-28">
      <div className="container-page">
        <SectionHeading
          id="payment-title"
          eyebrow="Payment estimator"
          title="Estimate your monthly payment"
          intro="Adjust the numbers to see how price, down payment and rate shape a monthly budget."
        />
        <Reveal className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <form className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-7" onSubmit={(e) => e.preventDefault()} noValidate>
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-sage-soft/60 px-4 py-3 text-sm">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-sage-strong" />
              <p>
                Default values are <strong>illustrative assumptions</strong>, not quotes: {DEFAULT_ASSUMPTIONS.downPercent}% down, {DEFAULT_ASSUMPTIONS.ratePercent}% fixed for {DEFAULT_ASSUMPTIONS.termYears} years, and this listing’s estimated taxes, insurance and HOA.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {field('price', 'Purchase price', money('price', 'price'))}
              {field(
                'downPayment',
                'Down payment',
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    {values.downPaymentMode === 'amount' && <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">$</span>}
                    <input
                      id={id('downPayment')}
                      className={`field ${values.downPaymentMode === 'amount' ? 'pl-7' : 'pr-8'}`}
                      inputMode="decimal"
                      autoComplete="off"
                      value={values.downPayment}
                      onChange={set('downPayment')}
                      aria-invalid={!!errors.downPayment}
                      aria-describedby={errors.downPayment ? `${id('downPayment')}-err` : `${id('dp-hint')}`}
                    />
                    {values.downPaymentMode === 'percent' && <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted">%</span>}
                  </div>
                  <div role="radiogroup" aria-label="Down payment unit" className="flex shrink-0 rounded-xl border border-line bg-linen p-1">
                    {(['percent', 'amount'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        role="radio"
                        aria-checked={values.downPaymentMode === mode}
                        aria-label={mode === 'percent' ? 'Percent of price' : 'Dollar amount'}
                        onClick={() => switchMode(mode)}
                        className={`w-10 rounded-lg text-sm font-semibold transition ${values.downPaymentMode === mode ? 'bg-surface text-ink shadow-sm' : 'text-muted'}`}
                      >
                        {mode === 'percent' ? '%' : '$'}
                      </button>
                    ))}
                  </div>
                </div>,
              )}
              {field(
                'ratePercent',
                'Interest rate',
                <div className="relative">
                  <input id={id('ratePercent')} className="field pr-8" inputMode="decimal" autoComplete="off" value={values.ratePercent} onChange={set('ratePercent')} aria-invalid={!!errors.ratePercent} aria-describedby={errors.ratePercent ? `${id('ratePercent')}-err` : undefined} />
                  <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted">%</span>
                </div>,
                'Annual rate, fixed',
              )}
              {field(
                'termYears',
                'Loan term',
                <select id={id('termYears')} className="field" value={values.termYears} onChange={set('termYears')}>
                  {[30, 25, 20, 15, 10].map((t) => (
                    <option key={t} value={t}>
                      {t} years
                    </option>
                  ))}
                </select>,
              )}
              {field('annualTaxes', 'Property taxes', money('annualTaxes', 'annualTaxes', '/ year'))}
              {field('annualInsurance', 'Homeowners insurance', money('annualInsurance', 'annualInsurance', '/ year'))}
              {field('hoaMonthly', 'HOA fees', money('hoaMonthly', 'hoaMonthly', '/ month'))}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold">Mortgage insurance</span>
                <label className="flex h-[2.95rem] cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface px-3.5">
                  <input type="checkbox" checked={values.includePmi} onChange={(e) => togglePmi(e.target.checked)} className="size-4 accent-[var(--color-sage-strong)]" />
                  <span className="text-sm">Include monthly mortgage insurance</span>
                </label>
              </div>
              {values.includePmi && field('pmiMonthly', 'Mortgage insurance amount', money('pmiMonthly', 'pmiMonthly', '/ month'), `Suggested starting point: about ${DEFAULT_ASSUMPTIONS.pmiRatePercent}% of the loan per year.`)}
            </div>
            <p id={id('dp-hint')} className="mt-4 text-xs text-muted">
              {parsed.ok && `Down payment: ${formatMoney(parsed.downPaymentAmount)} (${formatNumber(Math.round(parsed.downPaymentPercent * 10) / 10)}% of price).`}
              {showPmiHint && ' Loans with less than 20% down often include mortgage insurance.'}
            </p>
            <button
              type="button"
              onClick={() => setValues(defaults(property))}
              disabled={isDefault}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sage-strong disabled:text-muted disabled:opacity-60"
            >
              <RotateCcw aria-hidden className="size-4" /> Reset to illustrative defaults
            </button>
          </form>

          <div className="flex flex-col rounded-[1.5rem] bg-ink p-6 text-white shadow-[var(--shadow-lift)] sm:p-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">Estimated monthly total</p>
            <p className="font-display mt-2 text-6xl leading-none md:text-7xl" aria-live="polite" aria-atomic="true">
              {result ? formatMoney(result.total) : '—'}
            </p>
            {!result && <p className="mt-3 text-sm text-white/75">Check the highlighted fields to see your estimate.</p>}
            {result && (
              <>
                <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-white/10" aria-hidden>
                  {SEGMENTS.map((s) => {
                    const v = result[s.key];
                    return v > 0 ? <span key={s.key} style={{ width: `${(v / (result.total || 1)) * 100}%`, background: s.color }} /> : null;
                  })}
                </div>
                <dl className="mt-6 divide-y divide-white/10">
                  {SEGMENTS.filter((s) => s.key !== 'pmi' || values.includePmi).map((s) => (
                    <div key={s.key} className="flex items-center justify-between gap-4 py-2.5 text-[0.95rem]">
                      <dt className="flex items-center gap-2.5 text-white/80">
                        <span aria-hidden className="size-2.5 rounded-full" style={{ background: s.color }} />
                        {s.label}
                      </dt>
                      <dd className="font-semibold tabular-nums">{formatMoney(result[s.key])}</dd>
                    </div>
                  ))}
                </dl>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white/[0.06] p-3">
                    <dt className="text-white/60">Loan amount</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">{formatMoney(result.loanAmount)}</dd>
                  </div>
                  <div className="rounded-xl bg-white/[0.06] p-3">
                    <dt className="text-white/60">Interest over term</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">{formatMoney(result.totalInterest)}</dd>
                  </div>
                </dl>
                {result.loanAmount === 0 && <p className="mt-3 text-sm text-white/75">With no loan balance, only taxes, insurance and HOA fees remain.</p>}
              </>
            )}
            <p className="mt-auto pt-6 text-xs leading-relaxed text-white/70">Estimated payment only. Not a loan offer. Actual costs and eligibility vary.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
