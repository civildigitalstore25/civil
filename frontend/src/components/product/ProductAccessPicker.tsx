import React from 'react';
import type { AccessPlan } from '../../utils/productDisplay';

interface ProductAccessPickerProps {
  plans: AccessPlan[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const priceLabel = (plan: AccessPlan) => (plan.priceINR > 0 ? `₹${plan.priceINR.toLocaleString()}` : 'Free');

export const ProductAccessPicker: React.FC<ProductAccessPickerProps> = ({ plans, selectedId, onSelect }) => {
  if (!plans.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        Price on request. Send a WhatsApp message and we will share the current price.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Choose your access</h2>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {plans.map((plan) => {
          const selected = plan.id === selectedId;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.id)}
              className={`min-w-[108px] flex-1 rounded-lg border-2 px-2 py-2.5 text-center transition ${
                selected
                  ? 'border-[#F5A623] bg-[#F5A623] text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-amber-300'
              }`}
            >
              <span className={`block text-xs font-bold ${selected ? 'text-white' : 'text-slate-800'}`}>{plan.label}</span>
              {plan.note && (
                <span className={`mt-0.5 block text-[10px] ${selected ? 'text-white/80' : 'text-slate-500'}`}>{plan.note}</span>
              )}
              {plan.compareINR && plan.compareINR > plan.priceINR && (
                <span className={`mt-1 block text-[11px] line-through ${selected ? 'text-white/70' : 'text-slate-400'}`}>
                  ₹{plan.compareINR.toLocaleString()}
                </span>
              )}
              <span className={`mt-1 block text-sm font-bold ${selected ? 'text-white' : 'text-slate-900'}`}>{priceLabel(plan)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductAccessPicker;
