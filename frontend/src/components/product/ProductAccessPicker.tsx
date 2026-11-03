import React, { useRef } from 'react';
import { Check, Gift } from 'lucide-react';
import type { AccessPlan } from '../../utils/productDisplay';

interface ProductAccessPickerProps {
  plans: AccessPlan[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`;

/** Display-only names; the plan label itself (used for the cart line) is unchanged. */
const titleFor = (plan: AccessPlan) => {
  if (plan.isFree) return 'Free access';
  if (plan.id === 'base' || plan.id === 'standard') return 'Single Purchase';
  if (plan.id === 'lifetime') return 'Lifetime';
  if (plan.id === 'membership') return 'Membership';
  return plan.label;
};

const subtitleFor = (plan: AccessPlan) => {
  if (plan.isFree) return 'Full download included';
  if (plan.id === 'base' || plan.id === 'standard') return 'One-time download';
  if (plan.id === 'lifetime') return 'Pay once, use forever';
  if (plan.id === 'membership') return 'All-access membership';
  return plan.note ? `Valid ${plan.label} \u00b7 ${plan.note}` : `Valid ${plan.label}`;
};

const percentOff = (plan: AccessPlan) =>
  plan.compareINR && plan.compareINR > plan.priceINR ? Math.round(((plan.compareINR - plan.priceINR) / plan.compareINR) * 100) : 0;

type Theme = { ring: string; tint: string; dot: string; price: string };
const themeFor = (plan: AccessPlan): Theme =>
  plan.isFree
    ? { ring: 'border-emerald-500 ring-emerald-500/20', tint: 'bg-emerald-50/70', dot: 'bg-emerald-600 border-emerald-600', price: 'text-emerald-700' }
    : plan.isDeal
      ? { ring: 'border-rose-500 ring-rose-500/20', tint: 'bg-rose-50/60', dot: 'bg-rose-600 border-rose-600', price: 'text-rose-700' }
      : { ring: 'border-[#F5A623] ring-[#F5A623]/25', tint: 'bg-amber-50/70', dot: 'bg-[#F5A623] border-[#F5A623]', price: 'text-slate-900' };

const Badge: React.FC<{ plan: AccessPlan }> = ({ plan }) => {
  const off = percentOff(plan);
  if (plan.isFree)
    return <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">Free</span>;
  if (plan.isDeal)
    return (
      <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
        Deal{off > 0 ? ` -${off}%` : ''}
      </span>
    );
  if (plan.id === 'lifetime')
    return <span className="rounded-md border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">Best value</span>;
  if (off > 0)
    return <span className="rounded-md border border-[#F5A623]/30 bg-[#F5A623]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#D97706]">-{off}%</span>;
  return null;
};

const PlanBody: React.FC<{ plan: AccessPlan; selected: boolean; showIndicator: boolean }> = ({ plan, selected, showIndicator }) => {
  const theme = themeFor(plan);
  return (
    <>
      {showIndicator && (
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
            selected ? theme.dot : 'border-slate-300 bg-white'
          }`}
        >
          {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </span>
      )}
      {!showIndicator && plan.isFree && (
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Gift className="h-4 w-4" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-900">{titleFor(plan)}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{subtitleFor(plan)}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1 text-right">
        <span className="flex items-baseline gap-1.5">
          {plan.compareINR && plan.compareINR > plan.priceINR ? (
            <span className="text-xs font-medium text-slate-400 line-through">{inr(plan.compareINR)}</span>
          ) : null}
          {!plan.isFree && <span className={`text-base font-extrabold ${theme.price}`}>{inr(plan.priceINR)}</span>}
        </span>
        <Badge plan={plan} />
      </span>
    </>
  );
};

export const ProductAccessPicker: React.FC<ProductAccessPickerProps> = ({ plans, selectedId, onSelect }) => {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  if (!plans.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        Price on request. Send a WhatsApp message and we will share the current price.
      </div>
    );
  }

  // Single option (incl. the free offer): informational selected card, not a picker.
  if (plans.length === 1) {
    const plan = plans[0];
    const theme = themeFor(plan);
    return (
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your access</h2>
        <div className={`mt-2 flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${theme.ring.split(' ')[0]} ${theme.tint}`}>
          <PlanBody plan={plan} selected showIndicator={!plan.isFree} />
        </div>
      </div>
    );
  }

  const activeIndex = Math.max(0, plans.findIndex((plan) => plan.id === selectedId));
  const move = (index: number) => {
    const next = (index + plans.length) % plans.length;
    onSelect(plans[next].id);
    refs.current[next]?.focus();
  };
  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(index + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      move(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      move(plans.length - 1);
    }
  };

  return (
    <div>
      <h2 id="access-picker-label" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Choose your access
      </h2>
      <div role="radiogroup" aria-labelledby="access-picker-label" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan, index) => {
          const selected = index === activeIndex;
          const theme = themeFor(plan);
          return (
            <button
              key={plan.id}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(plan.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`flex w-full items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5A623]/40 ${
                selected ? `${theme.ring} ${theme.tint} ring-4` : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <PlanBody plan={plan} selected={selected} showIndicator />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductAccessPicker;
