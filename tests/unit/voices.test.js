import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VOICE_TOPICS, validateTopic, allVoiceMessages } from '../../src/data/voices.js';
import { setLang } from '../../src/i18n/index.js';

const text = (fr) => ({ fr, en: `${fr} (en)`, de: `${fr} (de)`, it: `${fr} (it)` });

describe('Parole aux Morgiens', () => {
  beforeEach(() => setLang('fr', { persist: false }));

  it('published topics and messages are complete, in four languages, with unique ids', () => {
    for (const topic of VOICE_TOPICS) expect(validateTopic(topic), topic.id).toEqual([]);
    expect(new Set(VOICE_TOPICS.map((x) => x.id)).size).toBe(VOICE_TOPICS.length);
    const ids = allVoiceMessages().map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(VOICE_TOPICS.filter((x) => x.free)).toHaveLength(1);
  });

  it('rejects untranslated messages, full names and replies to replies', () => {
    const topic = (messages) => ({ id: 'essai', opened: '2026-10-31', question: text('Question ?'), messages });
    expect(validateTopic(topic([{ id: 'a', name: 'Claire M.', date: '2026-10-31', text: text('Bonjour Morges') }]))).toEqual([]);
    expect(validateTopic(topic([{ id: 'a', name: 'Claire M.', date: '2026-10-31', text: { fr: 'Bonjour' } }])).join()).toContain('.text.en');
    expect(validateTopic(topic([{ id: 'a', name: 'Claire Martin Dupont', date: '2026-10-31', text: text('Bonjour') }])).join()).toContain('.name');
    const nested = { id: 'r', name: 'Paul', date: '2026-10-31', text: text('Oui'), replies: [{ id: 'rr', name: 'Anne', date: '2026-10-31', text: text('Non') }] };
    expect(validateTopic(topic([{ id: 'a', name: 'Claire M.', date: '2026-10-31', text: text('Bonjour'), replies: [nested] }])).join()).toContain('one level only');
  });

  it('shows messages with their replies, the reply button and the translation note', async () => {
    vi.resetModules();
    vi.doMock('../../src/data/voices.js', async (importOriginal) => {
      const original = await importOriginal();
      const topics = original.VOICE_TOPICS.map((x) => ({ ...x, messages: [] }));
      topics[0].messages = [
        {
          id: 'lac',
          name: 'Claire M.',
          date: '2026-11-02',
          text: text('Le quai Lochmann <au> matin.'),
          replies: [{ id: 'lac-r1', name: 'Lionel B.', date: '2026-11-03', editor: true, text: text('Merci Claire !') }],
        },
      ];
      return { ...original, VOICE_TOPICS: topics };
    });
    const { renderVoices } = await import('../../src/site/voices.js');
    const i18n = await import('../../src/i18n/index.js');
    i18n.setLang('fr', { persist: false });
    let html = renderVoices();
    expect(html).toContain('Le quai Lochmann &lt;au&gt; matin.');
    expect(html).toContain('data-voice-reply="lac"');
    expect(html).not.toContain('data-voice-reply="lac-r1"'); // replies get no reply button
    expect(html).toContain('class="voice-editor"');
    expect(html).toContain('1 message');
    expect(html).not.toContain('Traduit du français');
    i18n.setLang('de', { persist: false });
    html = renderVoices();
    expect(html).toContain('Le quai Lochmann &lt;au&gt; matin. (de)');
    expect(html).toContain('Aus dem Französischen übersetzt');
    vi.doUnmock('../../src/data/voices.js');
  });
});
