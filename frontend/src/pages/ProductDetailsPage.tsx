import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Breadcrumb from '../components/product/Breadcrumb';
import ProductGallery from '../components/product/ProductGallery';
import ProductInfoSection from '../components/product/ProductInfoSection';
import ProductTabs from '../components/product/ProductTabs';
import RelatedProductsSection from '../components/product/RelatedProductsSection';
import ProductMediaSections from '../components/product/ProductMediaSections';
import WhatsAppButton from '../components/common/WhatsAppButton';
import { useProducts } from '../context/ProductContext';
import type { Product } from '../types/product';

interface ProductDetailsPageProps {
  product?: Product;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ product: propProduct }) => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const { products, getProductBySlug } = useProducts();
  const searchSlug = slug || id || '';

  const product = propProduct || (searchSlug ? getProductBySlug(searchSlug) : undefined);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
        <header className="sticky top-0 z-50 w-full shadow-sm">
          <AnnouncementBar />
          <Header />
          <Navbar />
        </header>
        <div className="max-w-md mx-auto py-20 text-center space-y-4 px-4">
          <div className="text-4xl">🔍</div>
          <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500">The product you are looking for may have been moved or removed.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-5 py-2.5 bg-[#F5A000] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Browse Store Catalogue
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#F5A623] selection:text-white">
      {/* Sticky Header Container */}
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      {/* Breadcrumb */}
      <Breadcrumb
        category={product.category}
        title={product.name}
        categorySlug={product.categorySlug}
        productSlug={product.slug}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
        {/* Product Top Grid: Gallery (Left) | Product Info (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: Product Image Gallery (6 cols lg) */}
          <div className="lg:col-span-6 w-full">
            <ProductGallery images={product.images} title={product.name} videoUrl={product.videoUrl} />
          </div>

          {/* Right: Product Information (6 cols lg) */}
          <div className="lg:col-span-6 w-full">
            <ProductInfoSection product={product} />
          </div>
        </div>

        {/* Product Information Tabs */}
        <ProductMediaSections product={product} />
        <ProductTabs product={product} />

        {/* Related Products */}
        <RelatedProductsSection currentProductId={product.id} products={products} />
      </main>

      {/* Reusable Footer */}
      <Footer />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default ProductDetailsPage;
