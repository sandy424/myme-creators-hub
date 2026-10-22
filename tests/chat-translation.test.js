import test from 'node:test';
import assert from 'node:assert/strict';
import { createChatTranslator, splitTranslationText } from '../src/chatTranslation.js';
import { getChatLanguage } from '../src/languages.js';

class MemoryStorage {
  map = new Map();
  getItem(key) {
    return this.map.get(key) ?? null;
  }
  setItem(key, value) {
    this.map.set(key, value);
  }
}
const success = (text) =>
  new Response(JSON.stringify({ responseStatus: 200, responseData: { translatedText: text } }));

test('chat language uses the private profile setting and falls back to the primary activity language', () => {
  assert.equal(getChatLanguage({ chatLanguage: 'ja', languages: '한국어' }), 'ja');
  assert.equal(getChatLanguage({ languages: 'English, 한국어' }), 'en');
  assert.equal(getChatLanguage({ languages: '일본어 / 영어' }), 'ja');
  assert.equal(getChatLanguage({ languages: 'zh-TW' }), 'zh-TW');
  assert.equal(getChatLanguage({ chatLanguage: 'invalid' }), 'ko');
});

test('translation segments respect UTF-8 byte limits without losing whitespace or emoji', () => {
  const text = '안녕하세요 🌍 community. '.repeat(50) + '\n\n끝입니다.';
  const segments = splitTranslationText(text);
  assert.equal(segments.join(''), text);
  for (const segment of segments) assert(Buffer.byteLength(segment, 'utf8') <= 450);
});

test('automatic detection, request deduplication and reload caches are scoped to each account and language', async () => {
  const storage = new MemoryStorage();
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url: new URL(url), options });
    return success('안녕하세요');
  };
  const translate = createChatTranslator({ fetchImpl, storage });
  const request = { accountId: 'A', targetLanguage: 'ko', text: 'Hello' };
  assert.deepEqual(await Promise.all([translate(request), translate(request)]), [
    '안녕하세요',
    '안녕하세요',
  ]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.searchParams.get('langpair'), 'autodetect|ko');
  assert.equal(calls[0].options.credentials, 'omit');
  assert.equal(await translate(request), '안녕하세요');
  const reloaded = createChatTranslator({ fetchImpl, storage });
  assert.equal(await reloaded(request), '안녕하세요');
  assert.equal(calls.length, 1);
  await translate({ ...request, accountId: 'B' });
  await translate({ ...request, targetLanguage: 'ja' });
  assert.equal(calls.length, 3);
});

test('already-matching languages keep the original, while failed requests remain retryable', async () => {
  const same = createChatTranslator({
    storage: new MemoryStorage(),
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          responseStatus: '403',
          responseDetails: 'PLEASE SELECT TWO DISTINCT LANGUAGES',
        }),
      ),
  });
  assert.equal(
    await same({ accountId: 'A', targetLanguage: 'ko', text: '안녕하세요' }),
    '안녕하세요',
  );
  let attempt = 0;
  const retry = createChatTranslator({
    storage: new MemoryStorage(),
    fetchImpl: async () =>
      ++attempt === 1
        ? new Response(JSON.stringify({ responseStatus: 429, quotaFinished: true }), {
            status: 429,
          })
        : success('안녕하세요'),
  });
  const request = { accountId: 'A', targetLanguage: 'ko', text: 'Hello' };
  await assert.rejects(() => retry(request), /이용량/);
  assert.equal(await retry(request), '안녕하세요');
  assert.equal(attempt, 2);
});

test('long received messages translate in byte-safe segments and keep paragraph breaks', async () => {
  const translate = createChatTranslator({
    storage: new MemoryStorage(),
    fetchImpl: async (url) => {
      const text = new URL(url).searchParams.get('q');
      assert(Buffer.byteLength(text, 'utf8') <= 450);
      return success(text);
    },
  });
  const text = '한국어와 English 🌍 '.repeat(60) + '\n\nGoodbye.\n';
  assert.equal(await translate({ accountId: 'A', targetLanguage: 'en', text }), text);
});

test('only two translation jobs run concurrently and emoji-only messages bypass the provider', async () => {
  let active = 0,
    peak = 0,
    calls = 0;
  const translate = createChatTranslator({
    storage: new MemoryStorage(),
    fetchImpl: async () => {
      calls++;
      active++;
      peak = Math.max(active, peak);
      await new Promise(setImmediate);
      active--;
      return success('번역');
    },
  });
  await Promise.all(
    Array.from({ length: 6 }, (_, index) =>
      translate({ accountId: 'A', targetLanguage: 'ko', text: 'Hello ' + index }),
    ),
  );
  assert.equal(peak, 2);
  assert.equal(await translate({ accountId: 'A', targetLanguage: 'ko', text: '👍 123' }), '👍 123');
  assert.equal(calls, 6);
});
