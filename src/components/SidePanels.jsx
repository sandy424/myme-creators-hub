import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useHub } from '../HubContext';
import { createExampleSchedules } from '../schedules';

export function NewsRail() {
  const { open } = useHub();
  const [events] = useState(createExampleSchedules);
  const [api, setApi] = useState(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!api) return;
    const update = () => setIndex(api.selectedScrollSnap());
    update();
    api.on('select', update).on('reInit', update);
    return () => {
      api.off('select', update).off('reInit', update);
    };
  }, [api]);
  return (
    <aside aria-label="행사 소식 배너" className="hidden min-w-0 self-start min-[1200px]:block">
      <Carousel
        setApi={setApi}
        opts={{ align: 'start', loop: true }}
        aria-label="새로운 행사·기회"
        className="flex h-[520px] w-full flex-col overflow-hidden rounded-[24px] bg-gradient-to-b from-[#9264e4] to-[#7548c8] text-white shadow-[0_8px_24px_#8055d910]"
      >
        <div className="shrink-0 px-4 pb-3 pt-5">
          <p className="m-0 text-xs font-semibold tracking-widest text-white/70">CREATOR NEWS</p>
          <div className="mt-2 flex items-center gap-3">
            <img src="/assets/eventnews.png" alt="" aria-hidden="true" width="20" height="20" />
            <h2 className="m-0 text-base font-semibold">새로운 행사·기회</h2>
          </div>
        </div>
        <CarouselContent viewportClassName="min-h-0 flex-1" className="h-full">
          {events.map((event, slide) => (
            <CarouselItem
              key={event.id}
              className="h-full"
              aria-label={`${slide + 1} / ${events.length}`}
              aria-hidden={index !== slide}
              inert={index !== slide}
            >
              <Card className="h-full rounded-none border-0 bg-transparent text-white shadow-none">
                <CardContent className="h-full p-0">
                  <button
                    type="button"
                    onClick={() =>
                      open('programs', { initialView: 'opportunities', initialEventId: event.id })
                    }
                    aria-label={`${event.title} 행사 소식 확인`}
                    className="flex h-full w-full min-w-0 flex-col items-stretch rounded-none border-0 bg-transparent p-4 pt-1 text-left text-white hover:bg-white/10 hover:text-white focus-visible:-outline-offset-4"
                  >
                    <img
                      src={event.poster}
                      alt={`${event.title} 포스터`}
                      draggable="false"
                      className="min-h-0 w-full flex-1 rounded-xl bg-white/10 object-contain"
                    />
                    <strong className="mt-4 block h-12 shrink-0 overflow-hidden text-base leading-snug">
                      {event.title}
                    </strong>
                    <span className="mt-2 block shrink-0 text-xs text-white/80">
                      {event.startDate.slice(5).replace('-', '.')} · {event.type}
                    </span>
                    <span className="mt-3 inline-flex shrink-0 items-center gap-2 text-xs font-semibold">
                      자세히 보기 <span aria-hidden="true">↗</span>
                    </span>
                  </button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex shrink-0 items-center justify-between border-0 border-t border-solid border-white/15 px-3 py-3">
          <CarouselPrevious
            aria-label="이전 행사 소식"
            className="static translate-y-0 border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white"
          />
          <span className="text-xs text-white/80" aria-live="polite">
            {index + 1} / {events.length} · 예시 일정
          </span>
          <CarouselNext
            aria-label="다음 행사 소식"
            className="static translate-y-0 border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white"
          />
        </div>
      </Carousel>
      <p className="px-2 text-xs leading-relaxed text-muted">
        새로운 만남과 창작의 기회를
        <br />
        MYME에서 발견해 보세요.
      </p>
    </aside>
  );
}

export function ActivityRail() {
  const { user, state, open, requireUser, navigate } = useHub();
  const points = state.pointHistory.reduce((sum, row) => sum + row.amount, 0);
  const colleagues = state.members.filter((member) => member.status === '동료');
  const peers = new Map(
    colleagues
      .filter((member) => member.accountId != null)
      .map((member) => [member.accountId, member]),
  );
  const activities = [
    ...state.posts.map((post) => ({ ...post, label: '게시글', route: '#post/' + post.id })),
    ...state.projects.map((project) => ({
      ...project,
      label: '프로젝트',
      route: '#projects/' + project.id,
    })),
  ]
    .filter((item) => peers.has(item.ownerId))
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);
  return (
    <aside aria-label="내 활동 요약" className="hidden min-w-0 self-start min-[1000px]:block">
      <section className="rounded-[24px] bg-brand p-5 text-white">
        <h2 className="m-0 text-sm font-semibold text-white/90">포인트 지갑</h2>
        <div className="my-4 flex items-center gap-3">
          <img
            src="/assets/point-coin.svg"
            alt=""
            aria-hidden="true"
            width="32"
            height="32"
            className="h-8 w-8 shrink-0 object-contain"
          />
          <strong className="text-[28px] leading-none">
            {user ? points.toLocaleString() : '—'}
            <span className="ml-1 text-sm font-normal text-white/70">P</span>
          </strong>
        </div>
        <p className="mb-3 mt-0 text-xs font-normal leading-relaxed text-white/80">
          모은 포인트로 상품을 구매하거나
          <br />
          현금으로 전환해 보세요.
        </p>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => requireUser(() => open('wallet', { initialView: 'shop' }))}
            className="rounded-xl border-0 bg-white/15 px-2 py-2 text-xs text-white hover:bg-white/25 hover:text-white"
          >
            상품 구매
          </button>
          <button
            type="button"
            onClick={() => requireUser(() => open('wallet', { initialView: 'cash' }))}
            className="rounded-xl border-0 bg-white/15 px-2 py-2 text-xs text-white hover:bg-white/25 hover:text-white"
          >
            현금 전환
          </button>
        </div>
        <button
          type="button"
          onClick={() => requireUser(() => open('wallet'))}
          className="w-full rounded-xl border-0 bg-white/80 px-3 py-2 text-sm font-semibold text-[#50317f] hover:bg-white hover:text-[#50317f]"
        >
          {user ? '지갑 확인하기' : '로그인하고 확인하기'}
        </button>
      </section>
      <section className="mt-4 min-h-[300px] rounded-[24px] border border-solid border-white bg-white p-5">
        <div className="flex items-center gap-2 border-0 border-b border-solid border-line pb-3">
          <img
            src="/assets/activity-pin.svg"
            alt=""
            aria-hidden="true"
            width="20"
            height="20"
            className="h-5 w-5 shrink-0 object-contain"
          />
          <h2 className="m-0 text-sm font-semibold">내 동료의 활동</h2>
        </div>
        {user ? (
          <>
            <div className="max-h-[40vh] overflow-y-auto">
              {activities.map((item) => (
                <button
                  type="button"
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className="block w-full rounded-xl border-0 bg-transparent px-0 py-3 text-left hover:bg-brand/5"
                >
                  <span className="block text-xs font-normal text-muted">
                    {peers.get(item.ownerId).name} · {item.label}
                  </span>
                  <strong className="mt-1 block text-sm leading-relaxed">{item.title}</strong>
                </button>
              ))}
            </div>
            {!activities.length && (
              <p className="py-7 text-sm font-normal leading-relaxed text-muted">
                아직 동료가 공유한 게시글이나 프로젝트가 없습니다.
              </p>
            )}
          </>
        ) : (
          <div className="py-7">
            <p className="text-sm leading-relaxed text-muted">
              로그인하고 동료들과
              <br />
              새로운 소식을 나눠보세요.
            </p>
            <button
              type="button"
              onClick={() => open('auth')}
              className="mt-2 rounded-lg border-0 bg-brand/10 px-3 py-2 text-sm text-brand hover:bg-brand/20"
            >
              로그인하기
            </button>
          </div>
        )}
      </section>
    </aside>
  );
}
