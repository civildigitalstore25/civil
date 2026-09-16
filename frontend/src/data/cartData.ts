import type { CartItem, AppliedCoupon } from '../types/cart';
import bundleImage from '../assets/autocad_bundle.png';

// Generate SVG data URLs for thumbnail illustrations if specific raster images are not present
const createThumbnailSvg = (title: string, color1: string, color2: string, icon: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="grad-${icon}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
      <pattern id="grid-${icon}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="400" height="300" fill="url(#grad-${icon})" />
    <rect width="400" height="300" fill="url(#grid-${icon})" />
    <circle cx="330" cy="50" r="80" fill="rgba(245,166,35,0.18)" filter="blur(15px)" />
    <g transform="translate(200, 130)" text-anchor="middle" fill="#FFFFFF">
      <text font-family="system-ui, sans-serif" font-weight="900" font-size="36" y="0">${icon}</text>
      <text font-family="system-ui, sans-serif" font-weight="800" font-size="16" y="40" fill="#F5A623">${title}</text>
      <text font-family="system-ui, sans-serif" font-weight="600" font-size="11" y="65" fill="#E2E8F0">PREMIUM DIGITAL BUNDLE</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const INITIAL_MOCK_CART: CartItem[] = [
  {
    id: 'cart-1',
    productId: 'autocad-architecture-complete-bundle-2024',
    name: 'AutoCAD Architecture Complete Bundle 2024',
    category: 'AUTOCAD',
    image: bundleImage,
    format: '.DWG / .DWT',
    fileSize: '2.3 GB',
    price: 1499,
    oldPrice: 3999,
    quantity: 1,
    instantDownload: true
  },
  {
    id: 'cart-2',
    productId: '3d-home-elevation-design-bundle',
    name: '3D Home Elevation Design Bundle',
    category: '3D ELEVATION',
    image: createThumbnailSvg('3D ELEVATION BUNDLE', '#1E1B4B', '#312E81', '🏛️'),
    format: '.MAX / .SKP / .RVT',
    fileSize: '4.8 GB',
    price: 999,
    oldPrice: 2499,
    quantity: 1,
    instantDownload: true
  },
  {
    id: 'cart-3',
    productId: 'civil-estimation-excel-sheet-bundle',
    name: 'Civil Estimation Excel Sheet Bundle',
    category: 'EXCEL SHEETS',
    image: createThumbnailSvg('CIVIL ESTIMATION EXCEL', '#064E3B', '#047857', '📊'),
    format: '.XLSX / .XLSM',
    fileSize: '150 MB',
    price: 599,
    oldPrice: 1999,
    quantity: 1,
    instantDownload: true
  }
];

export const VALID_COUPONS: Record<string, AppliedCoupon> = {
  CIVIL10: {
    code: 'CIVIL10',
    discountPercent: 10,
    description: '10% Extra Discount Applied!'
  },
  SAVE200: {
    code: 'SAVE200',
    discountAmount: 200,
    description: '₹200 Instant Flat Off Applied!'
  }
};
