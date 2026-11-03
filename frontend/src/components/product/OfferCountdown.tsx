import React from 'react';
import { Clock, Gift, Zap } from 'lucide-react';
import { useNow } from '../../hooks/useNow';

type Tone = 'free' | 'deal' | 'upcoming';

interface OfferCountdownProps {
  targetMs: number;
  label: string;
  tone: Tone;
  variant?: 'compact' | 'featured';
}

const TONES: Record<Tone, { box: string; text: string; border: string; bg: string }> = {
  free: { box: 'border-emerald-500 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-300', bg: 'bg-emerald-50' },
  deal: { box: 'border-[#F5A623] text-[#D97706]', text: 'text-[#D97706]', border: 'border-[#F5A623]/50', bg: 'bg-amber-50' },
  upcoming: { box: 'border-blue-400 text-blue-700', text: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50' },
};

const split = (ms: number) => ({
  days: Math.floor(ms / 86400000),
  hours: Math.floor((ms % 86400000) / 3600000),
  minutes: Math.floor((ms % 3600000) / 60000),
  seconds: Math.floor((ms % 60000) / 1000),
});
const pad = (n: number) => String(n).padStart(2, '0');

/** Live countdown (civil-ecommerce CountdownTimer equivalent). Hides itself once the target passes. */
export const OfferCountdown: React.FC<OfferCountdownProps> = ({ targetMs, label, tone, variant = 'compact' }) => {
  const now = useNow(targetMs > Date.now());
  const left = targetMs - now;
  if (left <= 0) return null;
  const t = split(left);
  const c = TONES[tone];
  const Icon = tone === 'free' ? Gift : tone === 'deal' ? Zap : Clock;

  if (variant === 'featured') {
    const boxes: Array<[string, number]> = [
      ...(t.days > 0 ? ([['Days', t.days]] as Array<[string, number]>) : []),
      ['Hours', t.hours],
      ['Mins', t.minutes],
      ['Secs', t.seconds],
    ];
    return (
      <div className={`rounded-xl border-2 ${c.border} ${c.bg} p-4`}>
        <div className="mb-3 flex items-center gap-2">
          <Icon className={`h-5 w-5 shrink-0 ${c.text}`} />
          <span className="text-sm font-bold uppercase tracking-wide text-slate-800">{label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {boxes.map(([name, value], index) => (
            <React.Fragment key={name}>
              {index > 0 && <span className={`pb-4 text-xl font-bold ${c.text}`}>:</span>}
              <div className={`flex min-w-[3.25rem] flex-col items-center rounded-lg border-2 bg-white px-1.5 py-2 ${c.box}`}>
                <span className="font-mono text-xl font-bold tabular-nums">{pad(value)}</span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{name}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 ${c.border} ${c.bg}`}>
      <Clock className={`h-3.5 w-3.5 shrink-0 ${c.text}`} />
      <span className="text-[11px] font-semibold text-slate-700">{label}</span>
      <span className={`font-mono text-xs font-bold tabular-nums ${c.text}`}>
        {t.days > 0 ? `${t.days}d ` : ''}
        {pad(t.hours)}:{pad(t.minutes)}:{pad(t.seconds)}
      </span>
    </div>
  );
};

export default OfferCountdown;
