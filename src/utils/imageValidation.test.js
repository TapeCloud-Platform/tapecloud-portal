import { describe, expect, it } from 'vitest';
import { validateImageFile } from './imageValidation.js';

describe('imageValidation', () => {
  it('rechaza tipo no permitido', () => {
    const err = validateImageFile({ type: 'image/bmp', size: 1000 });
    expect(err).toMatch(/Tipo/);
  });

  it('rechaza peso excesivo', () => {
    const err = validateImageFile(
      { type: 'image/png', size: 6 * 1024 * 1024 },
      { allowedTypes: ['image/png'], maxBytes: 5 * 1024 * 1024, minDimension: 32, maxDimension: 4096 }
    );
    expect(err).toMatch(/pesar/);
  });

  it('acepta archivo válido', () => {
    expect(validateImageFile({ type: 'image/png', size: 1000 })).toBeNull();
  });

  it('pide archivo', () => {
    expect(validateImageFile(null)).toMatch(/archivo/);
  });
});
