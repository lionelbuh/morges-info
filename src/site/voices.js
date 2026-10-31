/**
 * "Parole aux Morgiens": the questions, the published messages and the form.
 * Rendering is shared by the prerender and the browser; the form handling at
 * the bottom runs in the browser only (event delegation, so re-rendering on a
 * language change keeps it working).
 */
import { t, getLang, localized } from '../i18n/index.js';
import { escapeHtml as e } from '../ui/dom.js';
import { VOICE_TOPICS, VOICE_LIMITS } from '../data/voices.js';
import { SITE_URL, CONTACT_EMAIL, VOICES_FORM_KEY, VOICES_FORM_ENDPOINT, getPage } from './config.js';
import { formatDate } from './format.js';

/** Subject of the email the editor receives (always in French: the editor reads French). */
const MAIL_SUBJECT = 'Parole aux Morgiens : nouveau message';

const topicAnchor = (topic) => `sujet-${topic.id}`;

function message(m, topic, { reply = false } = {}) {
  const lang = getLang();
  const replies = (m.replies || []).map((r) => message(r, topic, { reply: true })).join('');
  const translated = lang !== 'fr' ? `<span class="voice-translated">${e(t('voices.translated'))}</span>` : '';
  const badge = m.editor ? ` <span class="voice-editor">${e(t('voices.editorBadge'))}</span>` : '';
  const replyButton = reply
    ? ''
    : `<button type="button" class="voice-reply-btn" data-voice-reply="${e(m.id)}" data-voice-topic="${e(topic.id)}" data-voice-name="${e(m.name)}">${e(t('voices.reply'))}</button>`;
  return `<article class="voice-msg${reply ? ' voice-msg--reply' : ''}" id="m-${e(m.id)}">
    <p class="voice-text">${e(localized(m.text))}</p>
    <p class="voice-by"><span class="voice-name">${e(m.name)}</span>${badge} · <time datetime="${m.date}">${e(formatDate(m.date, lang))}</time>${translated ? ` · ${translated}` : ''}</p>
    ${replyButton}
    ${replies ? `<div class="voice-replies">${replies}</div>` : ''}
  </article>`;
}

function topicSection(topic) {
  const count = topic.messages.length;
  const countLabel = count ? t(count === 1 ? 'voices.countOne' : 'voices.countOther', { n: count }) : '';
  const list = count
    ? `<div class="voice-list">${topic.messages.map((m) => message(m, topic)).join('')}</div>`
    : `<p class="empty-note">${e(t('voices.empty'))}</p>`;
  return `<section class="voice-topic${topic.free ? ' voice-topic--free' : ''}" id="${topicAnchor(topic)}" aria-labelledby="${topicAnchor(topic)}-q">
    <h2 id="${topicAnchor(topic)}-q">${e(localized(topic.question))}</h2>
    ${countLabel ? `<p class="voice-count">${e(countLabel)}</p>` : ''}
    ${list}
    <p><a class="btn btn-ghost voice-answer" href="#ecrire" data-voice-topic="${e(topic.id)}">${e(t(topic.free ? 'voices.writeFree' : 'voices.answer'))}</a></p>
  </section>`;
}

