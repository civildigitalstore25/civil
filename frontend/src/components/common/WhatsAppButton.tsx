import React from 'react';
import WhatsAppIcon from './WhatsAppIcon';

export const WhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/918807423228"
      target="_blank"
      rel="noreferrer"
      aria-label="Whatsapp click to chat"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white pl-3.5 pr-5 py-2.5 rounded-full shadow-xl shadow-[#25D366]/35 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 group cursor-pointer border border-white/20 select-none"
    >
      {/* Official WhatsApp Icon */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
        <WhatsAppIcon className="w-8 h-8 fill-white" />
      </div>

      {/* Two-line text matching screenshot: Whatsapp / click to chat */}
      <div className="text-left leading-tight pr-0.5">
        <div className="text-sm font-extrabold tracking-tight text-white font-sans">
          Whatsapp
        </div>
        <div className="text-[11px] font-medium text-white/95 lowercase tracking-wide">
          click to chat
        </div>
      </div>

      {/* Subtle pulse ring around button */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none -z-10 group-hover:hidden" />
    </a>
  );
};

export default WhatsAppButton;
