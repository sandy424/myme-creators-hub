import { useCallback, useEffect, useRef, useState } from 'react';
import { api, emptyState, isMock } from './api';
import { resetMockData, STORAGE_KEY } from './mock/api';
import { HubContext } from './HubContext';
import { Modal, Action } from './components/UI';
import HeaderActions from './components/HeaderActions';
import { NewsRail, ActivityRail } from './components/SidePanels';
import AuthDialog from './components/Auth';
import ProfileDialog, { PublicProfile } from './components/Profile';
import ChatDialog from './components/Chat';
import ActivityDialog from './components/PointWallet';
import NoticesDialog from './components/Notices';
import Home from './pages/Home';
import { Board, WritePost, PostDetail } from './pages/Community';
import Members from './pages/Members';
import { Team, Projects, ProjectEditor, LinkEditor } from './pages/Projects';
const emptyShared = () => ({ members: [], posts: [], projects: [], chats: {}, notices: [] });
function readRoute() {
  try {
    return (location.hash || '#home').slice(1).split('/').map(decodeURIComponent);
  } catch {
    return ['home'];
  }
}
export default function App() {
  const [user, setUser] = useState(null),
    [privateData, setPrivateData] = useState(emptyState),
    [shared, setShared] = useState(emptyShared),
    [route, setRoute] = useState(readRoute),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(''),
    [loading, setLoading] = useState(true);
  const requestId = useRef(0),
    stateRef = useRef(null),
    userRef = useRef(null),
    toastTimer = useRef();
  const notify = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3500);
  }, []);
  const refresh = useCallback(async () => {
    const version = ++requestId.current;
    const me = await api('me');
    let next = emptyShared();
    if (me.id) next = await api('community');
    if (version !== requestId.current) return;
    if (userRef.current?.id !== me.profile?.id) setModal(null);
    setUser(me.id ? me.profile : null);
    userRef.current = me.id ? me.profile : null;
    setPrivateData(me.id ? { ...emptyState(), ...me.state } : emptyState());
    setShared(next);
    setLoading(false);
  }, []);
  useEffect(() => {
    refresh().catch((err) => {
      setLoading(false);
      notify(err.message);
    });
    const onHash = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    };
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY || e.key === null) refresh().catch((err) => notify(err.message));
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('storage', onStorage);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh().catch((err) => notify(err.message));
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(() => {
      if (userRef.current && document.visibilityState !== 'hidden') refresh().catch(() => {});
    }, 4000);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
      clearTimeout(toastTimer.current);
    };
  }, [refresh, notify]);
  const state = {
    ...emptyState(),
    ...privateData,
    ...shared,
    career: privateData.career || [],
    pointHistory: privateData.pointHistory || [],
    notices: shared.notices,
  };
  stateRef.current = state;
  const open = (type, props = {}) => setModal({ type, ...props }),
    close = () => setModal(null);
  function navigate(hash) {
    close();
    location.hash = hash;
  }
  function requireUser(fn) {
    if (user) fn();
    else open('auth');
  }
  async function action(name, payload) {
    const result = await api(name, payload);
    await refresh();
    return result;
  }
  const markNoticesRead = useCallback(
    async (ids) => {
      if (!ids.length) return;
      await api('read-notices', { ids });
      await refresh();
    },
    [refresh],
  );
  async function savePrivate(values) {
    await api('state', {
      state: { ...stateRef.current, ...values, user: values.user || userRef.current },
    });
    await refresh();
  }
  async function connect(member) {
    try {
      await action('connection', {
        peerId: member.id,
        operation: member.incoming ? 'accept' : member.status === '요청 중' ? 'cancel' : 'request',
      });
      notify(
        member.incoming
          ? '새 동료와 연결되었습니다.'
          : member.status === '요청 중'
            ? '요청을 취소했습니다.'
            : '동료 요청을 보냈습니다.',
      );
    } catch (err) {
      notify(err.message);
    }
  }
  async function logout() {
    try {
      await api('logout', {});
      await refresh();
      navigate('#home');
      notify('로그아웃했습니다.');
    } catch (err) {
      notify(err.message);
    }
  }
  const context = {
    user,
    state,
    navigate,
    open,
    requireUser,
    action,
    savePrivate,
    connect,
    notify,
    markNoticesRead,
  };
  let page;
  if (loading)
    page = (
      <div
        className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px]
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[16px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] text-center text-muted p-[35px]
          [.original-columns_&]:text-[#9c93a9]
          [.original-columns_&]:[background:#fbfbfb]
          [.original-columns_&]:[border-width:1px]
          [.original-columns_&]:[border-style:dashed]
          [.original-columns_&]:[border-color:#e9e8eb]
          [.original-columns_&]:rounded-[13px]
          [.original-columns_&]:m-[0_0_18px]
          [.original-columns_&]:p-[42px_12px]
          [.original-columns_&]:text-[16px]
          [.original-columns_&]:leading-[1.9] panel empty`}
      >
        화면을 불러오는 중…
      </div>
    );
  else if (route[0] === 'home' || !route[0]) page = <Home />;
  else if (!user)
    page = (
      <div
        className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px]
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[16px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] text-center text-muted p-[35px]
          [.original-columns_&]:text-[#9c93a9]
          [.original-columns_&]:[background:#fbfbfb]
          [.original-columns_&]:[border-width:1px]
          [.original-columns_&]:[border-style:dashed]
          [.original-columns_&]:[border-color:#e9e8eb]
          [.original-columns_&]:rounded-[13px]
          [.original-columns_&]:m-[0_0_18px]
          [.original-columns_&]:p-[42px_12px]
          [.original-columns_&]:text-[16px]
          [.original-columns_&]:leading-[1.9] panel empty`}
      >
        <h2>로그인 후 이용할 수 있어요.</h2>
        <Action primary onClick={() => open('auth')}>
          로그인 / 가입
        </Action>
      </div>
    );
  else if (route[0] === 'board') page = <Board category={route[1] || '전체'} />;
  else if (route[0] === 'write') page = <WritePost key={route[1] || '전체'} category={route[1]} />;
  else if (route[0] === 'edit-post') {
    const post = state.posts.find((entry) => entry.id === Number(route[1]));
    page = post?.canEdit ? (
      <WritePost key={`edit-${post.id}`} post={post} category={post.category} />
    ) : (
      <p>
        수정할 수 없는 게시글입니다. <a href="#board">목록으로</a>
      </p>
    );
  } else if (route[0] === 'post') page = <PostDetail id={route[1]} />;
  else if (route[0] === 'members') page = <Members />;
  else if (route[0] === 'team') page = <Team />;
  else if (route[0] === 'projects') page = <Projects id={route[1]} />;
  else page = <Home />;
  const member = modal?.type === 'member' ? state.members.find((m) => m.id === modal.id) : null,
    project = state.projects.find((p) => p.id === modal?.id);
  return (
    <HubContext.Provider value={context}>
      <header
        className={`[z-index:40] [backdrop-filter:blur(12px)] [border-bottom-width:1px] [border-bottom-style:solid]
          [border-bottom-color:#e9e7eb] [border-color:var(--color-line)] [background:#faf9fb]
          w-full [position:sticky] [top:0]
          [box-shadow:0_1px_8px_#1a0f2a04]
          [&_nav_a]:[white-space:nowrap] [&_nav_a]:[justify-content:center]
          [&_nav_a]:[align-items:center] [&_nav_a]:[gap:8px] [&_nav_a]:[display:inline-flex]
          [&_nav_a]:[position:relative]
          max-[650px]:[&_nav_a]:[padding:4px_15px] [&_nav_a_img]:[object-fit:contain]
          [&_nav_a_img]:[flex-shrink:0] [&_nav_a_img]:[width:20px] [&_nav_a_img]:[height:20px]
          [&_nav_a_img]:[display:block] [&_nav]:[background:#eeecf0] [&_nav]:[border-color:#e2dfe6]
          max-[650px]:[&_nav]:[border-top-width:1px]
          max-[650px]:[&_nav]:[border-top-style:solid]
          max-[650px]:[&_nav]:[border-top-color:#e2dfe6]
          max-[650px]:[&_nav]:[order:3]
          max-[650px]:[&_nav]:[justify-content:center]
          max-[650px]:[&_nav]:[width:100%]
          max-[650px]:[&_nav]:[padding-top:12px]`}
      >
        <div className="mx-auto flex h-[98px] w-full max-w-[1260px] items-center justify-between gap-[25px] px-10 max-[900px]:gap-[15px] max-[900px]:px-[25px] max-[760px]:min-h-[74px] max-[760px]:flex-wrap max-[650px]:h-auto max-[650px]:min-h-[90px] max-[650px]:gap-3.5 max-[650px]:px-5 max-[650px]:py-[18px] max-[360px]:gap-2">
          <a
            className={`whitespace-nowrap tracking-[-.6px] items-center gap-[11px] text-[18px] font-[700] leading-[1.3] flex
          max-[900px]:text-[16px]
          max-[650px]:text-[16px] max-[360px]:gap-2 [&_em]:text-brand [&_em]:not-italic [&_small]:tracking-[2px]
          [&_small]:text-muted [&_small]:mt-[5px] [&_small]:text-[12px] [&_small]:block
          max-[650px]:[&_small]:text-[7px] [footer_&]:text-[#8d819e] [footer_&]:text-[16px] brand`}
            href="#home"
          >
            <b aria-hidden="true">
              <img
                className="max-[360px]:h-10 max-[360px]:w-10"
                src="/assets/logo.png"
                alt="MYME Creators Hub"
                width="50"
                height="50"
              />
            </b>
            <span className="flex flex-col items-center gap-1 text-center">
              <span className="block text-[24px] max-[360px]:text-xl">MYME</span>
              <em className="block text-[16px] max-[900px]:text-[16px] max-[650px]:text-[14px] max-[360px]:text-xs">
                CREATORS HUB
              </em>
            </span>
          </a>
          <nav
            className={`[background:#f5f4f6] [border-width:1px] [border-style:solid] [border-color:#e9e7eb]
          [border-radius:16px] [gap:5px] [padding:5px] [font-size:16px] [font-weight:700] [display:flex]
          [box-shadow:inset_0_2px_4px_#1a0f2a04]
          max-[900px]:[gap:18px]
          max-[760px]:[order:3]
          max-[760px]:[justify-content:center]
          max-[760px]:[width:100%]
          max-[760px]:[padding:4px]
          max-[760px]:[overflow:auto] [&_a]:[color:#746788] [&_a]:[border-radius:12px]
          [&_a]:[padding:10px_24px] [&_a]:[font-size:16px] [&_a]:[transition:background_.15s,color_.15s]
          max-[760px]:[&_a]:[white-space:nowrap]
          max-[760px]:[&_a]:[text-align:center]
          max-[760px]:[&_a]:[flex:1]
          max-[760px]:[&_a]:[padding:9px_15px]
          max-[760px]:[&_a]:[font-size:16px] [&_a_span]:[margin-right:7px]`}
            aria-label="주 메뉴"
          >
            <a
              className={
                !['team', 'projects'].includes(route[0])
                  ? `[nav_a&]:text-white [nav_a&]:[background:linear-gradient(135deg,#8b5ad1,#743ac8)]
          [nav_a&]:shadow-[0_4px_14px_#8b5ad135]
          [.tabs_button&]:text-[#743ac8]
          [.tabs_button&]:[background:#f6f6f7]
          [.tabs_button&]:[border-color:#e2e1e4] [header_nav_a&]:[background:#29252f]
          [header_nav_a&]:shadow-[0_4px_12px_#25232918] active`
                  : ''
              }
              href="#home"
            >
              <img src="/assets/home.svg" alt="" aria-hidden="true" width="20" height="20" />
              메인
            </a>
            <a
              className={
                ['team', 'projects'].includes(route[0])
                  ? `[nav_a&]:text-white [nav_a&]:[background:linear-gradient(135deg,#8b5ad1,#743ac8)]
          [nav_a&]:shadow-[0_4px_14px_#8b5ad135]
          [.tabs_button&]:text-[#743ac8]
          [.tabs_button&]:[background:#f6f6f7]
          [.tabs_button&]:[border-color:#e2e1e4] [header_nav_a&]:[background:#29252f]
          [header_nav_a&]:shadow-[0_4px_12px_#25232918] active`
                  : ''
              }
              href="#team"
            >
              <img src="/assets/team.svg" alt="" aria-hidden="true" width="20" height="20" />
              팀 협업
            </a>
          </nav>
          <HeaderActions
            user={user}
            unreadCount={state.notices.filter((notice) => !notice.read).length}
            onNotices={() => requireUser(() => open('notices'))}
            onAccount={() => open('account')}
            onLogout={logout}
            onLogin={() => open('auth')}
          />
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-[1840px] grid-cols-[minmax(0,1fr)] items-start gap-y-6 px-10 pb-20 pt-8 min-[1000px]:grid-cols-[minmax(0,1fr)_220px] min-[1000px]:gap-x-10 min-[1200px]:grid-cols-[170px_minmax(0,1fr)_220px] min-[1500px]:grid-cols-[200px_minmax(0,1fr)_240px] min-[1500px]:gap-x-14 min-[1800px]:gap-x-16 max-[900px]:px-[25px] max-[650px]:px-[18px] max-[650px]:pb-[65px] max-[650px]:pt-6">
        <NewsRail />
        <main className="min-h-[65vh] min-w-0" id="main">
          {page}
        </main>
        <ActivityRail />
      </div>
      <button
        className={`z-[45] text-white bg-brand [border-width:3px] [border-style:solid] [border-color:#0000]
          rounded-[18px] items-center gap-[9px] p-[13px_18px] text-[14px] font-[600] flex fixed bottom-5.5
          right-[25px] shadow-[0_8px_24px_#7c54b52b]
          max-[760px]:bottom-4
          max-[760px]:right-4
          max-[650px]:text-[12px]
          max-[650px]:bottom-3.5
          max-[650px]:right-3.5 hover:text-white hover:[background:#6e43c5] [&_>_span]:[background:#9b71d7]
          [&_>_span]:rounded-full [&_>_span]:w-2 [&_>_span]:h-2 chat-launcher`}
        onClick={() => requireUser(() => open('chat'))}
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.5 3.4 6L4 22l5.5-3.3c.8.2 1.6.3 2.5.3 5.5 0 10-3.6 10-8S17.5 3 12 3Z" />
        </svg>{' '}
        실시간 통역 채팅
      </button>
      <footer
        className={`[border-top-width:1px] [border-top-style:solid] [border-top-color:var(--color-line)] [color:#a49caf]
          [background:#eae8ed] [border-color:#dedbe2] w-full [padding:32px_6%]
          max-[650px]:[padding:32px_6%_85px] [&_p]:[color:#a39bae] [&_p]:[font-size:14px]
          [&_small]:[color:#a39bae] [&_small]:[font-size:14px]`}
      >
        <a
          className={`whitespace-nowrap tracking-[-.6px] items-center gap-[11px] text-[18px] font-[700] leading-[1.3] flex
          max-[900px]:text-[16px]
          max-[650px]:text-[16px] [&_em]:text-brand [&_em]:not-italic [&_small]:tracking-[2px]
          [&_small]:text-muted [&_small]:mt-[5px] [&_small]:text-[12px] [&_small]:block
          max-[650px]:[&_small]:text-[7px] [footer_&]:text-[#8d819e] [footer_&]:text-[16px] brand`}
          href="#home"
        >
          MYME Creators Hub
        </a>
        <p>게임으로 시작된 만남, 함께 만드는 더 큰 가능성.</p>
        <small>운영 · ㈜공감오래콘텐츠</small>
      </footer>
      {toast && (
        <div
          id="toast"
          className={`block text-white z-[99] [background:#2f2a37] rounded-[12px] p-[12px_25px] text-[16px]  fixed
          bottom-7.5 left-[50%] [transform:translate(-50%)]`}
          role="status"
        >
          {toast}
        </div>
      )}
      {modal?.type === 'auth' && (
        <AuthDialog initialMode={modal.initialMode} onClose={close} onSuccess={refresh} />
      )}
      {modal?.type === 'profile' && user && (
        <ProfileDialog
          key={user.id}
          user={user}
          onClose={close}
          onSave={(next) => savePrivate({ user: next })}
        />
      )}
      {modal?.type === 'member' && (
        <>
          {member ? (
            <PublicProfile
              member={member}
              onClose={close}
              onChat={(id) => open('chat', { id })}
              onConnect={connect}
            />
          ) : (
            <Modal title="공개 프로필" onClose={close}>
              <p>이 회원의 공개 프로필을 찾을 수 없습니다.</p>
            </Modal>
          )}
        </>
      )}
      {modal?.type === 'chat' && user && <ChatDialog initialId={modal.id} onClose={close} />}
      {modal?.type === 'project-editor' && user && (
        <ProjectEditor project={project} onClose={close} />
      )}
      {modal?.type === 'link' && project && <LinkEditor project={project} onClose={close} />}
      {['career', 'wallet', 'programs', 'bounties'].includes(modal?.type) && (
        <ActivityDialog
          kind={modal.type}
          initialView={modal.initialView}
          initialEventId={modal.initialEventId}
          onClose={close}
        />
      )}
      {modal?.type === 'account' && user && (
        <Modal title="내 계정" onClose={close}>
          <p>{user.name}님</p>
          <p
            className={`text-muted text-[16px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[16px] muted`}
          >
            {user.email}
          </p>
          <div
            className={`flex-wrap gap-2.5 flex
          [.original-boards_&]:grid-cols-[repeat(auto-fit,minmax(125px,1fr))]
          [.original-boards_&]:gap-2.5
          [.original-boards_&]:mt-4.5
          [.original-boards_&]:grid
          max-[650px]:[.original-boards_&]:grid-cols-[repeat(2,minmax(0,1fr))]
          [.original-welcome_&]:gap-2 actions`}
          >
            <Action primary onClick={() => open('profile')}>
              프로필 수정
            </Action>
            <Action onClick={logout}>로그아웃</Action>
          </div>
        </Modal>
      )}
      {modal?.type === 'notices' && (
        <NoticesDialog
          onClose={close}
          onOpen={(notice) => {
            if (notice.type === 'message') open('chat', { id: notice.peerId });
            else navigate(notice.route);
          }}
        />
      )}
    </HubContext.Provider>
  );
}
