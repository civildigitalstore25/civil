import React from 'react';
import WhatsAppIcon from './WhatsAppIcon';

interface WhatsAppButtonProps {
  /** On small screens, show a smaller green circular icon above sticky bars. */
  compactOnMobile?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ compactOnMobile = false }) => {
  return (
    <a
      href="https://wa.me/918807423228"
      target="_blank"
      rel="noreferrer"
      aria-label="Whatsapp click to chat"
      className={
        compactOnMobile
          ? 'fixed bottom-[4.25rem] right-3 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/35 transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:gap-2.5 sm:pl-3.5 sm:pr-5 sm:py-2.5 group select-none'
          : 'fixed bottom-6 right-6 z-50 flex cursor-pointer items-center gap-2.5 rounded-full bg-[#25D366] pl-3.5 pr-5 py-2.5 text-white shadow-xl shadow-[#25D366]/35 transition-all hover:scale-105 active:scale-95 group select-none'
      }
    >
      <WhatsAppIcon className={compactOnMobile ? 'h-5 w-5 fill-white sm:h-8 sm:w-8' : 'h-8 w-8 fill-white'} />

      <div className={compactOnMobile ? 'hidden text-left leading-tight sm:block' : 'text-left leading-tight'}>
        <div className="text-sm font-extrabold tracking-tight text-white font-sans">Whatsapp</div>
        <div className="text-[11px] font-medium lowercase tracking-wide text-white/95">click to chat</div>
      </div>
    </a>
  );
};

export default WhatsAppButton;
