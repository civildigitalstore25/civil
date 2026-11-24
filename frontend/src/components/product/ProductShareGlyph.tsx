import React from 'react';
import type { SharePlatform } from '../../utils/shareProductDetail';
import WhatsAppIcon from '../common/WhatsAppIcon';

/** Brand glyphs for product share buttons (no react-icons dependency). */
export const ProductShareGlyph: React.FC<{ platform: SharePlatform; className?: string }> = ({
  platform,
  className = 'w-4 h-4',
}) => {
  if (platform === 'whatsapp') return <WhatsAppIcon className={className} />;

  if (platform === 'facebook') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M15.12 8.5H13.5V7.4c0-.4.1-.7.7-.7H15V4.1h-1.8C10.9 4.1 10 5.5 10 7.2v1.3H8.5v2.6H10V20h3.5v-8.9h1.9l.7-2.6z" />
      </svg>
    );
  }

  if (platform === 'twitter') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.924L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    );
  }

  if (platform === 'linkedin') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M6.94 8.5H3.75V20h3.19V8.5zM5.34 7.05a1.85 1.85 0 110-3.7 1.85 1.85 0 010 3.7zM20.25 20h-3.18v-5.6c0-1.33-.48-2.24-1.68-2.24-.92 0-1.46.62-1.7 1.22-.09.21-.11.5-.11.8V20H10.4s.04-9.57 0-10.56h3.18v1.5c.42-.65 1.18-1.58 2.88-1.58 2.1 0 3.79 1.37 3.79 4.32V20z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16v12H4z" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
};

export default ProductShareGlyph;
