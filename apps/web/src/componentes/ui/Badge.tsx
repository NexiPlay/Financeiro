import type { ReactNode } from 'react';

type Variante = 'brand' | 'yellow' | 'red' | 'neutral';

const ESTILOS: Record<Variante, string> = {
  brand: 'bg-brand/10 text-brand border-brand/25',
  yellow: 'bg-yellow/10 text-yellow border-yellow/25',
  red: 'bg-red/10 text-red border-red/25',
  neutral: 'bg-neutral/10 text-neutral border-neutral/25',
};

export function Badge({ children, variante }: { children: ReactNode; variante: Variante }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-bold border ${ESTILOS[variante]}`}>
      {children}
    </span>
  );
}
