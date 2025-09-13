import { describe, it, expect } from 'vitest';
import { extractMetadata } from '../src/services/extract';

const fakeOCR = { text: 'ok', confidence: 0.95, language: 'en' };

describe('extractMetadata', () => {
  it('returns invoice fields', () => {
    const out = extractMetadata('invoice', fakeOCR as any);
    expect(out).toHaveProperty('invoiceNumber');
    expect(out).toHaveProperty('customerName');
    expect(out).toHaveProperty('total');
  });

  it('returns receipt fields', () => {
    const out = extractMetadata('receipt', fakeOCR as any);
    expect(out).toHaveProperty('merchant');
    expect(out).toHaveProperty('items');
    expect(out).toHaveProperty('total');
  });

  it('returns contract fields', () => {
    const out = extractMetadata('contract', fakeOCR as any);
    expect(out).toHaveProperty('parties');
    expect(out).toHaveProperty('effectiveDate');
  });
});
