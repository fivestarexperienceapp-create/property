/**
 * Mortgage payment estimate using the standard amortization formula:
 *   M = P · r / (1 − (1 + r)^−n)
 * where P = loan amount, r = monthly rate, n = number of monthly payments.
 * Zero interest falls back to P / n; a zero (or negative) loan balance yields 0.
 */

export interface MortgageInput {
  price: number;
  downPayment: number;
  ratePercent: number;
  termYears: number;
  annualTaxes: number;
  annualInsurance: number;
  hoaMonthly: number;
  pmiMonthly: number;
}

export interface MortgageBreakdown {
  loanAmount: number;
  principalAndInterest: number;
  taxes: number;
  insurance: number;
  hoa: number;
  pmi: number;
  total: number;
  totalInterest: number;
  payments: number;
}

export function monthlyPrincipalAndInterest(principal: number, ratePercent: number, termYears: number): number {
  if (!Number.isFinite(principal) || principal <= 0) return 0;
  const n = Math.round(termYears * 12);
  if (!Number.isFinite(n) || n <= 0) return NaN;
  const r = ratePercent / 100 / 12;
  if (!Number.isFinite(r) || r < 0) return NaN;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function estimatePayment(input: MortgageInput): MortgageBreakdown {
  const loanAmount = Math.max(0, input.price - input.downPayment);
  const payments = Math.round(input.termYears * 12);
  const principalAndInterest = monthlyPrincipalAndInterest(loanAmount, input.ratePercent, input.termYears);
  const taxes = input.annualTaxes / 12;
  const insurance = input.annualInsurance / 12;
  const hoa = input.hoaMonthly;
  // Mortgage insurance only applies while there is a loan balance.
  const pmi = loanAmount > 0 ? input.pmiMonthly : 0;
  const total = principalAndInterest + taxes + insurance + hoa + pmi;
  const totalInterest = loanAmount > 0 ? principalAndInterest * payments - loanAmount : 0;
  return { loanAmount, principalAndInterest, taxes, insurance, hoa, pmi, total, totalInterest: Math.max(0, totalInterest), payments };
}

/** Parses user-typed amounts like "$625,000", "6.5%", " 1 800 ". Returns null when not a number. */
export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[\s,$%]/g, '');
  if (!cleaned || !/^-?\d*\.?\d+$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export type MortgageField =
  | 'price'
  | 'downPayment'
  | 'ratePercent'
  | 'termYears'
  | 'annualTaxes'
  | 'annualInsurance'
  | 'hoaMonthly'
  | 'pmiMonthly';

export interface MortgageFormValues {
  price: string;
  downPayment: string;
  downPaymentMode: 'amount' | 'percent';
  ratePercent: string;
  termYears: string;
  annualTaxes: string;
  annualInsurance: string;
  hoaMonthly: string;
  includePmi: boolean;
  pmiMonthly: string;
}

export type ParsedMortgage =
  | { ok: true; input: MortgageInput; downPaymentAmount: number; downPaymentPercent: number }
  | { ok: false; errors: Partial<Record<MortgageField, string>> };

/** Validates form strings and converts them to a calculator input. */
export function parseMortgageForm(values: MortgageFormValues): ParsedMortgage {
  const errors: Partial<Record<MortgageField, string>> = {};
  const num = (field: MortgageField, raw: string, opts: { min?: number; max?: number; label: string }) => {
    const value = parseNumber(raw);
    if (value === null) {
      errors[field] = `Enter ${opts.label}.`;
      return 0;
    }
    if (opts.min !== undefined && value < opts.min) {
      errors[field] = opts.min === 0 ? `${capitalize(opts.label)} can’t be negative.` : `${capitalize(opts.label)} must be at least ${opts.min}.`;
      return 0;
    }
    if (opts.max !== undefined && value > opts.max) {
      errors[field] = `${capitalize(opts.label)} must be ${opts.max.toLocaleString('en-US')} or less.`;
      return 0;
    }
    return value;
  };

  const price = num('price', values.price, { min: 1, max: 100_000_000, label: 'a purchase price' });
  if (!errors.price && price <= 0) errors.price = 'Enter a purchase price above zero.';
  const downRaw = num('downPayment', values.downPayment, {
    min: 0,
    max: values.downPaymentMode === 'percent' ? 100 : 100_000_000,
    label: 'a down payment',
  });
  const ratePercent = num('ratePercent', values.ratePercent, { min: 0, max: 30, label: 'an interest rate' });
  const termYears = num('termYears', values.termYears, { min: 1, max: 50, label: 'a loan term' });
  const annualTaxes = num('annualTaxes', values.annualTaxes, { min: 0, max: 10_000_000, label: 'annual property taxes' });
  const annualInsurance = num('annualInsurance', values.annualInsurance, { min: 0, max: 10_000_000, label: 'annual insurance' });
  const hoaMonthly = num('hoaMonthly', values.hoaMonthly, { min: 0, max: 1_000_000, label: 'monthly HOA fees' });
  const pmiMonthly = values.includePmi ? num('pmiMonthly', values.pmiMonthly, { min: 0, max: 1_000_000, label: 'monthly mortgage insurance' }) : 0;

  const downPaymentAmount = values.downPaymentMode === 'percent' ? (price * downRaw) / 100 : downRaw;
  if (!errors.downPayment && !errors.price && downPaymentAmount > price) {
    errors.downPayment = 'Down payment can’t be more than the purchase price.';
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    input: { price, downPayment: downPaymentAmount, ratePercent, termYears, annualTaxes, annualInsurance, hoaMonthly, pmiMonthly },
    downPaymentAmount,
    downPaymentPercent: price > 0 ? (downPaymentAmount / price) * 100 : 0,
  };
}

function capitalize(text: string) {
  const t = text.replace(/^(a|an) /, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
}