function form() {
  const open = Boolean(VOICES_FORM_KEY);
  const options = VOICE_TOPICS.map((topic) => `<option value="${e(topic.id)}">${e(localized(topic.question))}</option>`).join('');
  return `<form class="voice-form" id="voice-form" action="${VOICES_FORM_ENDPOINT}" method="POST" data-voice-form>
    <input type="hidden" name="access_key" value="${e(VOICES_FORM_KEY)}" />
    <input type="hidden" name="subject" value="${e(MAIL_SUBJECT)}" />
    <input type="hidden" name="from_name" value="Morges.info" />
    <input type="hidden" name="redirect" value="${SITE_URL}${getPage('voices').path}#merci" />
    <input type="hidden" name="reponse_a" value="" data-voice-reply-field />
    <input type="checkbox" name="botcheck" class="voice-trap" tabindex="-1" autocomplete="off" aria-hidden="true" />
    <fieldset${open ? '' : ' disabled'}>
      <legend class="visually-hidden">${e(t('voices.formTitle'))}</legend>
      <p class="field">
        <label for="voice-topic">${e(t('voices.topicLabel'))}</label>
        <select id="voice-topic" name="sujet">${options}</select>
      </p>
      <p class="voice-replying" data-voice-replying hidden>
        <span data-voice-replying-text></span>
        <button type="button" class="voice-cancel" data-voice-cancel>${e(t('voices.cancelReply'))}</button>
      </p>
      <p class="field">
        <label for="voice-name">${e(t('voices.nameLabel'))}</label>
        <input id="voice-name" name="prenom" type="text" required maxlength="${VOICE_LIMITS.name}" autocomplete="off" placeholder="${e(t('voices.namePlaceholder'))}" />
      </p>
      <p class="field">
        <label for="voice-message">${e(t('voices.messageLabel'))}</label>
        <textarea id="voice-message" name="message" required minlength="10" maxlength="${VOICE_LIMITS.text}" rows="6" lang="fr" aria-describedby="voice-hint"></textarea>
        <span class="field-hint" id="voice-hint">${e(t('voices.messageHint', { max: VOICE_LIMITS.text }))} <span class="voice-counter" data-voice-counter aria-live="polite"></span></span>
      </p>
      <p class="field field-check">
        <input id="voice-consent" name="accord" type="checkbox" value="oui" required />
        <label for="voice-consent">${e(t('voices.consent'))}</label>
      </p>
      <p><button type="submit" class="btn" data-voice-submit>${e(t('voices.send'))}</button></p>
    </fieldset>
    ${open ? '' : `<p class="notice">${e(t('voices.closed'))}</p>`}
    <p class="voice-status" role="status" data-voice-status></p>
  </form>
  <p class="voice-thanks" id="merci" tabindex="-1">${e(t('voices.sent'))}</p>`;
}

function charter() {
  const items = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'].map((k) => `<li>${e(t(`voices.charter.${k}`))}</li>`).join('');
  return `<section class="voice-charter" aria-labelledby="voice-charter-title">
    <h2 id="voice-charter-title">${e(t('voices.charterTitle'))}</h2>
    <ol>${items}</ol>
  </section>`;
}

export function renderVoices() {
  return `<header class="page-intro">
    <h1>${e(t('voices.title'))}</h1>
    <p class="lead">${e(t('voices.intro'))}</p>
  </header>
  <div class="voices-layout">
    <div class="voices-topics">${VOICE_TOPICS.map(topicSection).join('')}</div>
    <aside class="voices-side">
      <section class="voice-write" id="ecrire" aria-labelledby="ecrire-title">
        <h2 id="ecrire-title">${e(t('voices.formTitle'))}</h2>
        <p>${e(t('voices.formIntro'))}</p>
        ${form()}
      </section>
      ${charter()}
    </aside>
  </div>`;
}

/* ---------- Browser: form handling ---------- */

const formEl = () => document.querySelector('[data-voice-form]');

function setReply(form, target) {
  const field = form.querySelector('[data-voice-reply-field]');
  const box = form.querySelector('[data-voice-replying]');
  field.value = target ? `${target.name} [${target.id}]` : '';
  box.hidden = !target;
  const text = box.querySelector('[data-voice-replying-text]');
  text.textContent = target ? t('voices.replyingTo', { name: target.name }) : '';
  text.dataset.name = target ? target.name : '';
}

function updateCounter(form) {
  const text = form.querySelector('textarea[name="message"]');
  form.querySelector('[data-voice-counter]').textContent = t('voices.counter', { n: text.value.length, max: VOICE_LIMITS.text });
}

/** Go to the form with the topic (and the message answered) chosen. */
function startWriting(topicId, target) {
  const form = formEl();
  if (!form) return;
  form.querySelector('select[name="sujet"]').value = topicId;
  setReply(form, target);
  document.getElementById('ecrire').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  form.querySelector('input[name="prenom"]').focus({ preventScroll: true });
}

