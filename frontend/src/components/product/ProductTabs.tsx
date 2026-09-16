import React, { useState } from 'react';
import type { Product } from '../../types/product';
import CustomerReviewsSection from './CustomerReviewsSection';

interface ProductTabsProps {
  product: Product;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'compatibility' | 'reviews'>('description');

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'File Specifications' },
    { id: 'compatibility', label: 'Compatibility & Requirements' },
    { id: 'reviews', label: `Customer Reviews (${product.reviewCount})` }
  ] as const;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 shadow-sm">
      {/* Horizontal Tabs Header */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-2 sm:gap-6 mb-6 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#F5A623] text-[#F5A623]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="text-slate-700 text-sm leading-relaxed">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">Product Overview</h3>
              {product.description.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {product.includedFiles && product.includedFiles.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-base font-bold text-[#D97706]">What's Included in This Bundle:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.includedFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{file}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === 'specifications' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
              <span className="text-slate-500 font-semibold">File Format:</span>
              <span className="text-slate-900 font-bold">{product.specifications.format}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
              <span className="text-slate-500 font-semibold">File Size:</span>
              <span className="text-slate-900 font-bold">{product.specifications.fileSize}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Software:</span>
              <span className="text-slate-900 font-bold">{product.specifications.software}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Version:</span>
              <span className="text-slate-900 font-bold">{product.specifications.version}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Compatibility:</span>
              <span className="text-slate-900 font-bold">{product.specifications.compatibility}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Delivery Method:</span>
              <span className="text-emerald-700 font-bold">{product.specifications.delivery}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Access Duration:</span>
              <span className="text-[#D97706] font-bold">{product.specifications.access}</span>
            </div>
          </div>
        )}

        {/* Compatibility Tab */}
        {activeTab === 'compatibility' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Software & System Requirements</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-500 w-1/3">Supported Software</td>
                    <td className="p-3.5 font-semibold text-slate-900">{product.compatibility.supportedSoftware}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3.5 font-bold text-slate-500">Compatible Versions</td>
                    <td className="p-3.5 font-semibold text-slate-900">{product.compatibility.compatibleVersions}</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-500">Operating System</td>
                    <td className="p-3.5 font-semibold text-slate-900">{product.compatibility.os}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3.5 font-bold text-slate-500">File Extensions</td>
                    <td className="p-3.5 font-semibold text-slate-900">{product.compatibility.fileTypes}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-500">Hardware Requirements</td>
                    <td className="p-3.5 font-semibold text-slate-900">{product.compatibility.requirements}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <CustomerReviewsSection reviews={product.reviews} rating={product.rating} reviewCount={product.reviewCount} />
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
