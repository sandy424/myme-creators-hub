import test from 'node:test';
import assert from 'node:assert/strict';
import { saveCareerEntry } from '../src/career.js';

test('editing a career preserves its ID, metadata, list order and other entries', () => {
  const first = {
    id: 11,
    title: 'First',
    role: 'Developer',
    contribution: 'Old contribution',
    link: '',
    source: 'self',
  };
  const second = { id: 22, title: 'Second', role: 'Artist' };
  const original = [first, second];
  const updated = saveCareerEntry(
    original,
    {
      title: ' Updated ',
      role: ' Lead ',
      contribution: ' New contribution ',
      link: ' https://example.test/game ',
    },
    11,
  );
  assert.equal(updated.length, 2);
  assert.deepEqual(updated[0], {
    id: 11,
    title: 'Updated',
    role: 'Lead',
    contribution: 'New contribution',
    link: 'https://example.test/game',
    source: 'self',
  });
  assert.equal(updated[1], second);
  assert.equal(original[0], first);
  assert.equal(first.title, 'First');
});

test('new careers get unique IDs, while invalid or missing edits cannot replace records', () => {
  const existing = [{ id: 1, title: 'Existing', role: 'Developer' }];
  const created = saveCareerEntry(existing, { title: 'New', role: 'Artist' });
  assert.equal(created.length, 2);
  assert.equal(created[1], existing[0]);
  assert.notEqual(created[0].id, 1);
  assert.equal(
    new Set(saveCareerEntry(created, { title: 'Another', role: 'Artist' }).map((item) => item.id))
      .size,
    3,
  );
  assert.throws(
    () => saveCareerEntry(existing, { title: ' ', role: 'Developer' }),
    /제목과 담당 역할/,
  );
  assert.throws(
    () =>
      saveCareerEntry(existing, { title: 'Title', role: 'Developer', link: 'http://example.test' }),
    /https/,
  );
  assert.throws(
    () => saveCareerEntry(existing, { title: 'Title', role: 'Developer' }, 999),
    /찾을 수 없습니다/,
  );
  assert.deepEqual(existing, [{ id: 1, title: 'Existing', role: 'Developer' }]);
});