function fieldError(form) {
  const name = form.querySelector('input[name="prenom"]');
  const text = form.querySelector('textarea[name="message"]');
  const consent = form.querySelector('input[name="accord"]');
  if (name.value.trim().length < 2) return [name, 'voices.errorName'];
  if (text.value.trim().length < 10) return [text, 'voices.errorMessage'];
  if (!consent.checked) return [consent, 'voices.errorConsent'];
  return null;
}

async function submit(form) {
  const status = form.querySelector('[data-voice-status]');
  const button = form.querySelector('[data-voice-submit]');
  const error = fieldError(form);
  if (error) {
    status.textContent = t(error[1]);
    status.className = 'voice-status is-error';
    error[0].focus();
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  delete data.redirect; // only for the form sent without JavaScript
  data.prenom = data.prenom.trim();
  data.message = data.message.trim();
  if (data.reponse_a === '') delete data.reponse_a;
  const topic = VOICE_TOPICS.find((x) => x.id === data.sujet);
  data.sujet = topic ? `${topic.question.fr} [${topic.id}]` : data.sujet;
  button.disabled = true;
  status.className = 'voice-status';
  status.textContent = t('voices.sending');
  let ok = false;
  try {
    const response = await fetch(VOICES_FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    ok = response.ok && (await response.json()).success === true;
  } catch {
    // network error: ok stays false
  }
  button.disabled = false;
  if (!ok) {
    status.className = 'voice-status is-error';
    status.textContent = t('voices.failed', { email: CONTACT_EMAIL });
    return;
  }
  form.reset();
  setReply(form, null);
  updateCounter(form);
  status.className = 'voice-status is-sent';
  status.textContent = t('voices.sent');
}

/** What the visitor has typed, so a language change does not lose it. */
export function saveVoiceDraft() {
  const form = formEl();
  if (!form) return null;
  return {
    sujet: form.querySelector('select[name="sujet"]').value,
    prenom: form.querySelector('input[name="prenom"]').value,
    message: form.querySelector('textarea[name="message"]').value,
    accord: form.querySelector('input[name="accord"]').checked,
    reply: form.querySelector('[data-voice-reply-field]').value,
    replyName: form.querySelector('[data-voice-replying-text]').dataset.name || '',
  };
}

export function restoreVoiceDraft(draft) {
  const form = formEl();
  if (!form) return;
  if (draft) {
    form.querySelector('select[name="sujet"]').value = draft.sujet;
    form.querySelector('input[name="prenom"]').value = draft.prenom;
    form.querySelector('textarea[name="message"]').value = draft.message;
    form.querySelector('input[name="accord"]').checked = draft.accord;
    if (draft.reply) {
      setReply(form, { name: draft.replyName, id: draft.reply.replace(/^.*\[(.+)\]$/, '$1') });
    }
  }
  updateCounter(form);
}

export function initVoices() {
  document.addEventListener('click', (event) => {
    const replyBtn = event.target.closest('[data-voice-reply]');
    if (replyBtn) {
      startWriting(replyBtn.dataset.voiceTopic, { id: replyBtn.dataset.voiceReply, name: replyBtn.dataset.voiceName });
      return;
    }
    const answer = event.target.closest('a[data-voice-topic]');
    if (answer) {
      event.preventDefault();
      startWriting(answer.dataset.voiceTopic, null);
      return;
    }
    if (event.target.closest('[data-voice-cancel]')) setReply(formEl(), null);
  });
  document.addEventListener('input', (event) => {
    const form = event.target.closest('[data-voice-form]');
    if (form && event.target.name === 'message') updateCounter(form);
  });
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-voice-form]');
    if (!form) return;
    event.preventDefault();
    const trap = form.querySelector('input[name="botcheck"]');
    if (trap.checked) return; // a robot filled the hidden box: send nothing
    submit(form);
  });
}
