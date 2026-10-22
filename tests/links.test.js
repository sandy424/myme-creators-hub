import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHttpsLink } from '../src/links.js';

test('related links are optional and accept normalized HTTPS URLs only', () => {
  assert.equal(normalizeHttpsLink(), '');
  assert.equal(normalizeHttpsLink('  '), '');
  assert.equal(
    normalizeHttpsLink('  HTTPS://Example.test/shared-file.pdf?download=1#page=2  '),
    'https://example.test/shared-file.pdf?download=1#page=2',
  );
  for (const value of [
    'http://example.test',
    'javascript:alert(1)',
    'data:text/plain,file',
    'https://',
    '/file.pdf',
  ]) {
    assert.throws(() => normalizeHttpsLink(value), /https:\/\//);
  }
  assert.throws(() => normalizeHttpsLink('https://example.test/' + 'a'.repeat(2000)), /2,000/);
});
