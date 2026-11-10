import { describe, it, expect, beforeEach } from 'vitest';
import { VOICE_TOPICS, validateTopic, allVoiceMessages, latestVoice, recentVoices, messagesByActivity } from '../../src/data/voices.js';
import { setLang } from '../../src/i18n/index.js';

const text = (fr) => ({ fr, en: `${fr} (en)`, de: `${fr} (de)`, it: `${fr} (it)` });

// The page was replaced by « Découvrir Morges » (2026-11-10); the published messages stay archived here.
describe('Parole aux Morgiens (archive)', () => {
  beforeEach(() => setLang('fr', { persist: false }));

  it('published topics and messages are complete, in four languages, with unique ids', () => {
    for (const topic of VOICE_TOPICS) expect(validateTopic(topic), topic.id).toEqual([]);
    expect(new Set(VOICE_TOPICS.map((x) => x.id)).size).toBe(VOICE_TOPICS.length);
    const ids = allVoiceMessages().map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(VOICE_TOPICS.filter((x) => x.free)).toHaveLength(1);
  });

  it('the home page shows the newest message or reply, with its topic', () => {
    const m = (id, date, replies) => ({ id, name: 'Anne', date, text: text(id), replies });
    const topics = [
      { id: 'a', messages: [m('old', '2026-11-01', [m('reply', '2026-11-05')])] },
      { id: 'b', messages: [m('new', '2026-11-03'), m('same-day-later', '2026-11-05')] },
    ];
    expect(latestVoice(topics).message.id).toBe('same-day-later');
    expect(latestVoice(topics).topic.id).toBe('b');
    expect(latestVoice([{ id: 'c', messages: [] }])).toBeNull();
    expect(recentVoices(3, topics).map((x) => x.message.id)).toEqual(['same-day-later', 'reply', 'new']);
    // a new reply brings its message to the top of its question
    expect(messagesByActivity({ messages: [m('a', '2026-11-01'), m('b', '2026-11-03'), m('c', '2026-10-30', [m('c-r', '2026-11-04')])] }).map((x) => x.id)).toEqual(['c', 'b', 'a']);
  });

  it('rejects untranslated messages, full names and replies to replies', () => {
    const topic = (messages) => ({ id: 'essai', opened: '2026-10-31', question: text('Question ?'), messages });
    expect(validateTopic(topic([{ id: 'a', name: 'Claire M.', date: '2026-10-31', text: text('Bonjour Morges') }]))).toEqual([]);
    expect(validateTopic(topic([{ id: 'a', name: 'Claire M.', date: '2026-10-31', text: { fr: 'Bonjour' } }])).join()).toContain('.text.en');
    expect(validateTopic(topic([{ id: 'a', name: 'Claire Martin Dupont', date: '2026-10-31', text: text('Bonjour') }])).join()).toContain('.name');
    const nested = { id: 'r', name: 'Paul', date: '2026-10-31', text: text('Oui'), replies: [{ id: 'rr', name: 'Anne', date: '2026-10-31', text: text('Non') }] };
    expect(validateTopic(topic([{ id: 'a', name: 'Claire M.', date: '2026-10-31', text: text('Bonjour'), replies: [nested] }])).join()).toContain('one level only');
  });
});
