import { languages } from './languages.js';

const ENDPOINT = 'https://api.mymemory.translated.net/get';
const CACHE_LIMIT = 150;
const encoder = new TextEncoder();

// MyMemory accepts at most 500 UTF-8 bytes per segment, rather than 500 characters.
export function splitTranslationText(text, maxBytes = 450) {
  if (maxBytes < 4) throw new Error('Translation segments must allow a UTF-8 character.');
  const parts = [];
  let buffer = '';
  let size = 0;
  for (const character of text) {
    const bytes = encoder.encode(character).length;
    if (size + bytes > maxBytes) {
      const boundary = Math.max(
        buffer.lastIndexOf(' '),
        buffer.lastIndexOf('。'),
        buffer.lastIndexOf('.'),
        buffer.lastIndexOf('!'),
        buffer.lastIndexOf('?'),
      );
      const end = boundary >= buffer.length / 2 ? boundary + 1 : buffer.length;
      parts.push(buffer.slice(0, end));
      buffer = buffer.slice(end);
      size = encoder.encode(buffer).length;
    }
    buffer += character;
    size += bytes;
    if (character === '\n') {
      parts.push(buffer);
      buffer = '';
      size = 0;
    }
  }
  if (buffer) parts.push(buffer);
  return parts;
}

export function createChatTranslator({
  fetchImpl = (...args) => fetch(...args),
  storage,
  concurrency = 2,
} = {}) {
  const caches = new Map();
  const inFlight = new Map();
  const queue = [];
  let active = 0;
  function drain() {
    while (active < concurrency && queue.length) {
      const { task, resolve, reject } = queue.shift();
      active++;
      Promise.resolve()
        .then(task)
        .then(resolve, reject)
        .finally(() => {
          active--;
          drain();
        });
    }
  }
  function enqueue(task) {
    return new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject });
      drain();
    });
  }
  const storageKey = (accountId) => `myme-chat-translations-v1:${accountId}`;
  function getStorage() {
    return storage ?? (typeof sessionStorage !== 'undefined' ? sessionStorage : null);
  }
  function cacheFor(accountId) {
    if (!caches.has(accountId)) {
      let entries = [];
      try {
        const saved = JSON.parse(getStorage()?.getItem(storageKey(accountId)) || '[]');
        if (Array.isArray(saved))
          entries = saved
            .filter(
              (entry) =>
                Array.isArray(entry) &&
                entry.length === 2 &&
                entry.every((value) => typeof value === 'string'),
            )
            .slice(-CACHE_LIMIT);
      } catch {
        /* A private-browsing storage restriction should not stop translation. */
      }
      caches.set(accountId, new Map(entries));
    }
    return caches.get(accountId);
  }
  function save(accountId, key, translated) {
    const cache = cacheFor(accountId);
    cache.set(key, translated);
    while (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
    try {
      getStorage()?.setItem(storageKey(accountId), JSON.stringify([...cache]));
    } catch {
      /* Keep the in-memory cache if storage is full. */
    }
  }
  async function translateSegment(segment, targetLanguage) {
    const [, leading, text, trailing] = segment.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!/\p{L}/u.test(text)) return segment;
    const url = new URL(ENDPOINT);
    url.searchParams.set('q', text);
    url.searchParams.set('langpair', `autodetect|${targetLanguage}`);
    const response = await fetchImpl(url.href, {
      signal: AbortSignal.timeout(12000),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    });
    const result = await response.json();
    // The provider reports an already-matching detected language as this specific error.
    if (
      Number(result.responseStatus) === 403 &&
      result.responseDetails === 'PLEASE SELECT TWO DISTINCT LANGUAGES'
    )
      return segment;
    if (response.status === 429 || Number(result.responseStatus) === 429 || result.quotaFinished) {
      throw new Error('번역 이용량을 초과했어요. 잠시 후 다시 시도해 주세요.');
    }
    if (
      !response.ok ||
      Number(result.responseStatus) !== 200 ||
      typeof result.responseData?.translatedText !== 'string' ||
      !result.responseData.translatedText.trim()
    ) {
      throw new Error('번역을 불러오지 못했어요. 원문을 확인하거나 다시 시도해 주세요.');
    }
    return leading + result.responseData.translatedText + trailing;
  }

  return async function translateChatMessage({ text, targetLanguage, accountId }) {
    if (!Object.hasOwn(languages, targetLanguage))
      throw new Error('프로필에서 메시지 수신 언어를 확인해 주세요.');
    if (typeof text !== 'string' || text.length > 2000)
      throw new Error('번역할 메시지를 확인해 주세요.');
    if (!/\p{L}/u.test(text)) return text;
    const account = accountId || 'guest';
    const key = JSON.stringify([targetLanguage, text]);
    const cache = cacheFor(account);
    if (cache.has(key)) return cache.get(key);
    const requestKey = account + ':' + key;
    if (inFlight.has(requestKey)) return inFlight.get(requestKey);
    const request = enqueue(async () => {
      try {
        const translations = [];
        for (const part of splitTranslationText(text))
          translations.push(await translateSegment(part, targetLanguage));
        const translated = translations.join('');
        save(account, key, translated);
        return translated;
      } catch (error) {
        if (error.name === 'TimeoutError' || error.name === 'AbortError')
          throw new Error('번역 응답이 늦어지고 있어요. 다시 시도해 주세요.');
        if (error instanceof TypeError)
          throw new Error(
            '번역 서비스에 연결하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.',
          );
        throw error;
      }
    });
    inFlight.set(requestKey, request);
    try {
      return await request;
    } finally {
      inFlight.delete(requestKey);
    }
  };
}

export const translateChatMessage = createChatTranslator();
