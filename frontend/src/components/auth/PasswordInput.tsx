import React, { useState, type InputHTMLAttributes } from 'react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightLabelAction?: React.ReactNode;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, rightLabelAction, className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `password-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
          {rightLabelAction && <div>{rightLabelAction}</div>}
        </div>

        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`w-full bg-white border ${
              error ? 'border-red-500 text-red-900 focus:ring-red-500/20' : 'border-slate-300 text-slate-900 focus:border-[#F5A000] focus:ring-2 focus:ring-[#F5A000]/20'
            } rounded-xl text-xs sm:text-sm pl-3.5 pr-10 py-2.5 outline-none transition-all placeholder:text-slate-400 ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md focus:outline-none"
          >
            {showPassword ? (
              /* Eye Slash Icon */
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 014.122-.963c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
              </svg>
            ) : (
              /* Eye Icon */
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {error && <p className="text-[11px] text-red-600 font-medium pl-1">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
