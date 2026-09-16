import React from 'react';

interface AuthDividerProps {
  text?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({ text = 'or sign in with email' }) => {
  return (
    <div className="relative flex items-center justify-center my-5">
      <div className="grow border-t border-slate-200" />
      <span className="shrink-0 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider bg-white">
        {text}
      </span>
      <div className="grow border-t border-slate-200" />
    </div>
  );
};

export default AuthDivider;
