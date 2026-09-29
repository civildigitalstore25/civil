import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { useProducts } from '../../context/ProductContext';
import type { Product } from '../../types/product';

export const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, updateProduct } = useProducts();

  const product = products.find((p) => p.id === id || p._id === id) || null;

  const handleFormSubmit = (data: Partial<Product> & { name: string; price: number }, isDraft = false) => {
    if (!id) return { success: false, error: 'Product ID missing' };
    const res = updateProduct(id, data, isDraft);
    if (res.success) {
      navigate('/admin/products');
    }
    return res;
  };

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Product not found</h2>
        <button
          onClick={() => navigate('/admin/products')}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <ProductFormModal
      isOpen={true}
      onClose={() => navigate('/admin/products')}
      product={product}
      onSubmit={handleFormSubmit}
    />
  );
};

export default EditProductPage;
