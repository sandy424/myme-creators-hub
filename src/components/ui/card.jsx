import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        'rounded-xl border border-solid border-line bg-white text-ink shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn('p-6', className)} {...props} />;
}
