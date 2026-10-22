import { useEffect, useRef, useState } from 'react';
import { createExampleSchedules, dateKey, filterSchedules, recruitmentStatus } from '../schedules';

const control =
  'rounded-xl border border-solid border-line bg-white px-3 py-2 text-sm text-muted hover:bg-brand/5 hover:text-brand';
const monthLabel = (date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
const statusColors = {
  '모집 예정': 'bg-gray-100 text-gray-500',
  '모집 중': 'bg-emerald-50 text-emerald-700',
  '마감 임박': 'bg-orange-50 text-orange-700',
  마감: 'bg-gray-100 text-gray-500',
};

function Poster({ event }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex aspect-[3/4] w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f1edf7]">
      {event.poster && !failed ? (
        <img
          src={event.poster}
          alt={`${event.title} 포스터`}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="px-2 text-center text-xs leading-relaxed text-muted">
          포스터
          <br />
          준비 중
        </span>
      )}
    </span>
  );
}

function Badges({ event, today }) {
  const status = recruitmentStatus(event, today);
  return (
    <>
      <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
        {event.type}
      </span>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[status]}`}>
        {status}
      </span>
    </>
  );
}

export default function EventsDialog({ onClose, schedules }) {
  const [today] = useState(() => dateKey(new Date()));
  const [examples] = useState(() => createExampleSchedules());
  const events = schedules ?? examples;
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selected, setSelected] = useState(null);
  const [type, setType] = useState('전체');
  const [recruiting, setRecruiting] = useState(false);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const dialog = useRef(null);
  const detailHeading = useRef(null);
  const lastCard = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const node = dialog.current;
    node.showModal();
    return () => {
      node.close();
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    if (detail) detailHeading.current?.focus();
    else
      Array.from(dialog.current.querySelectorAll('[data-event-id]'))
        .find((node) => node.dataset.eventId === lastCard.current)
        ?.focus();
  }, [detail]);
  const y = month.getFullYear(),
    m = month.getMonth();
  const start = dateKey(month),
    end = dateKey(new Date(y, m + 1, 0));
  const monthly = filterSchedules(events, { start, end, type, recruiting, today });
  const rows = selected
    ? monthly.filter((event) => event.startDate <= selected && event.endDate >= selected)
    : monthly;
  const pages = Math.max(1, Math.ceil(rows.length / 4));
  const activePage = Math.min(page, pages);
  const cells = Array.from(
    { length: Math.ceil((month.getDay() + new Date(y, m + 1, 0).getDate()) / 7) * 7 },
    (_, i) => new Date(y, m, i - month.getDay() + 1),
  );
  function changeMonth(offset) {
    setMonth(new Date(y, m + offset, 1));
    setSelected(null);
    setPage(1);
  }
  function clearDate() {
    setSelected(null);
    setPage(1);
  }
  return (
    <dialog
      ref={dialog}
      aria-labelledby="events-title"
      aria-describedby="events-description"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const targets = Array.from(
          event.currentTarget.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]'),
        ).filter((node) => node.getClientRects().length);
        const first = targets[0],
          last = targets.at(-1);
        if (
          event.shiftKey &&
          (document.activeElement === first || !targets.includes(document.activeElement))
        ) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || !targets.includes(document.activeElement))
        ) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="w-[calc(100%_-_32px)] max-w-[1160px] max-h-[92dvh] overflow-y-auto rounded-[24px] border-0 bg-white p-0 text-[#21172f] shadow-[0_24px_100px_#26173c55] [&::backdrop]:bg-[#26173c66] [&::backdrop]:backdrop-blur-sm"
    >
      <div className="relative p-8 max-[600px]:p-5">
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="공식 행사·교육 닫기"
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border-0 bg-canvas p-0 text-2xl text-muted hover:bg-brand/10 hover:text-brand"
        >
          ×
        </button>
        <header className="mb-8 pr-10">
          <h2 id="events-title" className="m-0 text-[28px] font-bold max-[600px]:text-2xl">
            공식 행사·교육
          </h2>
          <p id="events-description" className="mb-0 mt-2 text-base text-muted">
            게임잼부터 창작 교육까지, 새로운 기회를 만나보세요.
          </p>
        </header>
        {detail ? (
          <section aria-labelledby="event-detail-title">
            <button type="button" className={control} onClick={() => setDetail(null)}>
              ← 일정 목록으로
            </button>
            <div className="mt-6 flex items-start gap-5">
              <Poster key={detail.id} event={detail} />
              <div className="min-w-0">
                <h3
                  ref={detailHeading}
                  tabIndex={-1}
                  id="event-detail-title"
                  className="mb-3 mt-0 text-2xl"
                >
                  {detail.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badges event={detail} today={today} />
                </div>
                <p className="mb-1 text-muted">
                  {detail.startDate} {detail.endDate !== detail.startDate && `– ${detail.endDate}`}
                </p>
                <p className="my-1 text-muted">{detail.time}</p>
                <p className="my-1 text-muted">{detail.location}</p>
              </div>
            </div>
            <p className="my-6 whitespace-pre-line leading-relaxed">{detail.description}</p>
            <p className="text-sm text-muted">
              모집 기간: {detail.recruitmentStart} – {detail.recruitmentEnd}
            </p>
            {!schedules && (
              <p className="rounded-xl bg-brand/5 p-4 text-sm text-muted">
                예시 일정입니다. 신청 링크도 예시이며 실제 접수는 진행되지 않습니다.
              </p>
            )}
            {detail.applicationUrl && /^https:\/\//i.test(detail.applicationUrl) && (
              <a
                className="mt-3 inline-flex rounded-xl bg-brand px-5 py-3 font-semibold text-white no-underline hover:bg-[#743ac8]"
                href={detail.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {schedules ? '신청 페이지 열기' : '예시 신청 링크 확인'} ↗
              </a>
            )}
          </section>
        ) : (
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-8 max-[800px]:grid-cols-1">
            <section aria-label="행사·교육 목록" className="min-w-0 max-[800px]:order-2">
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="m-0 text-2xl">
                  {monthLabel(month)}
                  {selected && ` ${Number(selected.slice(-2))}일`}
                </h3>
                <span className="text-sm text-muted" role="status">
                  총 {rows.length}개{!schedules && ' · 예시 일정'}
                </span>
              </div>
              <div className="my-4 flex flex-wrap items-center gap-2">
                <div className="flex gap-2" role="group" aria-label="일정 유형">
                  {['전체', '행사', '교육'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={type === value}
                      onClick={() => {
                        setType(value);
                        setPage(1);
                      }}
                      className={`rounded-full border-0 px-5 py-2 text-sm font-semibold ${type === value ? 'bg-brand text-white hover:bg-[#743ac8] hover:text-white' : 'bg-brand/5 text-muted hover:bg-brand/10 hover:text-brand'}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={recruiting}
                  onClick={() => {
                    setRecruiting(!recruiting);
                    setPage(1);
                  }}
                  className={`ml-1 flex items-center gap-2 rounded-full border border-solid px-3 py-2 text-sm ${recruiting ? 'border-brand bg-brand/10 text-brand' : 'border-line bg-white text-muted'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-7 items-center rounded-full p-0.5 ${recruiting ? 'bg-brand' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full bg-white transition-transform ${recruiting ? 'translate-x-3' : ''}`}
                    />
                  </span>
                  모집 중
                </button>
              </div>
              <div className="flex flex-col gap-3" aria-live="polite">
                {rows.slice((activePage - 1) * 4, activePage * 4).map((event) => (
                  <button
                    key={event.id}
                    data-event-id={event.id}
                    type="button"
                    onClick={(e) => {
                      lastCard.current = event.id;
                      setDetail(event);
                    }}
                    className="flex w-full items-center gap-4 rounded-xl border border-solid border-line bg-white p-3 text-left text-inherit transition-colors hover:border-brand/40 hover:bg-brand/[0.02] max-[450px]:gap-3"
                  >
                    <Poster event={event} />
                    <span className="min-w-0 flex-1">
                      <strong className="block text-lg leading-snug max-[450px]:text-base">
                        {event.title}
                      </strong>
                      <span className="my-2 flex flex-wrap gap-1.5">
                        <Badges event={event} today={today} />
                      </span>
                      <span className="block text-sm leading-relaxed text-muted">
                        {event.startDate.slice(5).replace('-', '.')}{' '}
                        {event.endDate !== event.startDate &&
                          `– ${event.endDate.slice(5).replace('-', '.')}`}
                        <br />
                        {event.time}
                      </span>
                      <span className="mt-1 block text-sm text-muted">{event.location}</span>
                    </span>
                    <span aria-hidden="true" className="text-xl text-muted max-[450px]:hidden">
                      ›
                    </span>
                  </button>
                ))}
                {!rows.length && (
                  <p className="rounded-xl bg-canvas px-4 py-12 text-center text-muted">
                    해당 조건에 맞는 일정이 없습니다.
                  </p>
                )}
              </div>
              <nav aria-label="일정 페이지" className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  className={control}
                  disabled={activePage === 1}
                  onClick={() => setPage(activePage - 1)}
                  aria-label="이전 페이지"
                >
                  ‹
                </button>
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    type="button"
                    key={i}
                    aria-current={activePage === i + 1 ? 'page' : undefined}
                    className={`${control} ${activePage === i + 1 ? 'border-brand! bg-brand! text-white!' : ''}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  className={control}
                  disabled={activePage === pages}
                  onClick={() => setPage(activePage + 1)}
                  aria-label="다음 페이지"
                >
                  ›
                </button>
              </nav>
            </section>
            <section
              aria-label="월별 달력"
              className="min-w-0 border-0 border-l border-solid border-line pl-7 max-[800px]:order-1 max-[800px]:border-l-0 max-[800px]:border-b max-[800px]:pb-6 max-[800px]:pl-0"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="m-0 text-xl">월별 일정</h3>
                <button
                  type="button"
                  className={control}
                  onClick={() => {
                    const now = new Date();
                    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                    clearDate();
                  }}
                >
                  이번 달
                </button>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  className={control}
                  aria-label="이전 달"
                  onClick={() => changeMonth(-1)}
                >
                  ‹
                </button>
                <strong
                  className="flex-1 rounded-xl bg-brand/5 py-2 text-center"
                  aria-live="polite"
                >
                  {monthLabel(month)}
                </strong>
                <button
                  type="button"
                  className={control}
                  aria-label="다음 달"
                  onClick={() => changeMonth(1)}
                >
                  ›
                </button>
              </div>
              <div className="grid grid-cols-7 border-0 border-b border-solid border-line pb-2 text-center text-sm">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                  <span
                    key={day}
                    className={`py-2 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-brand' : ''}`}
                  >
                    {day}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1 py-2">
                {cells.map((date) => {
                  const key = dateKey(date),
                    inMonth = date.getMonth() === m,
                    hasEvents = monthly.some(
                      (event) => event.startDate <= key && event.endDate >= key,
                    );
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!inMonth}
                      aria-label={`${key}${hasEvents ? ' 일정 있음' : ''}`}
                      aria-pressed={selected === key}
                      aria-current={key === today ? 'date' : undefined}
                      onClick={() => {
                        setSelected(key);
                        setPage(1);
                      }}
                      className={`relative flex h-12 flex-col items-center justify-center rounded-xl border-0 p-0 text-base ${selected === key ? 'bg-brand text-white hover:bg-[#743ac8] hover:text-white' : !inMonth ? 'bg-transparent text-gray-300' : key === today ? 'bg-brand/10 font-bold text-brand hover:bg-brand/20' : 'bg-transparent text-inherit hover:bg-brand/5 hover:text-brand'}`}
                    >
                      <span>{date.getDate()}</span>
                      <span
                        aria-hidden="true"
                        className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${hasEvents && inMonth ? (selected === key ? 'bg-white' : 'bg-brand') : 'bg-transparent'}`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="mb-6 mt-2 flex items-center gap-2 text-sm text-muted">
                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                행사·교육이 있는 날
              </p>
              <div className="rounded-xl bg-brand/5 p-5">
                <strong>
                  {selected ? `${Number(selected.slice(-2))}일의 일정` : '날짜를 선택하면'}
                </strong>
                <p className="mb-0 mt-2 text-sm leading-relaxed text-muted">
                  {selected
                    ? '선택한 날짜의 일정을 목록에서 확인하세요.'
                    : '해당 날짜의 일정을 확인할 수 있어요.'}
                </p>
              </div>
              <div className="mt-4 text-right">
                <button
                  type="button"
                  className="border-0 bg-transparent p-2 text-sm text-brand hover:underline"
                  onClick={clearDate}
                >
                  월 전체 보기
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </dialog>
  );
}
