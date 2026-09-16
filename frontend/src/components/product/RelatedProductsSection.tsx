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
  const related = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  return (
    <section className="w-full mt-16 pt-12 border-t border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Related Products
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProductsSection;
