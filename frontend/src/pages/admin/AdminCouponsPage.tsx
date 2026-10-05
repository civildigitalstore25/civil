import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/admin/ConfirmModal';
import CouponHeader from '../../components/admin/coupon/CouponHeader';
import CouponTable from '../../components/admin/coupon/CouponTable';
import CouponModal from '../../components/admin/coupon/CouponModal';
import { useCoupons } from '../../context/CouponContext';
import type { Coupon } from '../../types/coupon';

export const AdminCouponsPage: React.FC = () => {
  const { coupons, deleteCoupon, toggleStatus } = useCoupons();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenCreateModal = () => {
    setCouponToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setCouponToEdit(coupon);
    setIsModalOpen(true);
  };

  const handleDeleteAttempt = (coupon: Coupon) => {
    setCouponToDelete(coupon);
  };

  const handleDeleteConfirm = () => {
    if (couponToDelete) {
      const code = couponToDelete.code;
      const result = deleteCoupon(couponToDelete.id || couponToDelete._id!);
      if (result.success) {
        showToast(`Coupon "${code}" deleted successfully.`, 'success');
      } else {
        showToast(result.error || 'Failed to delete coupon.', 'error');
      }
      setCouponToDelete(null);
    }
  };

  const handleToggleStatus = (coupon: Coupon) => {
    const result = toggleStatus(coupon.id || coupon._id!);
    if (result.success) {
      const nextStatus = result.status === 'active' ? 'Activated' : 'Deactivated';
      showToast(`Coupon "${coupon.code}" ${nextStatus}.`, 'success');
    } else {
      showToast(result.error || 'Failed to toggle status.', 'error');
    }
  };

  return (
    <AdminLayout title="Coupon Management">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Coupon Header */}
      <CouponHeader totalCoupons={coupons.length} onCreateClick={handleOpenCreateModal} />

      {/* Coupon Table & Card Listing */}
      <CouponTable
        coupons={coupons}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteAttempt}
        onToggleStatus={handleToggleStatus}
        onCreateClick={handleOpenCreateModal}
      />

      {/* Create / Edit Coupon Modal */}
      <CouponModal
        isOpen={isModalOpen}
        couponToEdit={couponToEdit}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={() => {
          showToast(
            couponToEdit ? 'Coupon updated successfully!' : 'New coupon created successfully!',
            'success'
          );
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!couponToDelete}
        title="Delete Coupon?"
        message={`Are you sure you want to delete coupon "${couponToDelete?.code}"? This action cannot be undone.`}
        confirmText="Yes, Delete Coupon"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCouponToDelete(null)}
      />
    </AdminLayout>
  );
};

export default AdminCouponsPage;
