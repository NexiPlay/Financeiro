import type { ReactNode } from 'react';

export function Card({
  children,
  destaque = false,
  className = '',
}: {
  children: ReactNode;
  destaque?: boolean;
  className?: string;
}) {
  const borda = destaque ? 'border-brand/30 shadow-[0_0_26px_rgba(9,188,138,0.16)]' : 'border-border';
  return <div className={`bg-bg-card border ${borda} rounded-2xl p-[18px] flex flex-col gap-2 min-w-0 ${className}`}>{children}</div>;
}

export function CardLabel({ children, destaque = false }: { children: ReactNode; destaque?: boolean }) {
  return (
    <span className={`text-[11px] uppercase tracking-wide font-bold ${destaque ? 'text-brand' : 'text-text-secondary'}`}>
      {children}
    </span>
  );
}

export function CardValor({ children }: { children: ReactNode }) {
  return <span className="text-[25px] font-bold tracking-tight [font-variant-numeric:tabular-nums]">{children}</span>;
}

export function CardSub({ children }: { children: ReactNode }) {
  return <span className="text-xs text-text-secondary">{children}</span>;
}
