import { useState } from 'react';
import { useHub } from '../HubContext';
import { Modal } from './UI';
import CareerDialog from './CareerDialog';
import EventsDialog from './EventsDialog';
export default function ActivityDialog({ kind, onClose }) {
  const { state, open } = useHub();
  const [filter, setFilter] = useState('all');
  if (kind === 'career') return <CareerDialog onClose={onClose} />;
  if (kind === 'programs') return <EventsDialog onClose={onClose} />;
  if (kind === 'wallet') {
    const rows = state.pointHistory.filter(
      (r) => filter === 'all' || (filter === 'earned' ? r.amount > 0 : r.amount < 0),
    );
    return (
      <Modal title="포인트 지갑" kind={'[dialog&]:max-w-[680px] activity-dialog'} onClose={onClose}>
        <section className="mt-5 flex items-center justify-between gap-6 rounded-2xl bg-[linear-gradient(115deg,#55308b,#8b5ad1)] p-6 text-white max-[560px]:flex-col max-[560px]:items-stretch">
          <div className="min-w-0">
            <p className="m-0 text-base text-white/80">사용 가능 포인트</p>
            <strong className="my-2 block text-[38px] leading-tight">
              {state.pointHistory.reduce((n, r) => n + r.amount, 0).toLocaleString()}{' '}
              <span className="text-xl">P</span>
            </strong>
            <p className="m-0 text-sm text-white/75">포인트 지급 API는 별도 연결이 필요합니다.</p>
          </div>
          <div className="shrink-0 text-right max-[560px]:text-left">
            <p className="mb-3 mt-0 text-sm text-white/85">새로운 기회에 도전해 보세요.</p>
            <button
              type="button"
              onClick={() => open('programs')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-solid border-white/25 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/25 hover:text-white max-[560px]:w-full"
            >
              회사 기회 확인 <span aria-hidden="true">↗</span>
            </button>
          </div>
        </section>
        <div className="mb-4 mt-5 flex flex-wrap gap-2" aria-label="포인트 내역 필터">
          {[
            ['all', '전체'],
            ['earned', '적립'],
            ['used', '사용'],
          ].map(([key, label]) => (
            <button
              type="button"
              key={key}
              aria-pressed={key === filter}
              className={
                `rounded-full border border-solid px-4 py-2 text-sm font-semibold transition-colors ` +
                (key === filter
                  ? 'border-brand/20 bg-brand/10 text-brand'
                  : 'border-line bg-white text-muted hover:border-brand/30 hover:text-brand')
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
          max-[600px]:gap-2.5 [&_strong]:text-[16px] [&_small]:text-[#a49ab2] [&_small]:mt-1
          [&_small]:text-[12px] [&_small]:block [&_p]:text-[#746788] [&_p]:m-[6px_0] [&_p]:text-[14px]
          [&_>_b]:whitespace-nowrap [&_>_b]:text-[16px]
          max-[600px]:[&_>_b]:text-[16px] ledger-row`}
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
          [.original-columns_&]:text-[16px]
          [.original-columns_&]:leading-[1.9] empty`}
          >
            아직 포인트 내역이 없습니다.
          </p>
        )}
      </Modal>
    );
  }
  return (
    <Modal title={kind === 'bounties' ? 'QA·번역 품앗이' : '공식 행사·교육'} onClose={onClose}>
      <p>
        {kind === 'bounties'
          ? 'QA·번역 도움이 필요한 동료와 작업을 나누는 공간입니다.'
          : '게임잼, 창작 교육, 공식 기회를 만나는 공간입니다.'}
      </p>
      <p
        className={`text-muted text-[16px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[16px] muted`}
      >
        아직 등록된 항목이 없습니다. 실제 운영 API는 별도 연결이 필요합니다.
      </p>
    </Modal>
  );
}
