import { useState } from 'react';
import { useHub } from '../HubContext';
import { Modal } from './UI';
import CareerDialog from './Career';
import EventsDialog from './EventNews';
export default function ActivityDialog({ kind, initialView, initialEventId, onClose }) {
  const { state, open } = useHub();
  const [filter, setFilter] = useState('all');
  const [benefit, setBenefit] = useState(initialView === 'cash' ? 'cash' : 'shop');
  if (kind === 'career') return <CareerDialog onClose={onClose} />;
  if (kind === 'programs')
    return (
      <EventsDialog onClose={onClose} initialView={initialView} initialEventId={initialEventId} />
    );
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
            <p className="m-0 text-sm text-white/75">창작 활동으로 모은 포인트를 다양한 혜택으로</p>
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
        <section
          aria-label="포인트 사용"
          className="mt-5 rounded-2xl border border-solid border-line p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="m-0 text-base">포인트 사용하기</h3>
            <span className="rounded-full bg-brand/10 px-2 py-1 text-xs text-brand">
              서비스 준비 중
            </span>
          </div>
          <div className="my-4 grid grid-cols-2 gap-2" role="group" aria-label="포인트 사용 방식">
            {[
              ['shop', '상품 구매'],
              ['cash', '현금 전환'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={benefit === value}
                onClick={() => setBenefit(value)}
                className={`rounded-xl border border-solid px-3 py-2 text-sm ${benefit === value ? 'border-brand/30 bg-brand/10 text-brand' : 'border-line bg-white text-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {benefit === 'shop' ? (
            <div>
              <p className="mb-3 mt-0 text-sm text-muted">
                포인트로 만나볼 혜택을 미리 살펴보세요.
              </p>
              <div className="grid grid-cols-3 gap-3 max-[560px]:grid-cols-1">
                {[
                  ['✦', '창작 리소스', '개발에 필요한 디지털 에셋'],
                  ['▤', '교육 이용권', '새로운 기술을 배우는 기회'],
                  ['◇', '크리에이터 굿즈', '창작자를 위한 작은 선물'],
                ].map(([icon, title, description]) => (
                  <div key={title} className="rounded-xl bg-canvas p-3">
                    <span
                      aria-hidden="true"
                      className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-xl text-brand"
                    >
                      {icon}
                    </span>
                    <strong className="block text-sm">{title}</strong>
                    <p className="my-2 text-xs leading-relaxed text-muted">{description}</p>
                    <span className="text-xs text-brand">예시 상품 · 오픈 예정</span>
                  </div>
                ))}
              </div>
              <p className="mb-0 mt-3 text-xs leading-relaxed text-muted">
                상품과 필요 포인트는 추후 안내됩니다. 현재는 구매할 수 없습니다.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-canvas p-4">
              <strong className="text-sm">포인트를 현금으로 전환</strong>
              <p className="mb-4 mt-2 text-sm leading-relaxed text-muted">
                적립한 포인트의 현금 전환을 준비하고 있어요.
              </p>
              <dl className="m-0 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">보유 포인트</dt>
                  <dd className="m-0 font-semibold">
                    {state.pointHistory.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}{' '}
                    P
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">전환 비율 · 최소 포인트</dt>
                  <dd className="m-0 text-muted">추후 안내</dd>
                </div>
              </dl>
              <button
                type="button"
                disabled
                className="mt-4 w-full rounded-xl border-0 bg-brand/10 px-4 py-3 text-sm text-brand"
              >
                현금 전환 준비 중
              </button>
              <p className="mb-0 mt-3 text-xs leading-relaxed text-muted">
                전환 조건과 신청 절차는 서비스 오픈 시 안내됩니다.
              </p>
            </div>
          )}
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
