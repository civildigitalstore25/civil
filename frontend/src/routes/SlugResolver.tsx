import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ProductListingPage from '../pages/ProductListingPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import NotFoundPage from '../pages/NotFoundPage';
import { useCategories } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';

export const SlugResolver: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const { getCategoryBySlug } = useCategories();
  const { getProductBySlug } = useProducts();

  // Extract raw path or param, stripping leading/trailing slashes
  const rawPath = slug || location.pathname;
  let normalizedSlug = rawPath.replace(/^\/+|\/+$/g, '').toLowerCase();

  // Strip prefixes if present (e.g. "products/autocad-2007" -> "autocad-2007")
  normalizedSlug = normalizedSlug
    .replace(/^products\//, '')
    .replace(/^product\//, '')
    .replace(/^category\//, '')
    .replace(/^software\//, '');

  if (!normalizedSlug || normalizedSlug === 'products') {
    return <ProductListingPage />;
  }

  // 1. Check if slug corresponds to a category (e.g. "autocad-software", "revit", "excel-sheets", etc.)
  const categoryDef = getCategoryBySlug(normalizedSlug);
  if (categoryDef) {
    return <ProductListingPage categoryDef={categoryDef} />;
  }

  // 2. Check if slug corresponds to a product (e.g. "autocad-2007", "autodesk-revit-2014", etc.)
  const product = getProductBySlug(normalizedSlug);
  if (product) {
    return <ProductDetailsPage product={product} />;
  }

  // 3. Fallback to 404
  return <NotFoundPage />;
};

export default SlugResolver;
