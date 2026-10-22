import { Avatar, Icon } from './UI';

const authButton =
  'auth-entry inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border-0 bg-brand px-4 text-base font-semibold leading-none text-white transition-colors hover:bg-[#6e43c5] hover:text-white focus-visible:outline-brand max-[650px]:px-3 max-[650px]:text-sm [&_svg]:h-4 [&_svg]:w-4';

export default function HeaderActions({
  user,
  unreadCount,
  onNotices,
  onAccount,
  onLogout,
  onLogin,
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-3 max-[650px]:gap-2"
      role="group"
      aria-label="알림 및 계정 메뉴"
    >
      <button
        id="bell"
        type="button"
        aria-label="알림 열기"
        aria-describedby="header-notice-count"
        title={unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : '새 알림이 없습니다'}
        onClick={onNotices}
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-solid border-line bg-white p-0 text-muted transition-colors hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {
          <span
            id="header-notice-count"
            role="status"
            aria-label={`읽지 않은 알림 ${unreadCount}개`}
            className="pointer-events-none absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-semibold leading-none text-white ring-2 ring-[#faf9fb]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        }
      </button>
      <div id="account" className="flex items-center gap-3 max-[650px]:gap-2" aria-label="내 계정">
        {user ? (
          <>
            <button
              type="button"
              aria-label="내 계정"
              title={`${user.name}님 계정`}
              onClick={onAccount}
              className="avatar grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-solid border-line bg-canvas p-0 transition-colors hover:border-brand/40"
            >
              <Avatar user={user} />
            </button>
            <button
              type="button"
              aria-label="로그아웃"
              title="로그아웃"
              onClick={onLogout}
              className={authButton + ' max-[400px]:w-10 max-[400px]:px-0'}
            >
              <Icon name="enter" />
              <span className="max-[400px]:hidden">로그아웃</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            aria-label="로그인 / 회원가입"
            onClick={onLogin}
            className={authButton}
          >
            <Icon name="enter" />
            <span className="max-[400px]:hidden">로그인 / 가입</span>
            <span className="hidden max-[400px]:inline">로그인</span>
          </button>
        )}
      </div>
    </div>
  );
}
