import React from 'react';
import { ShieldCheck } from 'lucide-react';

const copyStyles = `
.product-copy h1,.product-copy h2,.product-copy h3,.product-copy h4 {
  color: #0f172a;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin: 1.35rem 0 0.55rem;
}
.product-copy h2 { font-size: 1.15rem; }
.product-copy h3 { font-size: 1rem; }
.product-copy > :first-child { margin-top: 0; }
.product-copy p { color: #475569; line-height: 1.7; margin: 0.55rem 0; font-size: 0.9375rem; }
.product-copy strong,.product-copy b { color: #0f172a; font-weight: 700; }
.product-copy a { color: #d97706; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
.product-copy ul,.product-copy ol { margin: 1rem 0; padding: 0; display: grid; gap: 0.65rem; }
.product-copy ul { list-style: none; }
.product-copy ul li {
  position: relative;
  padding: 0.8rem 0.95rem 0.8rem 2.35rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  color: #1e293b;
  font-weight: 600;
  line-height: 1.5;
}
.product-copy ul li::before {
  content: "";
  position: absolute;
  left: 0.9rem;
  top: 1.05rem;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: #F5A623;
}
.product-copy ol { padding-left: 1.25rem; color: #334155; }
.product-copy table { width: 100%; border-collapse: collapse; background: #fff; margin: 1rem 0; }
.product-copy th,.product-copy td { border: 1px solid #e2e8f0; padding: 0.7rem 0.85rem; text-align: left; }
.product-copy th { background: #f8fafc; color: #0f172a; }
`;

const linesFromHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.body.children)
    .map((node) => ({
      text: (node.textContent || '').replace(/\s+/g, ' ').trim(),
      heading: /^H[1-6]$/.test(node.tagName) || node.querySelectorAll('strong,b').length > 0 && node.children.length === 1,
    }))
    .filter((line) => line.text);
};

const AssurancePanel = ({ title, items }: { title: string; items: string[] }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-2.5 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white px-3.5 py-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5A623] text-white">
        <ShieldCheck className="h-4 w-4" />
      </span>
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-[11px] font-medium text-slate-500">What you get with this product</p>
      </div>
    </div>
    <ul className={`grid gap-px bg-slate-200 ${items.length > 1 ? 'sm:grid-cols-2' : ''} ${items.length === 3 ? 'lg:grid-cols-3' : ''}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 bg-white px-3 py-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">✓</span>
          <span className="text-sm font-semibold leading-snug text-slate-800">{item}</span>
        </li>
      ))}
    </ul>
  </section>
);

export const ProductRichContent: React.FC<{ html: string }> = ({ html }) => {
  const lines = linesFromHtml(html);
  const short = lines.length >= 2 && lines.every((line) => line.text.length <= 90) && !/<(table|img|iframe)/i.test(html);
  if (short && lines[0].heading) {
    return <AssurancePanel title={lines[0].text} items={lines.slice(1).map((line) => line.text)} />;
  }
  if (short) {
    return <AssurancePanel title="Highlights" items={lines.map((line) => line.text)} />;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <style>{copyStyles}</style>
      <div className="product-copy text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default ProductRichContent;
