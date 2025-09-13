
import { describe, it, expect } from 'vitest';
import { simulateOCR } from '../src/services/ocr';

describe('simulateOCR', () => {
  it('returns a valid OCR result', async () => {
    const res = await simulateOCR(Buffer.from('dummy'));
    expect(res).toHaveProperty('text');
    expect(res).toHaveProperty('confidence');
    expect(typeof res.confidence).toBe('number');
    expect(res.language).toBe('en');
  });
});
