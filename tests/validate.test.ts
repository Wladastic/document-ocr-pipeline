import { describe, it, expect } from 'vitest';
import { UploadSchema, validateByType } from '../src/services/validate';

describe('validation', () => {
  it('accepts a valid upload payload', () => {
    const valid = { filename: 'a.png', dtype: 'invoice', contentBase64: 'aGVsbG8=' };
    const parsed = UploadSchema.parse(valid);
    expect(parsed).toMatchObject({ filename: 'a.png', dtype: 'invoice' });
  });

  it('rejects missing fields', () => {
    expect(() => UploadSchema.parse({})).toThrow();
  });

  it('validateByType accepts valid invoice metadata', () => {
    const data = {
      sourceLanguage: 'en',
      ocrConfidence: 0.9,
      processedAt: new Date().toISOString(),
      invoiceNumber: 'INV-1',
      customerName: 'ACME',
      total: 10,
      currency: 'EUR',
      invoiceDate: new Date().toISOString().slice(0,10),
    };
    const parsed = validateByType('invoice', data);
    expect(parsed).toHaveProperty('invoiceNumber');
  });
});
