import { useState } from 'react';
import { useHub } from '../HubContext';
import { Modal, ErrorText } from './UI';
import { safeUrl } from '../api';
export default function ActivityDialog({ kind, onClose }) {
  const { state, savePrivate } = useHub(),
    [filter, setFilter] = useState('all'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function saveCareer(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const item = {
        id: Date.now(),
        title: String(f.get('title')).trim(),
        role: String(f.get('role')).trim(),
        contribution: String(f.get('contribution')).trim(),
        link: f.get('link') ? safeUrl(String(f.get('link'))) : '',
      };
      await savePrivate({ career: [item, ...state.career] });
      e.target.reset();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (kind === 'wallet') {
    const rows = state.pointHistory.filter(
      (r) => filter === 'all' || (filter === 'earned' ? r.amount > 0 : r.amount < 0),
    );
    return (
      <Modal title="포인트 지갑" kind={'[dialog&]:max-w-[680px] activity-dialog'} onClose={onClose}>
        <section
          className={`text-white [background:linear-gradient(115deg,#55308b,#8b5ad1)] rounded-[17px] mt-5 p-[25px]
          [&_>_span]:text-[#e2e1e4] [&_>_span]:text-[12px] [&_strong]:m-[8px_0] [&_strong]:text-[38px]
          [&_strong]:leading-[1.3] [&_strong]:block [&_small]:text-[20px] [&_p]:text-[#e2e1e4] [&_p]:m-[0]
          [&_p]:text-[11px] wallet-summary`}
        >
          <span>사용 가능 포인트</span>
          <strong>
            {state.pointHistory.reduce((n, r) => n + r.amount, 0).toLocaleString()} <small>P</small>
          </strong>
          <p>포인트 지급 API는 별도 연결이 필요합니다.</p>
        </section>
        <div
          className={`flex-wrap gap-[7px] flex [&_button]:bg-white [&_button]:rounded-[20px] m-[0] [&_button]:p-[5px_11px]
          [&_button]:text-[11px] tabs wallet-tabs`}
        >
          {[
            ['all', '전체'],
            ['earned', '적립'],
            ['used', '사용'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={
                key === filter
                  ? `[nav_a&]:text-white [nav_a&]:[background:linear-gradient(135deg,#8b5ad1,#743ac8)]
          [nav_a&]:shadow-[0_4px_14px_#8b5ad135]
          [.tabs_button&]:text-[#743ac8]
          [.tabs_button&]:[background:#f6f6f7]
          [.tabs_button&]:[border-color:#e2e1e4] [header_nav_a&]:[background:#29252f]
          [header_nav_a&]:shadow-[0_4px_12px_#25232918] active`
                  : ''
              }
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {rows.map((r, i) => (
          <div
            className={`[border-top-width:1px] [border-top-style:solid] [border-top-color:var(--color-line)] justify-between
          gap-[15px] p-[20px_0] flex
          max-[600px]:gap-2.5 [&_strong]:text-[13px] [&_small]:text-[#a49ab2] [&_small]:mt-1
          [&_small]:text-[10px] [&_small]:block [&_p]:text-[#746788] [&_p]:m-[6px_0] [&_p]:text-[11px]
          [&_>_b]:whitespace-nowrap [&_>_b]:text-[16px]
          max-[600px]:[&_>_b]:text-[14px] ledger-row`}
            key={r.id || i}
          >
            <div>
              <strong>{r.title}</strong>
              <p>{r.reason}</p>
              <small>{r.source}</small>
            </div>
            <b>{r.amount.toLocaleString()}P</b>
          </div>
        ))}
        {!rows.length && (
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
            아직 포인트 내역이 없습니다.
          </p>
        )}
      </Modal>
    );
  }
  if (kind === 'career')
    return (
      <Modal title="내 커리어" kind={'[dialog&]:max-w-[680px] activity-dialog'} onClose={onClose}>
        <p
          className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
        >
          경력·작품 기록을 관리하세요.
        </p>
        <details>
          <summary>＋ 경력·작품 등록</summary>
          <form onSubmit={saveCareer}>
            <label>
              작품·경력 제목
              <input name="title" required maxLength={150} />
            </label>
            <label>
              담당 역할
              <input name="role" required maxLength={100} />
            </label>
            <label>
              기여 내용
              <textarea name="contribution" maxLength={2000} rows={3} />
            </label>
            <label>
              작품 HTTPS 링크 (선택)
              <input name="link" type="url" placeholder="https://" />
            </label>
            <ErrorText message={error} />
            <button
              className={`bg-brand text-white [border-color:var(--color-brand)] shadow-[0_4px_12px_#8b5ad11c] hover:text-white
          hover:[background:#7942c7]
          [.original-columns_&]:text-[#8463b4]
          [.original-columns_&]:[background:#f3f3f4]
          [.original-columns_&]:[border-color:#ebeaec]
          [.original-columns_&]:rounded-[12px]
          [.original-columns_&]:p-[9px_15px]
          [.original-columns_&]:text-[11px]
          [.original-programs_&]:rounded-[12px]
          [.original-programs_&]:text-[12px]
          [.team-welcome_&]:rounded-[12px]
          [.team-welcome_&]:p-[10px_15px]
          [.team-welcome_&]:text-[12px]
          [.public-profile-actions_&]:flex-1
          [.original-welcome_button&]:text-white
          [.original-welcome_button&]:bg-brand
          [.original-welcome_button&]:[border-color:#0000]
          [.original-welcome_button&]:shadow-[0_5px_12px_#9467d420]
          [.original-welcome_button&:hover]:text-white
          [.original-welcome_button&:hover]:[background:#6e43c5]
          [.original-programs_>_&]:text-[#77698b]
          [.original-programs_>_&]:whitespace-nowrap
          [.original-programs_>_&]:bg-white
          [.original-programs_>_&]:[border-width:1px]
          [.original-programs_>_&]:[border-style:solid]
          [.original-programs_>_&]:[border-color:#dad1e7]
          [.original-programs_>_&]:p-[11px_17px]
          max-[650px]:[.original-programs_>_&]:w-full primary`}
              disabled={busy}
            >
              경력 저장
            </button>
          </form>
        </details>
        {state.career.map((c) => (
          <article
            className={`[border-top-width:1px] [border-top-style:solid] [border-top-color:var(--color-line)] p-[20px_0] block
          [&:hover_h3]:text-[#8b5ad1] [&_strong]:text-[#1a0f2a] [&_strong]:text-[11px] [&_h3]:m-[8px_0]
          [&_h3]:text-[15px] [&_p]:text-[#564c64] [&_p]:m-[4px_0] [&_p]:text-[12px] [&_p]:leading-[1.8]
          [&_small]:text-[#746788] [&_small]:text-[10px] original-post`}
            key={c.id}
          >
            <span
              className={`text-[#743ac8] [background:#f6f6f7] [border-width:1px] [border-style:solid] [border-color:#efeef1]
          rounded-[5px] p-[3px_8px] text-[10px] font-[700] inline-block
          [.project-choice_&]:[align-self:flex-start]
          [.original-member_&]:ml-2
          [.public-name_&]:rounded-[20px] tag`}
            >
              본인 작성
            </span>
            <h3>{c.title}</h3>
            <p>{c.role}</p>
            <p className="whitespace-pre-wrap">{c.contribution}</p>
            {c.link && (
              <a
                className={`text-[#8b7e9e] [background:0_0] [border-width:0] [border-style:none] [border-color:currentColor] p-1
          text-[12px] textlink`}
                href={c.link}
                target="_blank"
                rel="noreferrer"
              >
                작품 보기 ↗
              </a>
            )}
          </article>
        ))}
        {!state.career.length && (
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
            첫 작품과 참여 경험을 기록해 보세요.
          </p>
        )}
      </Modal>
    );
  return (
    <Modal title={kind === 'bounties' ? 'QA·번역 품앗이' : '공식 행사·교육'} onClose={onClose}>
      <p>
        {kind === 'bounties'
          ? 'QA·번역 도움이 필요한 동료와 작업을 나누는 공간입니다.'
          : '게임잼, 창작 교육, 공식 기회를 만나는 공간입니다.'}
      </p>
      <p
        className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
      >
        아직 등록된 항목이 없습니다. 실제 운영 API는 별도 연결이 필요합니다.
      </p>
    </Modal>
  );
}
