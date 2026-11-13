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
      aria-label="WhatsApp chat"
      title="Chat on WhatsApp"
      className={`fixed z-50 flex cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/35 transition-all hover:scale-110 active:scale-95 select-none ${
        compactOnMobile
          ? 'bottom-[4.25rem] right-3 h-12 w-12 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14'
          : 'bottom-6 right-6 h-14 w-14'
      }`}
    >
      <WhatsAppIcon className={compactOnMobile ? 'h-6 w-6 fill-white sm:h-8 sm:w-8' : 'h-8 w-8 fill-white'} />
    </a>
  );
};

export default WhatsAppButton;
