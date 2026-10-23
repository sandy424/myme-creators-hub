// shadcn/ui Carousel composition, adapted to this project's JavaScript and theme.
// https://ui.shadcn.com/docs/components/carousel
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '../../lib/utils';

const CarouselContext = createContext(null);
function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('Carousel components must be used inside Carousel.');
  return context;
}

export function Carousel({
  opts,
  orientation = 'horizontal',
  plugins,
  setApi,
  className,
  children,
  onKeyDown,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === 'horizontal' ? 'x' : 'y' },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);
  useEffect(() => {
    if (!api) return;
    setApi?.(api);
    const update = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    update();
    api.on('select', update).on('reInit', update);
    return () => {
      api.off('select', update).off('reInit', update);
    };
  }, [api, setApi]);
  return (
    <CarouselContext.Provider
      value={{ carouselRef, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
    >
      <div
        role="region"
        aria-roledescription="캐러셀"
        data-slot="carousel"
        className={cn('relative', className)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const prev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
          const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
          if (event.key === prev) {
            event.preventDefault();
            scrollPrev();
          } else if (event.key === next) {
            event.preventDefault();
            scrollNext();
          }
        }}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, viewportClassName, ...props }) {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div
      ref={carouselRef}
      data-slot="carousel-viewport"
      className={cn('overflow-hidden', viewportClassName)}
    >
      <div
        data-slot="carousel-content"
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4 touch-pan-y' : '-mt-4 flex-col touch-pan-x',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CarouselItem({ className, ...props }) {
  const { orientation } = useCarousel();
  return (
    <div
      role="group"
      aria-roledescription="슬라이드"
      data-slot="carousel-item"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  );
}

function CarouselControl({ direction, className, onClick, children, ...props }) {
  const { orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();
  const previous = direction === 'previous';
  return (
    <button
      type="button"
      aria-label={previous ? '이전 슬라이드' : '다음 슬라이드'}
      disabled={previous ? !canScrollPrev : !canScrollNext}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) (previous ? scrollPrev : scrollNext)();
      }}
      className={cn(
        'absolute grid h-8 w-8 place-items-center rounded-full border border-solid border-line bg-white p-0 text-ink hover:bg-canvas disabled:opacity-50',
        orientation === 'horizontal'
          ? `top-1/2 -translate-y-1/2 ${previous ? '-left-12' : '-right-12'}`
          : `left-1/2 -translate-x-1/2 ${previous ? '-top-12' : '-bottom-12'}`,
        className,
      )}
      {...props}
    >
      {children || (
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={orientation === 'vertical' ? 'rotate-90' : undefined}
        >
          <path d={previous ? 'm14 7-5 5 5 5M9 12h11' : 'm10 7 5 5-5 5M15 12H4'} />
        </svg>
      )}
    </button>
  );
}
export function CarouselPrevious(props) {
  return <CarouselControl direction="previous" {...props} />;
}
export function CarouselNext(props) {
  return <CarouselControl direction="next" {...props} />;
}
