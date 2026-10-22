import { useHub } from '../HubContext';
import { categories } from '../api';
import { Avatar, Action } from '../components/UI';
export default function Home() {
  const { user, state, navigate, open, requireUser } = useHub();
  return (
    <>
      <section
        className={`text-[#f7f5fa] shadow-[none] [background:radial-gradient(at_85%_25%,#48365e_0,#0000_60%),#242127]
          [border-width:1px] [border-style:solid] [border-color:#39333f] rounded-[28px] grid-cols-[1.2fr_1fr]
          gap-[0_20px] p-[48px_44px_0] grid relative overflow-hidden
          max-[900px]:p-[32px_28px_0]
          max-[650px]:rounded-[22px]
          max-[650px]:grid-cols-[1fr]
          max-[650px]:p-[28px_24px_0] [&_h1]:tracking-[-1.8px] [&_h1]:text-[#faf8ff] [&_h1]:m-[0_0_18px]
          [&_h1]:text-[clamp(30px,3.4vw,43px)] [&_h1]:font-[800] [&_h1]:leading-[1.35]
          max-[900px]:[&_h1]:text-[33px]
          max-[650px]:[&_h1]:text-[32px] [&_button]:text-[#e2dce9] [&_button]:[background:#ffffff09]
          [&_button]:[border-width:1px] [&_button]:[border-style:solid] [&_button]:[border-color:#ffffff24]
          [&_button]:rounded-[9px] [&_button]:p-[10px_13px] [&_button]:text-[11px] [&_button:hover]:text-white
          [&_button:hover]:[background:#ffffff16] original-welcome`}
      >
        <div className={'z-[1] p-[8px_0_30px] max-[650px]:p-[8px_0_0] welcome-copy'}>
          <p
            className={`tracking-[1.6px] text-[#8665b5] text-[11px] font-[800]
          [.original-welcome_&]:text-[#bbb2c9]
          [.original-welcome_&]:tracking-[1.7px]
          [.original-welcome_&]:m-[0_0_20px]
          [.original-welcome_&]:text-[10px]
          max-[650px]:[.original-welcome_&]:tracking-[1px]
          max-[650px]:[.original-welcome_&]:text-[9px] eyebrow`}
          >
            MYME · CREATE · SHARE · LEVEL UP
          </p>
          <h1>
            {user ? (
              user.name + '님, 환영합니다'
            ) : (
              <>
                좋은 게임의 시작,
                <br />
                함께 만드는 우리.
              </>
            )}
          </h1>
          <p
            className={
              'text-[#bbb2c9] max-w-[370px] m-[0_0_25px] text-[13px] leading-[1.9] max-[650px]:text-[12px] welcome-meta'
            }
          >
            {user
              ? `Lv.1 · ${user.role || '전문 분야를 입력해 주세요'} · ${user.country || ''}`
              : '게임 개발 경험을 나누고, 동료와 협업하며 작품과 커리어를 연결하는 공간입니다.'}
          </p>
          {user?.bio && (
            <p
              className={`[.original-welcome_&]:text-[#bbb2c9]
          [.original-welcome_&]:whitespace-pre-wrap
          [.original-welcome_&]:max-w-175
          [.original-welcome_&]:m-[-8px_0_16px]
          [.original-welcome_&]:text-[13px] welcome-bio`}
            >
              {user.bio}
            </p>
          )}
          <div
            className={`flex-wrap gap-2.5 flex
          [.original-boards_&]:grid-cols-[repeat(auto-fit,minmax(125px,1fr))]
          [.original-boards_&]:gap-2.5
          [.original-boards_&]:mt-4.5
          [.original-boards_&]:grid
          max-[650px]:[.original-boards_&]:grid-cols-[repeat(2,minmax(0,1fr))]
          [.original-welcome_&]:gap-2 actions`}
          >
            <Action
              primary
              onClick={() => (user ? open('profile') : open('auth', { initialMode: 'signup' }))}
            >
              {user ? '내 프로필·사진' : '가입하고 시작하기'}
            </Action>
            <Action onClick={() => requireUser(() => navigate('#members'))}>동료 찾기</Action>
            <Action onClick={() => navigate('#board')}>커뮤니티 게시판</Action>
            <Action onClick={() => requireUser(() => open('wallet'))}>포인트 지갑</Action>
          </div>
        </div>
        <div
          className={`[align-self:stretch] items-center
          min-w-0 m-[-24px_-30px_0_-18px] flex
          max-[650px]:m-[8px_-18px_0] [&_img]:aspect-[3/2] [&_img]:object-contain [&_img]:w-full [&_img]:h-auto
          [&_img]:block [&_img]:[mask-image:radial-gradient(#000_48%,#0000_74%)] community-worlds-art`}
        >
          <img
            src="/assets/community-worlds-soft.webp"
            alt="판타지, SF, 복셀 세계가 보라색 다리로 연결되고 게임 크리에이터들이 함께 모인 커뮤니티 광장"
            width="1536"
            height="1024"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div
          className={`text-[#aaa0b7] tracking-[1px] [border-color:#ffffff1a] [border-top-style:solid]
          [border-top-width:1px] col-[1/-1] justify-between gap-3 p-[19px_0] text-[9px] flex
          max-[650px]:tracking-[.4px]
          max-[650px]:p-[16px_0]
          max-[650px]:text-[7px] [&_i]:[background:#ad85f2] [&_i]:rounded-full [&_i]:w-1.5 [&_i]:h-1.5
          [&_i]:mr-2 [&_i]:inline-block
          max-[650px]:[&_span:last-child]:hidden welcome-bottom`}
        >
          <span>
            <i /> A NEW CHAPTER FOR CREATORS
          </span>
          <span>CREATE / SHARE / LEVEL UP</span>
        </div>
      </section>
      <section
        className={`bg-white rounded-[22px] shadow-[0_5px_24px_#3a215d03] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] shadow-[none] [background:0_0] [border-width:0]
          [border-style:none] [border-color:currentColor] mt-7 p-[6px_0]
          max-[650px]:p-[0] [&_h2]:m-[0] [&_h2]:text-[18px] [&_button]:[border-width:1px]
          [&_button]:[border-style:solid] [&_button]:[border-color:var(--color-line)] [&_button]:text-[#706581]
          [&_button]:text-left [&_button]:bg-white [&_button]:rounded-[13px] [&_button]:p-[17px_16px]
          [&_button]:text-[12px] [&_button]:shadow-[0_3px_10px_#3a215d03]
          max-[650px]:[&_button]:p-[14px_10px]
          max-[650px]:[&_button]:text-[11px] [&_button:before]:[content:"✦"] [&_button:before]:text-[#af98d0]
          [&_button:before]:mr-2.5 [&_button:hover]:text-[#7950b4] [&_button:hover]:[background:#f2f2f3]
          [&_button:hover]:[border-color:#d3c4e9] [&_button:hover]:[transform:translateY(-2px)] panel
          original-boards`}
      >
        <h2>커뮤니티에서 함께 나누세요</h2>
        <div
          className={`flex-wrap gap-2.5 flex
          [.original-boards_&]:grid-cols-[repeat(auto-fit,minmax(125px,1fr))]
          [.original-boards_&]:gap-2.5
          [.original-boards_&]:mt-4.5
          [.original-boards_&]:grid
          max-[650px]:[.original-boards_&]:grid-cols-[repeat(2,minmax(0,1fr))]
          [.original-welcome_&]:gap-2 actions`}
        >
          {categories
            .filter((c) => c !== '전체')
            .map((c) => (
              <Action key={c} primary onClick={() => navigate('#board/' + encodeURIComponent(c))}>
                {c}
              </Action>
            ))}
        </div>
      </section>
      <div
        className={`[&_h2]:m-[0_0_12px] [&_h2]:text-[17px] grid-cols-[1.35fr_1fr] gap-5.5 mt-6.5 grid
          max-[900px]:gap-4
          max-[650px]:grid-cols-[1fr] original-columns`}
      >
        <section
          className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] panel`}
        >
          <div
            className={`justify-between items-center gap-3 mb-[15px] flex [&_h2]:tracking-[-.6px] [&_h2]:m-[0]
          [&_h2]:text-[21px]
          max-[760px]:[&_h2]:text-[19px] [&_small]:text-muted [&_small]:text-[12px]
          [.project-workspaces_&]:items-center
          max-[760px]:[.project-workspaces_&]:flex-wrap
          max-[760px]:[.project-workspaces_&]:items-start
          [.original-columns_&_h2]:m-[0]
          [.original-columns_&_h2]:text-[17px]
          [.original-columns_&]:mb-5 sectionhead`}
          >
            <h2>최근 커뮤니티 글</h2>
            <a
              className={`text-[#8b7e9e] [background:0_0] [border-width:0] [border-style:none] [border-color:currentColor] p-1
          text-[12px] textlink`}
              href="#board"
            >
              더 보기 →
            </a>
          </div>
          {state.posts.slice(0, 3).map((p) => (
            <a
              className={`[border-top-width:1px] [border-top-style:solid] [border-top-color:var(--color-line)] p-[20px_0] block
          [&:hover_h3]:text-[#8b5ad1] [&_strong]:text-[#1a0f2a] [&_strong]:text-[11px] [&_h3]:m-[8px_0]
          [&_h3]:text-[15px] [&_p]:text-[#564c64] [&_p]:m-[4px_0] [&_p]:text-[12px] [&_p]:leading-[1.8]
          [&_small]:text-[#746788] [&_small]:text-[10px] original-post`}
              key={p.id}
              href={'#post/' + p.id}
            >
              <div
                className={`justify-between items-center gap-3 flex [&_>_strong]:[overflow-wrap:anywhere] [&_>_strong]:min-w-0
          recent-post-heading`}
              >
                <strong
                  className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
                >
                  {p.author}
                </strong>
                <span
                  className={`text-[#564c64] text-center [background:#eeedf0] rounded-[6px] shrink-0
          max-w-[65%] p-[4px_8px] text-[10px] font-[600] leading-[1.4] inline-block
          [.original-post:hover_&]:text-[#743ac8]
          [.original-post:hover_&]:[background:#efeef1] recent-post-category`}
                >
                  {p.category || '미분류'}
                </span>
              </div>
              <h3>{p.title}</h3>
              <p>
                {p.body.slice(0, 90)}
                {p.body.length > 90 ? '…' : ''}
              </p>
              <small>
                좋아요 {p.likes} · 댓글 {p.comments.reduce((n, c) => n + 1 + c.replies.length, 0)}
                　↗ 자세히 보기
              </small>
            </a>
          ))}
          {!state.posts.length && (
            <p
              className={`text-center text-muted p-[35px]
          [.original-columns_&]:text-[#9c93a9]
          [.original-columns_&]:[background:#fbfbfb]
          [.original-columns_&]:[border-width:1px]
          [.original-columns_&]:[border-style:dashed]
          [.original-columns_&]:[border-color:#e9e8eb]
          [.original-columns_&]:rounded-[13px]
          [.original-columns_&]:m-[0_0_18px]
          [.original-columns_&]:p-[42px_12px]
          [.original-columns_&]:text-[12px]
          [.original-columns_&]:leading-[1.9] empty`}
            >
              {user
                ? '아직 등록된 글이 없습니다. 첫 이야기를 남겨 보세요.'
                : '로그인하면 회원들의 게시글을 볼 수 있어요.'}
            </p>
          )}
          <Action primary onClick={() => requireUser(() => navigate('#write'))}>
            ＋ 글 작성
          </Action>
        </section>
        <section
          className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] panel`}
        >
          <div
            className={`justify-between items-center gap-3 mb-[15px] flex [&_h2]:tracking-[-.6px] [&_h2]:m-[0]
          [&_h2]:text-[21px]
          max-[760px]:[&_h2]:text-[19px] [&_small]:text-muted [&_small]:text-[12px]
          [.project-workspaces_&]:items-center
          max-[760px]:[.project-workspaces_&]:flex-wrap
          max-[760px]:[.project-workspaces_&]:items-start
          [.original-columns_&_h2]:m-[0]
          [.original-columns_&_h2]:text-[17px]
          [.original-columns_&]:mb-5 sectionhead`}
          >
            <h2>동료 찾기 · {state.members.length}명</h2>
          </div>
          {state.members.slice(0, 3).map((m) => (
            <button
              className={`[border-top-width:1px] [border-top-style:solid] [border-top-color:var(--color-line)] p-[16px_0]
          text-[13px] block [&_strong]:font-[500]
          [.original-member&]:text-left
          [.original-member&]:[border-width:0]
          [.original-member&]:[border-style:none]
          [.original-member&]:[border-color:currentColor]
          [.original-member&]:[border-top-width:1px]
          [.original-member&]:[border-top-style:solid]
          [.original-member&]:[border-top-color:var(--color-line)]
          [.original-member&]:[background:0_0]
          [.original-member&]:rounded-[0]
          [.original-member&]:items-center
          [.original-member&]:gap-3
          [.original-member&]:w-full
          [.original-member&]:p-[14px_0]
          [.original-member&]:font-[400]
          [.original-member&]:flex [&_small]:text-[#746788] [&_small]:text-[11px] [&_small]:block
          original-member member-summary`}
              key={m.id}
              onClick={() => open('member', { id: m.id })}
            >
              <Avatar user={m} />
              <span>
                <strong>{m.name}</strong>
                <small>{m.role}</small>
              </span>
              {m.status === '동료' && (
                <span
                  className={`text-[#743ac8] [background:#f6f6f7] [border-width:1px] [border-style:solid] [border-color:#efeef1]
          rounded-[5px] p-[3px_8px] text-[10px] font-[700] inline-block
          [.project-choice_&]:[align-self:flex-start]
          [.original-member_&]:ml-2
          [.public-name_&]:rounded-[20px]
          [.tag&]:text-[#381b61]
          [.tag&]:[background:#f4f4f5]
          [.tag&]:[border-color:#e5e4e7] tag green`}
                >
                  동료
                </span>
              )}
              <span className={'text-[#a49ab2] ml-auto profile-arrow'}>↗</span>
            </button>
          ))}
          {!state.members.length && (
            <p
              className={`text-center text-muted p-[35px]
          [.original-columns_&]:text-[#9c93a9]
          [.original-columns_&]:[background:#fbfbfb]
          [.original-columns_&]:[border-width:1px]
          [.original-columns_&]:[border-style:dashed]
          [.original-columns_&]:[border-color:#e9e8eb]
          [.original-columns_&]:rounded-[13px]
          [.original-columns_&]:m-[0_0_18px]
          [.original-columns_&]:p-[42px_12px]
          [.original-columns_&]:text-[12px]
          [.original-columns_&]:leading-[1.9] empty`}
            >
              아직 공개된 크리에이터가 없습니다.
            </p>
          )}
        </section>
      </div>
      <section
        className={`bg-white rounded-[22px] shadow-[0_5px_24px_#3a215d03] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] [background:#eeecf0] [border-width:1px]
          [border-style:solid] [border-color:#e1dde5] items-center gap-6 mt-6 p-[26px_30px] flex
          max-[900px]:gap-4
          max-[650px]:flex-wrap
          max-[650px]:gap-3.5
          max-[650px]:p-[23px] [&_h2]:m-[0_0_6px] [&_h2]:text-[15px]
          max-[650px]:[&_h2]:text-[13px]
          max-[650px]:[&_h2]:leading-[1.6] panel original-programs`}
      >
        <div
          className={`text-[#8764b2] [background:#dfd8e8] rounded-[16px] shrink-0 [place-items:center] w-14.5 h-14.5
          text-[40px] grid
          max-[650px]:w-10.5
          max-[650px]:h-10.5
          max-[650px]:text-[30px] program-symbol`}
          aria-hidden="true"
        >
          &#10035;
        </div>
        <div className={'flex-1 max-[650px]:[flex:calc(100%_-_60px)] program-copy'}>
          <p
            className={
              'tracking-[1.5px] text-[#a49ab3] m-[0_0_8px] text-[9px] font-[700] section-kicker'
            }
          >
            YOUR NEXT OPPORTUNITY
          </p>
          <h2>주식회사 공감오래콘텐츠의 공식 행사·기회</h2>
          <p
            className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
          >
            게임잼·교육·창작 프로그램 등 새로운 도전을 확인하세요.
          </p>
        </div>
        <Action primary onClick={() => open('programs')}>
          공식 기회 확인
        </Action>
      </section>
    </>
  );
}
