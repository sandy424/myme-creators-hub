import test from 'node:test';
import assert from 'node:assert/strict';
import { mockApi, STORAGE_KEY, SESSION_KEY } from '../src/mock/api.js';

class MemoryStorage {
  map = new Map();
  getItem(key) {
    return this.map.get(key) ?? null;
  }
  setItem(key, value) {
    this.map.set(key, String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
}
function setup() {
  globalThis.localStorage = new MemoryStorage();
  const sessions = [new MemoryStorage(), new MemoryStorage()];
  const tab = (index) => {
    globalThis.sessionStorage = sessions[index];
  };
  tab(0);
  return { tab, sessions };
}
const signup = (name) =>
  mockApi('signup', {
    name,
    email: `${name}@example.test`,
    password: 'test-password',
    termsConfirmed: true,
    adultConfirmed: true,
    privacyConfirmed: true,
    sharedDiscovery: true,
  });
const unread = (community) => community.notices.filter((notice) => !notice.read);

test('two tabs keep separate logins and receive persistent, distinct comment and chat notifications', async () => {
  const { tab } = setup();
  const a = await signup('A');
  const aPeer = (await mockApi('community')).selfId;
  const post = await mockApi('publish-post', {
    title: 'Test post',
    body: 'Body',
    category: '자유게시판',
  });
  tab(1);
  assert.equal((await mockApi('me')).id, null);
  const b = await signup('B');
  await mockApi('comment', { postId: post.id, text: 'A comment' });
  await mockApi('send-message', { peerId: aPeer, text: 'Hello', lang: 'ko' });
  assert.equal(unread(await mockApi('community')).length, 0);
  tab(0);
  assert.equal((await mockApi('me')).id, a.id);
  let notices = unread(await mockApi('community'));
  assert.deepEqual(
    notices.map((notice) => notice.type),
    ['message', 'comment'],
  );
  const firstMessage = notices[0];
  assert.equal(notices[1].route, '#post/' + post.id);
  await mockApi('read-notices', { ids: [firstMessage.id] });
  assert.equal(unread(await mockApi('community')).length, 1);
  await mockApi('logout');
  await mockApi('login', { email: 'A@example.test', password: 'test-password' });
  assert.equal(
    (await mockApi('community')).notices.find((n) => n.id === firstMessage.id).read,
    true,
  );
  tab(1);
  assert.equal((await mockApi('me')).id, b.id);
  await mockApi('send-message', { peerId: aPeer, text: 'Hello', lang: 'ko' });
  await mockApi('read-notices', { ids: [firstMessage.id] });
  assert.deepEqual((await mockApi('me')).state.readNoticeIds || [], []);
  tab(0);
  notices = (await mockApi('community')).notices;
  assert.equal(notices.filter((n) => n.type === 'message').length, 2);
  assert.equal(unread({ notices }).filter((n) => n.type === 'message').length, 1);
  assert.equal(new Set(notices.map((n) => n.id)).size, notices.length);
  await mockApi('read-notices', { ids: unread({ notices }).map((n) => n.id) });
  assert.equal(unread(await mockApi('community')).length, 0);
  tab(1);
  await mockApi('logout');
  tab(0);
  assert.equal((await mockApi('me')).id, a.id);
});

test('reply notifications go to the comment author and renewed connection requests get new IDs', async () => {
  const { tab } = setup();
  await signup('A');
  const aPeer = (await mockApi('community')).selfId;
  const post = await mockApi('publish-post', { title: 'Post', body: 'Body' });
  tab(1);
  await signup('B');
  await mockApi('comment', { postId: post.id, text: 'B comment' });
  const commentId = (await mockApi('community')).posts[0].comments[0].id;
  tab(0);
  await mockApi('comment', { postId: post.id, parentId: commentId, text: 'A reply' });
  assert.equal((await mockApi('community')).notices.length, 1);
  tab(1);
  const replies = (await mockApi('community')).notices;
  assert.equal(replies.length, 1);
  assert.equal(replies[0].type, 'reply');
  await mockApi('connection', { peerId: aPeer, operation: 'request' });
  tab(0);
  const request = (await mockApi('community')).notices.find((n) => n.type === 'connection');
  await mockApi('read-notices', { ids: [request.id] });
  tab(1);
  await mockApi('connection', { peerId: aPeer, operation: 'cancel' });
  await mockApi('connection', { peerId: aPeer, operation: 'request' });
  const bPeer = (await mockApi('community')).selfId;
  tab(0);
  const renewed = (await mockApi('community')).notices.find((n) => n.type === 'connection');
  assert.notEqual(renewed.id, request.id);
  assert.equal(renewed.read, false);
  await mockApi('connection', { peerId: bPeer, operation: 'accept' });
  tab(1);
  assert(
    (await mockApi('community')).notices.some(
      (n) => n.id.startsWith('connection-accepted:') && !n.read,
    ),
  );
});

test('legacy shared sessions migrate once without losing the active account', async () => {
  const { sessions } = setup();
  const account = await signup('Legacy');
  const db = JSON.parse(localStorage.getItem(STORAGE_KEY));
  db.session = account.id;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  sessions[0].removeItem(SESSION_KEY);
  assert.equal((await mockApi('me')).id, account.id);
  assert.equal(sessions[0].getItem(SESSION_KEY), account.id);
  assert.equal(JSON.parse(localStorage.getItem(STORAGE_KEY)).session, null);
});
