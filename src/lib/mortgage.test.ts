import { describe, expect, it } from 'vitest';
import { estimatePayment, monthlyPrincipalAndInterest, parseMortgageForm, parseNumber, type MortgageFormValues } from './mortgage';

const base: MortgageFormValues = {
  price: '625,000',
  downPayment: '20',
  downPaymentMode: 'percent',
  ratePercent: '6.5',
  termYears: '30',
  annualTaxes: '7,800',
  annualInsurance: '1,800',
  hoaMonthly: '65',
  includePmi: false,
  pmiMonthly: '0',
};

describe('monthlyPrincipalAndInterest', () => {
  it('matches the standard amortization formula', () => {
    // $500,000 at 6.5% for 30 years ≈ $3,160.34
    expect(monthlyPrincipalAndInterest(500_000, 6.5, 30)).toBeCloseTo(3160.34, 2);
    // $200,000 at 4% for 15 years ≈ $1,479.38
    expect(monthlyPrincipalAndInterest(200_000, 4, 15)).toBeCloseTo(1479.38, 2);
  });
  it('handles zero interest as straight division', () => {
    expect(monthlyPrincipalAndInterest(360_000, 0, 30)).toBe(1000);
  });
  it('returns 0 for a zero or negative loan balance', () => {
    expect(monthlyPrincipalAndInterest(0, 6.5, 30)).toBe(0);
    expect(monthlyPrincipalAndInterest(-10, 6.5, 30)).toBe(0);
  });
  it('returns NaN for impossible terms or rates', () => {
    expect(monthlyPrincipalAndInterest(100_000, 6, 0)).toBeNaN();
    expect(monthlyPrincipalAndInterest(100_000, -1, 30)).toBeNaN();
  });
});

describe('estimatePayment', () => {
  it('builds the full monthly breakdown', () => {
    const r = estimatePayment({ price: 625_000, downPayment: 125_000, ratePercent: 6.5, termYears: 30, annualTaxes: 7800, annualInsurance: 1800, hoaMonthly: 65, pmiMonthly: 0 });
    expect(r.loanAmount).toBe(500_000);
    expect(r.principalAndInterest).toBeCloseTo(3160.34, 2);
    expect(r.taxes).toBe(650);
    expect(r.insurance).toBe(150);
    expect(r.total).toBeCloseTo(3160.34 + 650 + 150 + 65, 2);
    expect(r.totalInterest).toBeCloseTo(3160.34 * 360 - 500_000, 0);
  });
  it('drops mortgage insurance and P&I when paying cash', () => {
    const r = estimatePayment({ price: 400_000, downPayment: 400_000, ratePercent: 7, termYears: 30, annualTaxes: 1200, annualInsurance: 1200, hoaMonthly: 0, pmiMonthly: 150 });
    expect(r.loanAmount).toBe(0);
    expect(r.principalAndInterest).toBe(0);
    expect(r.pmi).toBe(0);
    expect(r.total).toBe(200);
  });
});

describe('parseNumber', () => {
  it('accepts formatted input', () => {
    expect(parseNumber('$625,000')).toBe(625000);
    expect(parseNumber(' 6.5% ')).toBe(6.5);
    expect(parseNumber('.5')).toBe(0.5);
  });
  it('rejects non-numbers', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('1e5')).toBeNull();
    expect(parseNumber('1.2.3')).toBeNull();
  });
});

describe('parseMortgageForm', () => {
  it('converts percent down payments', () => {
    const r = parseMortgageForm(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.downPaymentAmount).toBe(125_000);
      expect(r.input.price).toBe(625_000);
    }
  });
  it('flags invalid and out-of-range fields', () => {
    const r = parseMortgageForm({ ...base, price: '', ratePercent: '-1', termYears: '0', hoaMonthly: 'abc' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(['hoaMonthly', 'price', 'ratePercent', 'termYears']);
    }
  });
  it('rejects a down payment above the price', () => {
    const r = parseMortgageForm({ ...base, downPaymentMode: 'amount', downPayment: '700000' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.downPayment).toMatch(/more than the purchase price/);
  });
  it('rejects a percentage above 100', () => {
    const r = parseMortgageForm({ ...base, downPayment: '120' });
    expect(r.ok).toBe(false);
  });
  it('allows a 100% down payment (zero loan) and zero interest', () => {
    const r = parseMortgageForm({ ...base, downPayment: '100', ratePercent: '0' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(estimatePayment(r.input).principalAndInterest).toBe(0);
  });
  it('only validates mortgage insurance when included', () => {
    expect(parseMortgageForm({ ...base, pmiMonthly: 'oops' }).ok).toBe(true);
    expect(parseMortgageForm({ ...base, includePmi: true, pmiMonthly: 'oops' }).ok).toBe(false);
  });
});
