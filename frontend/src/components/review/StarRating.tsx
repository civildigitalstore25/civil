import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { RATING_LABELS } from '../../utils/reviewFormat';

const SIZE_CLASS = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
} as const;

interface StarRatingProps {
  rating: number;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

/** Read-only star row. Supports fractional values (e.g. 4.3) with a partially filled star. */
export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'md', className = '' }) => {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, value - index));
        return (
          <span key={index} className={`relative inline-block ${SIZE_CLASS[size]}`}>
            <Star className={`absolute inset-0 ${SIZE_CLASS[size]} text-slate-300`} strokeWidth={1.75} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={`${SIZE_CLASS[size]} fill-amber-400 text-amber-400`} strokeWidth={1.75} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};

interface StarPickerProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
}

/** Interactive, keyboard accessible 1-5 star picker. */
export const StarPicker: React.FC<StarPickerProps> = ({ value, onChange, disabled, invalid, id }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(Math.min(5, (value || 0) + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(Math.max(1, (value || 1) - 1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        id={id}
        role="radiogroup"
        aria-label="Your rating"
        aria-invalid={invalid || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setHover(0)}
        className={`inline-flex items-center gap-1 rounded-xl px-1 py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/50 ${
          invalid ? 'ring-2 ring-rose-300' : ''
        }`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''} - ${RATING_LABELS[star]}`}
            tabIndex={-1}
            disabled={disabled}
            onMouseEnter={() => setHover(star)}
            onClick={() => onChange(star)}
            className="cursor-pointer p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Star
              className={`h-7 w-7 sm:h-8 sm:w-8 transition-colors ${
                star <= shown ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300'
              }`}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <span className={`text-sm font-bold ${shown ? 'text-slate-800' : 'text-slate-400'}`}>
        {shown ? RATING_LABELS[shown] : 'Tap a star to rate'}
      </span>
    </div>
  );
};

export default StarRating;
