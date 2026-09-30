import React from 'react';
import type { Product, SubscriptionDuration } from '../../types/product';

const money = (value?: string) => (value?.trim() ? value : '—');

const PriceRow = ({ label, inr, usd }: { label: string; inr?: string; usd?: string }) => {
  if (!inr && !usd) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="text-sm font-black text-slate-900">
        {inr ? `₹${money(inr)}` : ''}
        {inr && usd ? ' · ' : ''}
        {usd ? `$${money(usd)}` : ''}
      </span>
    </div>
  );
};

const DurationList = ({ title, rows }: { title: string; rows?: SubscriptionDuration[] }) => {
  if (!rows?.length) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-black uppercase tracking-wide text-slate-500">{title}</h4>
      {rows.map((row, index) => (
        <div key={`${row.duration}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="font-bold text-slate-900">{row.duration || 'Plan'}</p>
          <p className="text-sm text-slate-600">
            ₹{money(row.priceINR || row.price)} · ${money(row.priceUSD)}
            {row.trialDays ? ` · ${row.trialDays} day trial` : ''}
          </p>
        </div>
      ))}
    </div>
  );
};

const HtmlBlock = ({ title, html }: { title: string; html?: string }) => {
  if (!html?.trim()) return null;
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-black text-slate-900">{title}</h3>
      <div className="prose prose-slate max-w-none text-sm" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
};

const LinkList = ({ title, links }: { title: string; links?: string[] }) => {
  const items = (links || []).filter(Boolean);
  if (!items.length) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-lg font-black text-slate-900">{title}</h3>
      <ul className="space-y-2">
        {items.map((link) => (
          <li key={link}>
            <a href={link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-amber-700 break-all">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export const ProductCatalogDetails: React.FC<{ product: Product }> = ({ product }) => (
  <section className="space-y-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <div>
      <h2 className="text-xl font-black text-slate-900">Product details</h2>
      <p className="mt-1 text-sm text-slate-500">
        {product.brand || product.software} · {product.category}
        {product.version ? ` · v${product.version}` : ''}
      </p>
    </div>

    <HtmlBlock title="Overview" html={product.longDescription} />
    <HtmlBlock title="Technical details" html={product.detailsDescription} />

    <div className="grid gap-3 md:grid-cols-2">
      <PriceRow label="eBook / base price" inr={product.ebookPriceINR} usd={product.ebookPriceUSD} />
      <PriceRow label="Compare-at price" inr={product.strikethroughPriceINR} usd={product.strikethroughPriceUSD} />
      {product.hasLifetime && (
        <PriceRow label="Lifetime access" inr={product.lifetimePriceINR || product.lifetimePrice} usd={product.lifetimePriceUSD} />
      )}
      {product.hasMembership && (
        <PriceRow label="Membership" inr={product.membershipPriceINR || product.membershipPrice} usd={product.membershipPriceUSD} />
      )}
    </div>

    <DurationList title="Subscriptions" rows={product.subscriptionDurations || product.subscriptions} />

    {product.isDeal && (
      <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-black text-amber-900">Limited deal</h3>
        <p className="text-sm text-amber-800">
          {product.dealStartDate} {product.dealStartTime} → {product.dealEndDate} {product.dealEndTime}
        </p>
        <PriceRow label="Deal eBook" inr={product.dealEbookPriceINR} usd={product.dealEbookPriceUSD} />
        <PriceRow label="Deal lifetime" inr={product.dealLifetimePriceINR} usd={product.dealLifetimePriceUSD} />
        <PriceRow label="Deal membership" inr={product.dealMembershipPriceINR} usd={product.dealMembershipPriceUSD} />
        <DurationList title="Deal subscriptions" rows={product.dealSubscriptionDurations || product.dealSubscriptions} />
      </div>
    )}

    {product.isFreeProduct && (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        Free from {product.freeProductStartDate} {product.freeProductStartTime} until {product.freeProductEndDate}{' '}
        {product.freeProductEndTime}
      </p>
    )}

    {!!product.keyFeatures?.length && (
      <section className="grid gap-3 sm:grid-cols-2">
        {product.keyFeatures.map((feature) => (
          <article key={feature.title} className="rounded-xl border border-slate-200 p-4">
            <h4 className="font-bold text-slate-900">{feature.title}</h4>
            <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
          </article>
        ))}
      </section>
    )}

    {!!product.systemRequirements?.length && (
      <section className="space-y-2">
        <h3 className="text-lg font-black text-slate-900">System requirements</h3>
        {product.systemRequirements.map((item) => (
          <p key={item.title} className="text-sm text-slate-700">
            <span className="font-bold">{item.title}:</span> {item.description}
          </p>
        ))}
      </section>
    )}

    {!!product.faqs?.length && (
      <section className="space-y-3">
        <h3 className="text-lg font-black text-slate-900">FAQs</h3>
        {product.faqs.map((faq) => (
          <details key={faq.question} className="rounded-xl border border-slate-200 px-4 py-3">
            <summary className="cursor-pointer font-bold text-slate-900">{faq.question}</summary>
            <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </section>
    )}

    <LinkList title="Demo video" links={product.videoUrl ? [product.videoUrl] : []} />
    <LinkList title="Activation video" links={product.activationVideoUrl ? [product.activationVideoUrl] : []} />
    <LinkList title="Instagram reels" links={product.instagramReels} />
    {product.driveLink && <LinkList title="Download link" links={[product.driveLink]} />}

    {(product.seoTitle || product.seoDescription || product.seoKeywords?.length) && (
      <section className="space-y-1 border-t border-slate-100 pt-4 text-xs text-slate-500">
        {product.seoTitle && <p>SEO title: {product.seoTitle}</p>}
        {product.seoDescription && <p>SEO description: {product.seoDescription}</p>}
        {!!product.seoKeywords?.length && <p>Keywords: {product.seoKeywords.join(', ')}</p>}
      </section>
    )}
  </section>
);

export default ProductCatalogDetails;
