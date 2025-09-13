import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ioredis to avoid real Redis connections in tests
vi.mock('ioredis', () => {
  function IORedisStub() {
    return {
      lpush: vi.fn(),
      brpoplpush: vi.fn(),
      lrem: vi.fn(),
    };
  }
  return { default: IORedisStub };
});

vi.mock('../src/persistence/index', () => ({ persistence: {
  updateDocument: vi.fn(),
  getDocument: vi.fn(),
}}));

vi.mock('../src/services/ocr', () => ({ simulateOCR: vi.fn() }));
vi.mock('../src/services/extract', () => ({ extractMetadata: vi.fn() }));
vi.mock('../src/services/validate', () => ({ validateByType: vi.fn() }));

import { processJob } from '../src/queue/queue';
import { persistence } from '../src/persistence/index';
import { simulateOCR } from '../src/services/ocr';
import { extractMetadata } from '../src/services/extract';
import { validateByType } from '../src/services/validate';

describe('processJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (persistence.getDocument as any).mockResolvedValue({ id: 'doc1', filename: 'file.png' });
    (simulateOCR as any).mockResolvedValue({ text: 'ok', confidence: 0.9, language: 'en' });
    (extractMetadata as any).mockReturnValue({});
    (validateByType as any).mockReturnValue({ valid: true });
  });

  it('updates document status through the pipeline', async () => {
    await processJob({ documentId: 'doc1', dtype: 'invoice' });

    expect(persistence.updateDocument).toHaveBeenCalled();
    expect(persistence.getDocument).toHaveBeenCalledWith('doc1');
    expect(simulateOCR).toHaveBeenCalled();
    expect(extractMetadata).toHaveBeenCalledWith('invoice', { text: 'ok', confidence: 0.9, language: 'en' });
    expect(validateByType).toHaveBeenCalledWith('invoice', {});
  });
});
