import { describe, it, expect } from 'vitest';
import { PUBLIC_UPLOADS_ENABLED, validateArchivePhoto, publishablePhotos } from '../../src/data/archive.js';

const base = () => ({
  id: 'chateau-test-001',
  placeId: 'chateau',
  title: { fr: 'Titre', en: 'Title', de: 'Titel', it: 'Titolo' },
  date: { value: '1905', precision: 'year' },
  source: { institution: 'Archives communales de Morges', reference: 'TEST-REF' },
  rights: { status: 'unknown', credit: 'À déterminer' },
  verification: { status: 'pending' },
  image: null,
});

describe('historical archive model', () => {
  it('keeps public uploads disabled', () => {
    expect(PUBLIC_UPLOADS_ENABLED).toBe(false);
  });

  it('accepts a complete pending record without an image', () => {
    expect(validateArchivePhoto(base())).toEqual([]);
  });

  it('rejects missing translations, bad dates and unknown statuses', () => {
    const p = base();
    p.title.it = '';
    p.date.value = '05/1905';
    p.verification.status = 'ok';
    const errors = validateArchivePhoto(p);
    expect(errors.length).toBe(3);
  });

  it('forbids an image before rights are cleared and verified', () => {
    const p = { ...base(), image: { src: '/images/photos/x.webp', width: 1600, height: 1067 } };
    expect(validateArchivePhoto(p).join()).toMatch(/image may only be set/);
    expect(publishablePhotos([p])).toHaveLength(0);

    const ok = {
      ...p,
      rights: { status: 'public-domain', credit: 'Archives' },
      verification: { status: 'verified', verifiedBy: 'editor' },
    };
    expect(validateArchivePhoto(ok)).toEqual([]);
    expect(publishablePhotos([ok])).toHaveLength(1);
  });

  it('requires a local image with its size', () => {
    const cleared = { ...base(), rights: { status: 'granted', credit: 'X' }, verification: { status: 'verified' } };
    expect(validateArchivePhoto({ ...cleared, image: { src: 'https://example.com/a.jpg', width: 10, height: 10 } }).join()).toMatch(/local/);
    expect(validateArchivePhoto({ ...cleared, image: { src: '/images/photos/a.webp' } }).join()).toMatch(/width/);
  });

  it('requires a licence name for open licences', () => {
    const p = base();
    p.rights = { status: 'open-licence', credit: 'X' };
    expect(validateArchivePhoto(p).join()).toMatch(/licence/);
  });
});
