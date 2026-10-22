import test from 'node:test';
import assert from 'node:assert/strict';
import { mockApi, resetMockData, STORAGE_KEY } from '../src/mock/api.js';
class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(k) {
    return this.map.get(k) || null;
  }
  setItem(k, v) {
    this.map.set(k, String(v));
  }
  removeItem(k) {
    this.map.delete(k);
  }
}
globalThis.localStorage = new MemoryStorage();
const signup = (name, email, extra = {}) =>
  mockApi('signup', {
    name,
    email,
    password: 'test-password',
    termsConfirmed: true,
    adultConfirmed: true,
    privacyConfirmed: true,
    discovery: false,
    sharedDiscovery: true,
    role: '개발',
    ...extra,
  });
test('empty initial data, signup and login, shared UI fixtures, nested replies, privacy and reset', async () => {
  resetMockData();
  assert.deepEqual(await mockApi('me'), { id: null });
  assert.equal(localStorage.getItem(STORAGE_KEY), null);
  const a = await signup('A', 'a@example.test');
  assert.equal(a.state.members.length, 0);
  assert.equal(a.state.posts.length, 0);
  assert.equal((await mockApi('community')).members.length, 0);
  const post = await mockApi('publish-post', {
    title: '공유 글',
    body: '본문',
    category: '자유게시판',
    relatedUrl: '  https://example.test/shared-file.pdf  ',
    attachments: [
      { name: 'readme.txt', size: 5, dataUrl: 'data:application/octet-stream;base64,aGVsbG8=' },
    ],
  });
  assert.equal(
    (await mockApi('community')).posts[0].relatedUrl,
    'https://example.test/shared-file.pdf',
  );
  for (const relatedUrl of ['http://example.test/file', 'javascript:alert(1)', '잘못된 주소']) {
    await assert.rejects(
      () => mockApi('publish-post', { title: '제목', body: '본문', relatedUrl }),
      /https:\/\//,
    );
  }
  assert.equal((await mockApi('community')).posts.length, 1);
  const project = await mockApi('save-project', {
    title: '공유 프로젝트',
    summary: '소개',
    state: '개발 중',
    links: [],
  });
  await signup('B', 'b@example.test');
  const feedB = await mockApi('community');
  assert.equal(feedB.members[0].name, 'A');
  assert.equal(feedB.posts[0].title, '공유 글');
  assert.equal(feedB.posts[0].relatedUrl, 'https://example.test/shared-file.pdf');
  assert.deepEqual(feedB.posts[0].attachments, [
    { name: 'readme.txt', size: 5, dataUrl: 'data:application/octet-stream;base64,aGVsbG8=' },
  ]);
  assert(!JSON.stringify(feedB.members).includes('a@example.test'));
  await assert.rejects(
    () => mockApi('save-project', { id: project.id, title: '탈취', summary: 'X', links: [] }),
    /작성자/,
  );
  await mockApi('comment', { postId: post.id, text: '원댓글' });
  let thread = (await mockApi('community')).posts[0].comments[0];
  const aPeer = feedB.members[0].id;
  await mockApi('send-message', { peerId: aPeer, text: 'B의 메시지', lang: 'ko' });
  await mockApi('logout');
  await mockApi('login', { email: 'a@example.test', password: 'test-password' });
  assert.equal((await mockApi('community')).posts[0].comments[0].text, '원댓글');
  await mockApi('comment', { postId: post.id, parentId: thread.id, text: '대댓글' });
  thread = (await mockApi('community')).posts[0].comments[0];
  await mockApi('comment', {
    postId: post.id,
    parentId: thread.replies[0].id,
    text: '대댓글 답변',
  });
  thread = (await mockApi('community')).posts[0].comments[0];
  assert.equal(thread.replies.length, 2);
  assert.equal(thread.replies[1].replyToName, 'A');
  assert.equal(Object.values((await mockApi('community')).chats)[0][0].mine, false);
  await signup('C', 'c@example.test', { sharedDiscovery: false });
  assert.deepEqual((await mockApi('community')).chats, {});
  await assert.rejects(
    () => mockApi('login', { email: 'a@example.test', password: 'wrong-password' }),
    /확인/,
  );
  resetMockData();
  assert.deepEqual(await mockApi('me'), { id: null });
  assert.equal(localStorage.getItem(STORAGE_KEY), null);
});
