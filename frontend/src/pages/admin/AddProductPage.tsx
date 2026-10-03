import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { useProducts } from '../../context/ProductContext';
import type { Product } from '../../types/product';

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();

  const handleFormSubmit = async (data: Partial<Product> & { name: string; price: number }, isDraft = false) => {
    const res = await addProduct(data, isDraft);
    if (res.success) {
      navigate('/admin/products');
    }
    return res;
  };

  return (
    <AdminLayout title="Add product">
      <ProductFormModal
        asPage
        isOpen
        onClose={() => navigate('/admin/products')}
        product={null}
        onSubmit={handleFormSubmit}
      />
    </AdminLayout>
  );
};

export default AddProductPage;
