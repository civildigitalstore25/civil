import React from 'react';

interface GoogleButtonProps {
  onClick?: () => void;
  text?: string;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onClick,
  text = 'Continue with Google'
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 active:scale-[0.99] transition-all duration-200 cursor-pointer"
    >
      {/* Google Multicolor SVG Icon */}
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.26v3.15C3.26 21.36 7.37 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.2.01 10.05.01 12c0 1.95.45 3.8 1.25 5.39l4.02-3.15z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.64 1.26 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
        />
      </svg>
      <span>{text}</span>
    </button>
  );
};

export default GoogleButton;
