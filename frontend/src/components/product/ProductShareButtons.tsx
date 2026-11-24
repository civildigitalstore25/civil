import React from 'react';
import { PRODUCT_SHARE_ICONS } from '../../constants/productShare';
import { shareProductDetail, type SharePlatform } from '../../utils/shareProductDetail';
import ProductShareGlyph from './ProductShareGlyph';

interface ProductShareButtonsProps {
  productName: string;
  /** Inline row under the title (mobile). Desktop uses the floating rail. */
  variant?: 'inline' | 'floating';
}

const ShareButton: React.FC<{
  platform: SharePlatform;
  title: string;
  bgColor: string;
  hoverBgColor: string;
  productName: string;
}> = ({ platform, title, bgColor, hoverBgColor, productName }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={() => shareProductDetail(platform, productName)}
    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-transform hover:scale-110"
    style={{ backgroundColor: bgColor }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = hoverBgColor;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = bgColor;
    }}
  >
    <ProductShareGlyph platform={platform} className="h-4 w-4" />
  </button>
);

/** SoftzCart-style product share: inline on mobile, fixed left rail on desktop. */
export const ProductShareButtons: React.FC<ProductShareButtonsProps> = ({
  productName,
  variant = 'inline',
}) => {
  if (variant === 'floating') {
    return (
      <div
        className="fixed left-3 top-1/2 z-[45] hidden -translate-y-1/2 flex-col space-y-3 md:flex"
        aria-label="Share this product"
      >
        {PRODUCT_SHARE_ICONS.map((item) => (
          <ShareButton key={item.platform} {...item} productName={productName} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 md:hidden" aria-label="Share this product">
      <span className="mr-1 text-xs font-semibold text-slate-500">Share:</span>
      {PRODUCT_SHARE_ICONS.map((item) => (
        <ShareButton key={item.platform} {...item} productName={productName} />
      ))}
    </div>
  );
};

export default ProductShareButtons;
