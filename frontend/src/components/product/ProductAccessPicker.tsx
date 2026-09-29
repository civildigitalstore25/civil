import React from 'react';
import type { AccessPlan } from '../../utils/productDisplay';

interface ProductAccessPickerProps {
  plans: AccessPlan[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const ProductAccessPicker: React.FC<ProductAccessPickerProps> = ({ plans, selectedId, onSelect }) => {
  if (!plans.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
        Price on request. Send a WhatsApp message and we will share the current price.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Choose your access</h2>
      <div className="mt-2 space-y-1.5">
        {plans.map((plan) => {
          const selected = plan.id === selectedId;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                selected ? 'border-amber-400 bg-white' : 'border-slate-200 bg-white/70 hover:border-slate-300'
              }`}
            >
              <span>
                <span className="block text-sm font-semibold text-slate-800">{plan.label}</span>
                {plan.note && <span className="block text-[11px] text-slate-500">{plan.note}</span>}
              </span>
              <span className="text-right">
                <span className="block text-sm font-bold text-slate-900">
                  {plan.priceINR > 0 ? `₹${plan.priceINR.toLocaleString()}` : 'Free'}
                </span>
                {plan.compareINR && plan.compareINR > plan.priceINR && (
                  <span className="block text-xs font-semibold text-slate-400 line-through">
                    ₹{plan.compareINR.toLocaleString()}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductAccessPicker;
