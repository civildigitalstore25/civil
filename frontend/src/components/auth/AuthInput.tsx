import React, { type InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightLabelAction?: React.ReactNode;
  prefixElement?: React.ReactNode;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, rightLabelAction, prefixElement, className = '', id, ...props }, ref) => {
    const inputId = id || `auth-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
          {rightLabelAction && <div>{rightLabelAction}</div>}
        </div>

        <div className="relative flex items-center">
          {prefixElement && (
            <div className="shrink-0 flex items-center bg-slate-100 text-slate-700 font-semibold text-xs px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-300 select-none">
              {prefixElement}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white border ${
              error ? 'border-red-500 text-red-900 focus:ring-red-500/20' : 'border-slate-300 text-slate-900 focus:border-[#F5A000] focus:ring-2 focus:ring-[#F5A000]/20'
            } ${
              prefixElement ? 'rounded-r-xl' : 'rounded-xl'
            } text-xs sm:text-sm px-3.5 py-2.5 outline-none transition-all placeholder:text-slate-400 ${className}`}
            {...props}
          />
        </div>

        {error && <p className="text-[11px] text-red-600 font-medium pl-1">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;
