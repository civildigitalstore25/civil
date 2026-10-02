import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminBrandsPage from './AdminBrandsPage';

export const AdminCatalogPage: React.FC = () => {
  return (
    <AdminLayout title="Brands & Categories">
      <AdminBrandsPage embedded />
    </AdminLayout>
  );
};

export default AdminCatalogPage;
