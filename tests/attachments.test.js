import test from 'node:test';
import assert from 'node:assert/strict';
import { readAttachments, validateAttachments, MAX_ATTACHMENT_BYTES } from '../src/attachments.js';

test('attachments preserve file names and binary contents for downloading', async () => {
  const content = new Uint8Array([0, 1, 127, 128, 255]);
  const files = await readAttachments([new File([content], '자료.zip'), new File([], 'empty.txt')]);
  assert.equal(files[0].name, '자료.zip');
  assert.equal(files[0].size, content.length);
  assert.deepEqual(Buffer.from(files[0].dataUrl.split(',')[1], 'base64'), Buffer.from(content));
  assert.deepEqual(validateAttachments(files), files);
  assert.equal(files[1].size, 0);
  assert.deepEqual(validateAttachments(), []);
});

test('attachment count, byte limit and download payloads are validated', async () => {
  const [file] = await readAttachments([new File(['hello'], 'readme.txt')]);
  assert.throws(() => validateAttachments(Array(6).fill(file)), /최대 5개/);
  assert.throws(() => validateAttachments([{ ...file, size: 4 }]), /다시 선택/);
  assert.throws(
    () => validateAttachments([{ ...file, dataUrl: 'javascript:alert(1)' }]),
    /다시 선택/,
  );
  assert.throws(
    () => validateAttachments([{ ...file, dataUrl: 'data:application/octet-stream;base64,???=' }]),
    /다시 선택/,
  );
  await assert.rejects(
    () => readAttachments([new File([new Uint8Array(MAX_ATTACHMENT_BYTES + 1)], 'large.zip')]),
    /2MB/,
  );
  const maximum = await readAttachments([
    new File([new Uint8Array(MAX_ATTACHMENT_BYTES)], 'maximum.zip'),
  ]);
  assert.equal(validateAttachments(maximum)[0].size, MAX_ATTACHMENT_BYTES);
  assert.throws(() => validateAttachments([...maximum, file]), /2MB/);
});
