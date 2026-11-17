import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import ProductCard from '../common/ProductCard';

interface RelatedProductsSectionProps {
  currentProductId: string;
  products: Product[];
}

export const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({
  currentProductId,
  products
}) => {
  const currentProduct = products.find((p) => p.id === currentProductId);

  // Filter out the current product and prioritize products from the same category or software
  const otherProducts = products.filter((p) => p.id !== currentProductId);
  const sameCategoryOrSoftware = currentProduct
    ? otherProducts.filter((p) => {
        const catMatch =
          currentProduct.category &&
          p.category &&
          p.category.toLowerCase() === currentProduct.category.toLowerCase();
        const slugMatch =
          currentProduct.categorySlug &&
          p.categorySlug &&
          p.categorySlug.toLowerCase() === currentProduct.categorySlug.toLowerCase();
        const softwareMatch =
          currentProduct.software &&
          p.software &&
          p.software.toLowerCase() === currentProduct.software.toLowerCase();
        return catMatch || slugMatch || softwareMatch;
      })
    : [];

  const remaining = otherProducts.filter(
    (p) => !sameCategoryOrSoftware.some((sc) => sc.id === p.id)
  );

  const related = [...sameCategoryOrSoftware, ...remaining].slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="w-full mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-slate-200">
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Related Products
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Handpicked CAD, BIM & Civil Engineering bundles for you
          </p>
        </div>

        <Link
          to="/products"
          className="text-[#F5A623] hover:text-amber-600 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
        >
          <span>View All</span>
          <span>→</span>
        </Link>
      </div>

      {/* Grid: 2 products per row on mobile & small screens, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {related.map((prod) => (
          <ProductCard key={prod.id} product={prod} compact={true} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProductsSection;
