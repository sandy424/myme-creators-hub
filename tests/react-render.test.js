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
      { PostDetail, WritePost } = await vite.ssrLoadModule('/src/pages/Community.jsx'),
      { default: Auth } = await vite.ssrLoadModule('/src/components/AuthDialog.jsx'),
      { default: Profile } = await vite.ssrLoadModule('/src/components/Profile.jsx'),
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
    const writePost = render(React.createElement(WritePost));
    assert.match(writePost, /관련 HTTPS 링크 \(선택\)/);
    assert.match(writePost, /첨부자료 \(선택\)/);
    assert.match(writePost, /<input(?=[^>]*type="file")(?=[^>]*multiple="")[^>]*>/);
    assert.match(writePost, /<input(?=[^>]*name="relatedUrl")(?=[^>]*type="url")[^>]*>/);
    assert.match(writePost, /type="button"[^>]*>취소<\/button>/);
    for (const category of [
      '자유게시판',
      '개발 팁·AI 활용',
      '질문·답변',
      '작품·개발일지',
      '자료 공유',
    ]) {
      const form = render(React.createElement(WritePost, { category }));
      assert(form.includes('<option selected="">' + category + '</option>'));
      assert(form.includes('href="#board/' + encodeURIComponent(category) + '"'));
    }
    for (const category of ['전체', '공지·운영 안내', '없는 게시판']) {
      assert.match(
        render(React.createElement(WritePost, { category })),
        /<option selected="">자유게시판<\/option>/,
      );
    }
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
        relatedUrl: 'https://example.test/shared-file.pdf',
        attachments: [
          { name: 'readme.txt', size: 5, dataUrl: 'data:application/octet-stream;base64,aGVsbG8=' },
        ],
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
    assert.match(
      detail,
      /href="data:application\/octet-stream;base64,aGVsbG8=" download="readme.txt"/,
    );
    assert.match(
      detail,
      /href="https:\/\/example.test\/shared-file.pdf" target="_blank" rel="noopener noreferrer"/,
    );
    state.posts[0].relatedUrl = 'javascript:alert(1)';
    assert(!render(React.createElement(PostDetail, { id: 1 })).includes('javascript:'));
  } finally {
    await vite.close();
  }
});
