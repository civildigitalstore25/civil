import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { useProducts } from '../../context/ProductContext';
import type { Product } from '../../types/product';

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();

  const handleFormSubmit = (data: Partial<Product> & { name: string; price: number }, isDraft = false) => {
    const res = addProduct(data, isDraft);
    if (res.success) {
      navigate('/admin/products');
    }
    return res;
  };

  return (
    <ProductFormModal
      isOpen={true}
      onClose={() => navigate('/admin/products')}
      product={null}
      onSubmit={handleFormSubmit}
    />
  );
};

export default AddProductPage;
