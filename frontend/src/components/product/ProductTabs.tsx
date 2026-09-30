import React, { useState } from 'react';
import { Check, ChevronDown, Monitor } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { Product } from '../../types/product';
import CustomerReviewsSection from './CustomerReviewsSection';
import ProductRichContent from './ProductRichContent';
import {
  displayText,
  filledFaqs,
  filledFeatures,
  filledRequirements,
  includedFileList,
  plainText,
  reviewStats,
} from '../../utils/productDisplay';

interface ProductTabsProps {
  product: Product;
}

type TabId = 'details' | 'features' | 'requirements' | 'reviews' | 'faq';

const PanelIntro = ({ title, text }: { title: string; text: string }) => (
  <div className="mb-5">
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    <p className="mt-0.5 text-sm text-slate-500">{text}</p>
  </div>
);

const FeatureIcon = ({ name }: { name?: string }) => {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name || ''] || Check;
  return <Icon className="h-5 w-5" />;
};

export const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const features = filledFeatures(product);
  const requirements = filledRequirements(product);
  const faqs = filledFaqs(product);
  const files = includedFileList(product);
  const reviews = reviewStats(product);
  const overviewHtml = plainText(product.longDescription) ? product.longDescription || '' : '';
  const detailsHtml = plainText(product.detailsDescription) ? product.detailsDescription || '' : '';
  const reviewCount = reviews?.count || 0;

  const tabs: { id: TabId; label: string }[] = [];
  if (overviewHtml || detailsHtml || files.length) tabs.push({ id: 'details', label: 'Product Details' });
  if (features.length) tabs.push({ id: 'features', label: 'Features' });
  if (requirements.length) tabs.push({ id: 'requirements', label: 'System' });
  tabs.push({ id: 'reviews', label: `Reviews (${reviewCount})` });
  tabs.push({ id: 'faq', label: 'FAQ' });

  const [activeTab, setActiveTab] = useState<TabId>(tabs[0]?.id || 'reviews');
  const [openFaq, setOpenFaq] = useState(0);
  const current = tabs.some((tab) => tab.id === activeTab) ? activeTab : tabs[0]?.id;
  if (!tabs.length || !current) return null;

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 sm:px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              current === tab.id ? 'border-[#F5A623] text-[#D97706]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        {current === 'details' && (
          <div className="space-y-4">
            <PanelIntro title="Product Details" text={`Full details for ${product.name}.`} />
            {overviewHtml && <ProductRichContent html={overviewHtml} />}
            {detailsHtml && <ProductRichContent html={detailsHtml} />}
            {files.length > 0 && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {files.map((file) => (
                  <li key={file} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800">{file}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {current === 'features' && (
          <div>
            <PanelIntro title="Key features" text={`Capabilities included with ${product.name}.`} />
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <article key={`${feature.title}-${feature.description}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <FeatureIcon name={feature.icon} />
                  </span>
                  {displayText(feature.title) && <h3 className="text-sm font-bold text-slate-900">{feature.title}</h3>}
                  {displayText(feature.description) && <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{feature.description}</p>}
                </article>
              ))}
            </div>
          </div>
        )}

        {current === 'requirements' && (
          <div>
            <PanelIntro title="System" text={`What you need to use ${product.name}.`} />
            <div className="grid gap-4 sm:grid-cols-2">
              {requirements.map((item) => (
                <article key={`${item.title}-${item.description}`} className="rounded-xl border border-slate-200 p-3.5">
                  <div className="mb-1 flex items-center gap-2 text-sky-700">
                    <Monitor className="h-4 w-4" />
                    {displayText(item.title) && <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>}
                  </div>
                  {displayText(item.description) && <p className="text-sm leading-relaxed text-slate-600">{item.description}</p>}
                </article>
              ))}
            </div>
          </div>
        )}

        {current === 'faq' && (
          <div>
            <PanelIntro title="FAQ" text={`Answers about ${product.name}.`} />
            {!faqs.length && <p className="text-sm text-slate-500">No questions have been added for this product.</p>}
            <div className="space-y-2">
              {faqs.map((faq, index) => {
                const open = openFaq === index;
                return (
                  <article key={faq.question} className={`overflow-hidden rounded-2xl border ${open ? 'border-amber-300' : 'border-slate-200'}`}>
                    <button type="button" onClick={() => setOpenFaq(open ? -1 : index)} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${open ? 'bg-[#F5A623] text-white' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
                      <span className="flex-1 text-sm font-semibold text-slate-900">{faq.question}</span>
                      <ChevronDown className={`h-5 w-5 text-amber-600 transition ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && displayText(faq.answer) && (
                      <p className="border-t border-amber-100 px-3 py-2.5 pl-12 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {current === 'reviews' && (
          <div>
            <PanelIntro title={`Reviews (${reviewCount})`} text={reviewCount ? `What buyers say about ${product.name}.` : 'No reviews yet.'} />
            {reviewCount > 0 && reviews && (
              <CustomerReviewsSection reviews={product.reviews || []} rating={reviews.rating} reviewCount={reviews.count} />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductTabs;
