import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, ShieldCheck, Zap } from 'lucide-react';
import type { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import ProductAccessPicker from './ProductAccessPicker';
import {
  buildAccessPlans,
  displayText,
  isScheduleActive,
  plainText,
  reviewStats,
} from '../../utils/productDisplay';

interface ProductInfoSectionProps {
  product: Product;
}

export const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const plans = useMemo(() => buildAccessPlans(product), [product]);
  const [selectedId, setSelectedId] = useState(plans[0]?.id || '');
  const selected = plans.find((plan) => plan.id === selectedId) || plans[0];
  const reviews = reviewStats(product);
  const brand = displayText(product.brand || product.company);
  const category = displayText(product.category);
  const version = displayText(product.version);
  const summary = plainText(product.shortDescription);
  const showSummary = summary && summary !== product.name.trim();
  const format = displayText(product.format);
  const fileSize = displayText(product.fileSize);
  const dealOn = isScheduleActive(product.isDeal, product.dealStartDate, product.dealStartTime, product.dealEndDate, product.dealEndTime);
  const freeOn = isScheduleActive(product.isFreeProduct, product.freeProductStartDate, product.freeProductStartTime, product.freeProductEndDate, product.freeProductEndTime);
  const savings = selected?.compareINR && selected.compareINR > selected.priceINR ? selected.compareINR - selected.priceINR : 0;

  const purchase = () => {
    if (!selected || product.isOutOfStock) return;
    addToCart(
      {
        ...product,
        id: `${product.id}::${selected.id}`,
        name: plans.length > 1 ? `${product.name} (${selected.label})` : product.name,
        price: selected.priceINR,
        oldPrice: selected.compareINR || 0,
      },
      quantity,
    );
  };

  const handleAddToCart = () => {
    purchase();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className="flex flex-col space-y-3 text-slate-900">
      {(brand || category || version) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {(brand || category) && (
            <span className="rounded-md border border-[#F5A623]/30 bg-[#F5A623]/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#D97706]">
              {brand || category}
            </span>
          )}
          {version && <span className="text-xs font-semibold text-slate-500">v{version}</span>}
          {product.badge && displayText(product.badge) && (
            <span className="rounded-md border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
              {product.badge}
            </span>
          )}
        </div>
      )}

      <h1 className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl">{product.name}</h1>

      {(reviews || (product.downloadsCount || 0) > 0) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {reviews && (
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1">
              <span className="text-amber-500">{'★'.repeat(Math.round(reviews.rating))}{'☆'.repeat(5 - Math.round(reviews.rating))}</span>
              <span className="font-extrabold text-slate-900">{reviews.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-500">({reviews.count})</span>
            </div>
          )}
          {(product.downloadsCount || 0) > 0 && (
            <span className="text-xs font-medium text-slate-500">
              <span className="font-bold text-slate-800">{product.downloadsCount}</span> downloads
            </span>
          )}
        </div>
      )}

      {dealOn && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Limited deal
          {product.dealEndDate ? ` until ${product.dealEndDate}${product.dealEndTime ? ` ${product.dealEndTime}` : ''}` : ''}
        </p>
      )}
      {freeOn && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Free
          {product.freeProductEndDate ? ` until ${product.freeProductEndDate}` : ' for a limited time'}
        </p>
      )}

      {selected && selected.priceINR > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-bold text-slate-900">₹{(selected.priceINR * quantity).toLocaleString()}</span>
            {savings > 0 && selected.compareINR && (
              <span className="text-sm font-medium text-slate-400 line-through">₹{(selected.compareINR * quantity).toLocaleString()}</span>
            )}
          </div>
          {savings > 0 && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              You save ₹{(savings * quantity).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <ProductAccessPicker plans={plans} selectedId={selected?.id || ''} onSelect={setSelectedId} />

      {(format || fileSize) && (
        <div className="flex flex-wrap gap-2">
          {format && <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800">{format}</span>}
          {fileSize && <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800">{fileSize}</span>}
        </div>
      )}

      {showSummary && <p className="text-sm leading-relaxed text-slate-600">{summary}</p>}

      {product.isOutOfStock ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">Out of stock</p>
      ) : (
        selected && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity</span>
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-7 w-7 cursor-pointer rounded-md border border-slate-200 bg-white text-sm font-semibold">-</button>
                <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => value + 1)} className="h-7 w-7 cursor-pointer rounded-md border border-slate-200 bg-white text-sm font-semibold">+</button>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => { purchase(); navigate('/checkout'); }} className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-center text-sm font-bold text-slate-900 sm:flex-1">
                Buy now
              </button>
              <button type="button" onClick={handleAddToCart} className={`w-full cursor-pointer rounded-lg px-2 py-2.5 text-center text-sm font-bold text-white sm:flex-1 ${addedToCart ? 'bg-emerald-600' : 'bg-gradient-to-r from-[#F5A623] to-[#FFAA00]'}`}>
                {addedToCart ? 'Added to cart' : selected.priceINR > 0 ? 'Add to cart' : 'Get it free'}
              </button>
              <a
                href={`https://wa.me/918807423228?text=${encodeURIComponent(`Hi, I am interested in ${product.name}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#22C55E] px-2 py-2.5 text-center text-sm font-bold text-white sm:flex-1"
              >
                Order on WhatsApp
              </a>
            </div>
          </>
        )
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
          { title: 'Secure checkout', text: 'Safe payment', icon: ShieldCheck },
          { title: 'Instant delivery', text: 'Digital download', icon: Zap },
          { title: 'WhatsApp support', text: 'Help on chat', icon: Headphones },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
              <item.icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-xs font-bold text-slate-900">{item.title}</span>
              <span className="block text-[11px] text-slate-500">{item.text}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductInfoSection;
