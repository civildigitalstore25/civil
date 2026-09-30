import React from 'react';
import { X, ExternalLink, Package } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { Product } from '../../types/product';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!isOpen || !product) return null;

  const renderLucideIcon = (iconName: string, className = 'w-4 h-4') => {
    const IconComp = (LucideIcons as any)[iconName] || LucideIcons.CheckCircle;
    return <IconComp className={className} />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden text-slate-900 animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#F5A000]" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{product.name}</h2>
              <p className="text-xs text-slate-500 font-mono">ID: {product.id} • Slug: /{product.slug}/</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Top Info Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Category & Software</span>
              <span className="font-extrabold text-slate-800 text-xs">{product.category} ({product.software})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Price</span>
              <span className="font-extrabold text-slate-900 text-sm">
                ₹{product.price.toLocaleString('en-IN')}{' '}
                {product.oldPrice > product.price && (
                  <span className="text-xs font-normal text-slate-400 line-through">₹{product.oldPrice}</span>
                )}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className={`px-2 py-0.5 font-bold text-[10px] rounded-md ${
                  product.status === 'active' ? 'bg-emerald-100 text-emerald-800' : product.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {product.status?.toUpperCase() || 'ACTIVE'}
                </span>
                {product.isBestSeller && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md">Best Seller</span>
                )}
                {product.isOutOfStock && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-md">Out of Stock</span>
                )}
              </div>
            </div>
          </div>

          {/* Product Image Gallery */}
          {product.images && product.images.length > 0 && (
            <div className="space-y-2">
              <span className="font-extrabold text-slate-800 block">Product Images</span>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Preview ${idx}`}
                    className="w-24 h-24 rounded-xl border border-slate-200 object-cover shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Key Features */}
          {product.keyFeatures && product.keyFeatures.length > 0 && (
            <div className="space-y-2">
              <span className="font-extrabold text-slate-800 block">Key Features ({product.keyFeatures.length})</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.keyFeatures.map((feat, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                    <div className="p-1.5 bg-amber-100 text-[#F5A000] rounded-lg shrink-0 mt-0.5">
                      {renderLucideIcon(feat.icon, 'w-4 h-4')}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900">{feat.title}</h4>
                      <p className="text-[11px] text-slate-500">{feat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <span className="font-extrabold text-slate-800 block">Short Description</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{product.shortDescription || '—'}</p>
            </div>

            {product.longDescription && (
              <div>
                <span className="font-extrabold text-slate-800 block">Long Description (HTML)</span>
                <div
                  className="prose prose-sm max-w-none bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-700"
                  dangerouslySetInnerHTML={{ __html: product.longDescription }}
                />
              </div>
            )}
          </div>

          {/* SEO Metadata */}
          {(product.seoTitle || product.seoDescription || (product.seoKeywords && product.seoKeywords.length > 0)) && (
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
              <span className="font-extrabold text-amber-900 block">SEO & Metadata</span>
              {product.seoTitle && <p><strong className="text-amber-900">SEO Title:</strong> {product.seoTitle}</p>}
              {product.seoDescription && <p><strong className="text-amber-900">SEO Description:</strong> {product.seoDescription}</p>}
              {product.seoKeywords && product.seoKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {product.seoKeywords.map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white text-amber-900 border border-amber-300 rounded-md font-bold text-[10px]">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <a
            href={`/product/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#F5A000] hover:underline flex items-center gap-1"
          >
            <span>View Live Store Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className="px-4 py-2 bg-[#F5A000] text-white font-extrabold rounded-xl hover:bg-amber-600 transition-colors"
              >
                Edit Product
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
