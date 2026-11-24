import type { SharePlatform } from '../utils/shareProductDetail';

export type ProductShareIcon = {
  platform: SharePlatform;
  title: string;
  bgColor: string;
  hoverBgColor: string;
};

/** SoftzCart-aligned networks for product share buttons. */
export const PRODUCT_SHARE_ICONS: readonly ProductShareIcon[] = [
  { platform: 'whatsapp', title: 'Share on WhatsApp', bgColor: '#25D366', hoverBgColor: '#20BA5A' },
  { platform: 'facebook', title: 'Share on Facebook', bgColor: '#1877F2', hoverBgColor: '#166FE5' },
  { platform: 'twitter', title: 'Share on X', bgColor: '#000000', hoverBgColor: '#14171A' },
  { platform: 'linkedin', title: 'Share on LinkedIn', bgColor: '#0A66C2', hoverBgColor: '#0959A8' },
  { platform: 'email', title: 'Share via Email', bgColor: '#4B5563', hoverBgColor: '#374151' },
] as const;
