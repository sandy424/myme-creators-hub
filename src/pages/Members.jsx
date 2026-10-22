import { useState } from 'react';
import { useHub } from '../HubContext';
import { Avatar, Action } from '../components/UI';
export default function Members() {
  const { state, open, connect } = useHub(),
    [filter, setFilter] = useState('전체'),
    [query, setQuery] = useState('');
  const members = state.members.filter(
    (m) =>
      (filter === '전체' || m.status === (filter === '내 동료' ? '동료' : '요청 중')) &&
      (m.name + m.role + m.country).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <p
        className={`tracking-[1.6px] text-[#8665b5] text-[14px] font-[600]
          [.original-welcome_&]:text-[#bbb2c9]
          [.original-welcome_&]:tracking-[1.7px]
          [.original-welcome_&]:m-[0_0_20px]
          [.original-welcome_&]:text-[12px]
          max-[650px]:[.original-welcome_&]:tracking-[1px]
          max-[650px]:[.original-welcome_&]:text-[12px] eyebrow`}
      >
        FIND YOUR PEOPLE
      </p>
      <h1
        className={'tracking-[-1px] m-[15px_0_6px] text-[31px] max-[760px]:text-[27px] page-title'}
      >
        다음 게임을 함께 만들 동료
      </h1>
      <p className={'text-muted mt-[0] text-[16px] intro'}>
        프로필 공개를 선택한 크리에이터를 만나 보세요.
      </p>
      {state.members.some((m) => m.incoming) && (
        <section
          className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[16px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] panel`}
        >
          <h3>받은 동료 요청</h3>
          {state.members
            .filter((m) => m.incoming)
            .map((m) => (
              <div
                className={`justify-between items-center gap-3 mb-[15px] flex [&_h2]:tracking-[-.6px] [&_h2]:m-[0]
          [&_h2]:text-[21px]
          max-[760px]:[&_h2]:text-[19px] [&_small]:text-muted [&_small]:text-[16px]
          [.project-workspaces_&]:items-center
          max-[760px]:[.project-workspaces_&]:flex-wrap
          max-[760px]:[.project-workspaces_&]:items-start
          [.original-columns_&_h2]:m-[0]
          [.original-columns_&_h2]:text-[20px]
          [.original-columns_&]:mb-5 sectionhead`}
                key={m.id}
              >
                <strong>{m.name}</strong>
                <Action primary onClick={() => connect(m)}>
                  수락
                </Action>
              </div>
            ))}
        </section>
      )}
      <div
        className={
          'justify-between items-center gap-[10px] m-[25px_0] flex max-[760px]:flex-wrap toolbar'
        }
      >
        <div
          className={`flex-wrap gap-[7px] m-[18px_0] flex [&_button]:bg-white [&_button]:rounded-[20px]
          [&_button]:p-[7px_15px] [&_button]:text-[16px] tabs`}
        >
          {['전체', '내 동료', '요청 중'].map((f) => (
            <button
              key={f}
              className={
                filter === f
                  ? `[nav_a&]:text-white [nav_a&]:[background:linear-gradient(135deg,#8b5ad1,#743ac8)]
          [nav_a&]:shadow-[0_4px_14px_#8b5ad135]
          [.tabs_button&]:text-[#743ac8]
          [.tabs_button&]:[background:#f6f6f7]
          [.tabs_button&]:[border-color:#e2e1e4] [header_nav_a&]:[background:#29252f]
          [header_nav_a&]:shadow-[0_4px_12px_#25232918] active`
                  : ''
              }
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div
          className={`relative
          max-[760px]:w-full
          max-[650px]:min-w-0 [&_input]:min-w-67.5
          max-[760px]:[&_input]:min-w-0
          max-[650px]:[&_input]:w-full search`}
        >
          <input
            placeholder="이름·분야·국가 검색"
            aria-label="동료 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div
        className={`grid-cols-[repeat(3,1fr)] gap-4.5 grid
          max-[1000px]:grid-cols-[repeat(2,1fr)]
          max-[760px]:grid-cols-[1fr] cardgrid`}
      >
        {members.map((m) => (
          <article
            className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:text-[16px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] text-center [&_h3]:m-2 [&_p]:text-muted [&_p]:text-[16px]
          [&_button]:mt-4 [&_button]:text-[16px] panel membercard`}
            key={m.id}
          >
            <button
              className={`text-center [background:0_0] [border-width:0] [border-style:none] [border-color:currentColor]
          rounded-[12px] w-full p-[0] block hover:text-[inherit] member-profile-open`}
              onClick={() => open('member', { id: m.id })}
            >
              <Avatar user={m} />
              <span
                className={
                  `text-[#743ac8] [background:#f6f6f7] [border-width:1px] [border-style:solid] [border-color:#efeef1]
          rounded-[5px] p-[3px_8px] text-[12px] font-[700] inline-block
          [.project-choice_&]:[align-self:flex-start]
          [.original-member_&]:ml-2
          [.public-name_&]:rounded-[20px] tag ` +
                  (m.status === '동료'
                    ? '[.tag&]:text-[#381b61] [.tag&]:[background:#f4f4f5] [.tag&]:[border-color:#e5e4e7] green'
                    : '')
                }
              >
                {m.status || '크리에이터'}
              </span>
              <h3>{m.name}</h3>
              <p>
                {m.role}
                {m.country && (
                  <>
                    <br />
                    {m.country}
                  </>
                )}
              </p>
              <span className={'text-[#a17ada] text-[12px] profile-open-label'}>프로필 보기 ↗</span>
            </button>
            <div
              className={`flex-col gap-2 mt-[15px] flex
          [.membercard_&_button]:m-[0] [&_button]:text-[16px] member-card-actions`}
            >
              <Action primary onClick={() => open('chat', { id: m.id })}>
                메시지 보내기
              </Action>
              {m.status === '동료' ? (
                <span
                  className={`text-muted text-[16px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[16px] muted`}
                >
                  ✓ 연결된 동료
                </span>
              ) : (
                <Action onClick={() => connect(m)}>
                  {m.incoming
                    ? '요청 수락'
                    : m.status === '요청 중'
                      ? '요청 중 · 취소'
                      : '＋ 동료 요청'}
                </Action>
              )}
            </div>
          </article>
        ))}
      </div>
      {!members.length && (
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
          해당하는 동료가 없습니다. 다른 계정에서 프로필 공개를 켜면 표시됩니다.
        </div>
      )}
    </>
  );
}
