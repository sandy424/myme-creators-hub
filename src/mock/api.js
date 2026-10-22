// Browser-local UI adapter. No real backend is needed, and no data is pre-seeded.
// This is not production authentication. Use fictitious test credentials only.
export const STORAGE_KEY = 'myme-react-ui-v1';
const fresh = () => ({
  accounts: [],
  entities: [],
  comments: [],
  likes: [],
  connections: [],
  messages: [],
  session: null,
  nextId: 1,
});
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || fresh();
  } catch {
    return fresh();
  }
};
const write = (db) => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
const blank = () => ({
  posts: [],
  members: [],
  projects: [],
  links: [],
  notices: [],
  chats: {},
  career: [],
  pointHistory: [],
});
const clone = (value) => structuredClone(value);
const digest = async (text) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
const fail = (message) => {
  throw Error(message);
};
export function resetMockData() {
  localStorage.removeItem(STORAGE_KEY);
}
function publicMember(a) {
  const p = a.profile,
    fields = p.sharedDiscovery ? p.publicFields || [] : [];
  return {
    id: a.memberId,
    name: p.name,
    role: p.sharedDiscovery ? p.role : '',
    initial: p.name[0],
    isReal: true,
    isDemo: false,
    publicFields: fields,
    status: '',
    photo: fields.includes('photo') ? p.photo : '',
    country: fields.includes('country') ? p.country : '',
    languages: fields.includes('languages') ? p.languages : '',
    bio: fields.includes('bio') ? p.bio : '',
    portfolios:
      fields.includes('portfolio') && p.portfolio ? [{ name: '포트폴리오', url: p.portfolio }] : [],
    career: fields.includes('career') ? a.state.career : [],
  };
}
export async function mockApi(action, body) {
  const db = read(),
    me = db.accounts.find((a) => a.id === db.session);
  if (action === 'me')
    return me ? clone({ id: me.id, profile: me.profile, state: me.state }) : { id: null };
  if (action === 'logout') {
    db.session = null;
    write(db);
    return { ok: true };
  }
  if (action === 'signup' || action === 'login') {
    const email = String(body.email || '')
        .trim()
        .toLowerCase(),
      password = String(body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128)
      fail('올바른 이메일과 8~128자 비밀번호를 입력해 주세요.');
    let a = db.accounts.find((a) => a.profile.email === email);
    if (action === 'signup') {
      if (a) fail('이미 가입된 이메일입니다.');
      if (!body.termsConfirmed || !body.adultConfirmed || !body.privacyConfirmed)
        fail('필수 동의 항목을 확인해 주세요.');
      if (!String(body.name || '').trim()) fail('닉네임을 입력해 주세요.');
      if (
        body.discovery &&
        (!body.role?.trim() || !body.country || !body.languages || !body.discoveryConfirmed)
      )
        fail('동료 공개에 필요한 전문 분야·국가·언어·공개 대상 확인을 입력해 주세요.');
      const salt = crypto.randomUUID(),
        id = 'local-' + db.nextId++;
      a = {
        id,
        memberId: 1000000 + db.nextId++,
        salt,
        passwordHash: await digest(salt + password),
        profile: {
          id,
          email,
          name: String(body.name).trim(),
          role: body.role || '',
          country: body.country || '',
          languages: body.languages || '',
          bio: '',
          portfolio: '',
          photo: '',
          publicFields: [],
          affiliationProgram: body.affiliationProgram || '',
          affiliationCohort: body.affiliationCohort || '',
          alumni: !!body.alumni,
          discoveryRequested: !!body.discovery,
          discoveryConfirmed: !!body.discoveryConfirmed,
          sharedDiscovery: !!body.sharedDiscovery,
        },
        state: blank(),
      };
      db.accounts.push(a);
    } else if (!a || a.passwordHash !== (await digest(a.salt + password)))
      fail('이메일 또는 비밀번호를 확인해 주세요.');
    db.session = a.id;
    write(db);
    return clone({ id: a.id, profile: a.profile, state: a.state });
  }
  if (!me) fail('로그인이 필요합니다.');
  const mine = (e) => e.sender === me.id || e.receiver === me.id;
  const known = new Set(
    [...db.messages.filter(mine), ...db.connections.filter(mine)].flatMap((e) => [
      e.sender,
      e.receiver,
    ]),
  );
  const peer = () => {
    const p = db.accounts.find((a) => a.memberId === Number(body.peerId));
    if (!p || p.id === me.id || (!p.profile.sharedDiscovery && !known.has(p.id)))
      fail('상대를 찾을 수 없습니다.');
    return p;
  };
  const author = (id) => db.accounts.find((a) => a.id === id)?.profile.name || '회원';
  if (action === 'community') {
    const members = db.accounts
      .filter((a) => a.id !== me.id && (a.profile.sharedDiscovery || known.has(a.id)))
      .map((a) => {
        const m = publicMember(a),
          r = db.connections.find((c) => mine(c) && (c.sender === a.id || c.receiver === a.id));
        if (r) {
          m.status =
            r.status === 'accepted' ? '동료' : r.sender === me.id ? '요청 중' : '받은 요청';
          m.incoming = r.status === 'pending' && r.receiver === me.id;
        }
        return m;
      });
    const posts = [],
      projects = [];
    for (const e of [...db.entities].reverse()) {
      const value = {
        ...e.payload,
        id: e.id,
        ownerId: e.owner,
        author: author(e.owner),
        canEdit: e.owner === me.id,
        shared: true,
      };
      if (e.kind === 'project') projects.push(value);
      else {
        const comments = db.comments.filter((c) => c.postId === e.id);
        const render = (c) => ({
          id: c.id,
          name: author(c.author),
          text: c.text,
          replies: [],
          replyToName: c.replyTo ? author(db.comments.find((t) => t.id === c.replyTo)?.author) : '',
        });
        posts.push({
          ...value,
          liked: db.likes.some((l) => l.postId === e.id && l.account === me.id),
          likes: db.likes.filter((l) => l.postId === e.id).length,
          comments: comments
            .filter((c) => !c.parent)
            .map((c) => ({
              ...render(c),
              replies: comments.filter((r) => r.parent === c.id).map(render),
            })),
        });
      }
    }
    const chats = {};
    for (const m of db.messages.filter(mine)) {
      const p = db.accounts.find((a) => a.id === (m.sender === me.id ? m.receiver : m.sender));
      (chats[p.memberId] ||= []).push({ ...m, mine: m.sender === me.id, time: m.created });
    }
    return clone({
      members,
      posts,
      projects,
      chats,
      notices: members
        .filter((m) => m.incoming)
        .map((m) => ({
          text: m.name + '님이 동료 요청을 보냈습니다.',
          sub: '동료 요청',
          route: '#members',
          read: false,
        })),
      selfId: me.memberId,
    });
  }
  if (action === 'state') {
    const p = body.state.user || me.profile;
    me.profile = { ...p, id: me.id, email: me.profile.email };
    for (const key of ['career', 'pointHistory', 'notices'])
      if (Array.isArray(body.state[key])) me.state[key] = body.state[key];
    write(db);
    return { ok: true };
  }
  if (action === 'publish-post') {
    if (!body.title?.trim() || !body.body?.trim()) fail('제목과 본문을 입력해 주세요.');
    const id = db.nextId++;
    db.entities.push({
      id,
      kind: 'post',
      owner: me.id,
      payload: { title: body.title, body: body.body, category: body.category },
    });
    write(db);
    return { id };
  }
  if (action === 'save-project') {
    let e = db.entities.find((e) => e.id === Number(body.id));
    if (body.id && (!e || e.owner !== me.id)) fail('작성자만 수정할 수 있습니다.');
    if (!body.title?.trim() || !body.summary?.trim()) fail('프로젝트 이름과 소개를 입력해 주세요.');
    const links = (body.links || []).map((l) => {
      const url = new URL(l.url);
      if (url.protocol !== 'https:') fail('HTTPS 주소를 입력해 주세요.');
      return { name: l.name, url: url.href };
    });
    const payload = {
      title: body.title,
      summary: body.summary,
      state: body.state,
      members: body.members || '',
      links,
    };
    if (e) e.payload = payload;
    else {
      e = { id: db.nextId++, kind: 'project', owner: me.id, payload };
      db.entities.push(e);
    }
    write(db);
    return { id: e.id };
  }
  if (action === 'comment' || action === 'like') {
    const post = db.entities.find((e) => e.id === Number(body.postId) && e.kind === 'post');
    if (!post) fail('게시글을 찾을 수 없습니다.');
    if (action === 'like') {
      db.likes = db.likes.filter((l) => !(l.postId === post.id && l.account === me.id));
      if (body.liked) db.likes.push({ postId: post.id, account: me.id });
    } else {
      if (!body.text?.trim()) fail('내용을 입력해 주세요.');
      const target = body.parentId
        ? db.comments.find((c) => c.id === Number(body.parentId) && c.postId === post.id)
        : null;
      if (body.parentId && !target) fail('답글 대상을 확인해 주세요.');
      db.comments.push({
        id: db.nextId++,
        postId: post.id,
        author: me.id,
        text: body.text,
        parent: target ? target.parent || target.id : null,
        replyTo: target?.id || null,
      });
    }
    write(db);
    return { ok: true };
  }
  if (action === 'send-message') {
    const p = peer();
    if (!body.text?.trim()) fail('메시지를 입력해 주세요.');
    const id = db.nextId++;
    db.messages.push({
      id,
      sender: me.id,
      receiver: p.id,
      text: body.text,
      lang: body.lang,
      created: new Date().toISOString(),
    });
    write(db);
    return { id };
  }
  if (action === 'connection') {
    const p = peer(),
      key = [me.id, p.id].sort().join(':'),
      c = db.connections.find((c) => c.key === key);
    if (body.operation === 'request') {
      if (c) fail('이미 요청하거나 연결된 회원입니다.');
      db.connections.push({ key, sender: me.id, receiver: p.id, status: 'pending' });
    } else if (body.operation === 'cancel') {
      if (!c || c.sender !== me.id || c.status !== 'pending') fail('취소할 요청이 없습니다.');
      db.connections = db.connections.filter((c) => c.key !== key);
    } else if (body.operation === 'accept') {
      if (!c || c.receiver !== me.id || c.status !== 'pending') fail('수락할 요청이 없습니다.');
      c.status = 'accepted';
    } else fail('요청을 확인해 주세요.');
    write(db);
    return { ok: true };
  }
  fail('지원하지 않는 테스트 API입니다.');
}
