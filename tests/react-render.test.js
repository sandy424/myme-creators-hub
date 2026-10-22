import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
test('React pages and dialogs render independently with empty data and with category/reply fixtures', async () => {
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { HubContext } = await vite.ssrLoadModule('/src/HubContext.js'),
      { default: Home } = await vite.ssrLoadModule('/src/pages/Home.jsx'),
      { PostDetail } = await vite.ssrLoadModule('/src/pages/Community.jsx'),
      { default: Auth } = await vite.ssrLoadModule('/src/components/AuthDialog.jsx'),
      { default: Profile } = await vite.ssrLoadModule('/src/components/ProfileDialog.jsx'),
      { default: Chat } = await vite.ssrLoadModule('/src/components/ChatDialog.jsx'),
      { Projects, Team } = await vite.ssrLoadModule('/src/pages/Projects.jsx');
    const user = {
        id: 'test',
        name: '테스트',
        role: '개발',
        country: '대한민국',
        email: 'test@example.test',
        publicFields: [],
      },
      state = {
        posts: [],
        members: [],
        projects: [],
        career: [],
        pointHistory: [],
        chats: {},
        notices: [],
      };
    const ctx = {
      user,
      state,
      navigate() {},
      open() {},
      requireUser() {},
      notify() {},
      action: async () => ({}),
      connect() {},
      savePrivate: async () => ({}),
    };
    const render = (component) =>
      renderToStaticMarkup(React.createElement(HubContext.Provider, { value: ctx }, component));
    assert.match(render(React.createElement(Home)), /아직 등록된 글이 없습니다/);
    assert.match(render(React.createElement(Projects)), /등록된 프로젝트가 없습니다/);
    assert.match(render(React.createElement(Team)), /테스트님의 협력/);
    assert.match(render(React.createElement(Chat, { onClose() {} })), /아직 대화 상대가 없습니다/);
    const auth = render(
      React.createElement(Auth, { initialMode: 'signup', onClose() {}, onSuccess() {} }),
    );
    for (const field of [
      'affiliationProgram',
      'affiliationCohort',
      'discoveryConfirmed',
      'sharedDiscovery',
      'termsConfirmed',
      'adultConfirmed',
      'privacyConfirmed',
    ])
      assert(auth.includes('name="' + field + '"'));
    assert.match(auth, /role="combobox"/);
    assert.match(
      render(React.createElement(Profile, { user, onClose() {}, onSave() {} })),
      /프로필 저장/,
    );
    state.posts = [
      {
        id: 1,
        title: '제목',
        category: '질문·답변',
        body: '<script>원문</script>',
        author: '작성자',
        likes: 0,
        comments: [
          {
            id: 10,
            name: 'A',
            text: '원댓글',
            replies: [{ id: 11, name: 'B', text: '답글', replyToName: 'A' }],
          },
        ],
      },
    ];
    assert.match(render(React.createElement(Home)), /recent-post-category">질문·답변/);
    const detail = render(React.createElement(PostDetail, { id: 1 }));
    assert.match(detail, /@A/);
    assert.equal((detail.match(/답글 달기/g) || []).length, 2);
    assert(detail.includes('&lt;script&gt;원문&lt;/script&gt;'));
  } finally {
    await vite.close();
  }
});
