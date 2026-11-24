export type SharePlatform = 'whatsapp' | 'facebook' | 'twitter' | 'linkedin' | 'email';

/** Open a share dialog for the current product page URL (SoftzCart-style). */
export function shareProductDetail(platform: SharePlatform, productName: string): void {
  const pageUrl = window.location.href;
  const url = encodeURIComponent(pageUrl);
  const text = encodeURIComponent(`${productName} - ${pageUrl}`);

  const shareUrlByPlatform: Record<SharePlatform, string> = {
    whatsapp: `https://wa.me/?text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    twitter: `https://twitter.com/intent/tweet?text=${text}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    email: `mailto:?subject=${encodeURIComponent(productName)}&body=${text}`,
  };

  const shareUrl = shareUrlByPlatform[platform];
  if (shareUrl) window.open(shareUrl, '_blank', 'noopener,noreferrer');
}
