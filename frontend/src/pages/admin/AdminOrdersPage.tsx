import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShoppingBag,
  X,
  XCircle,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminOrderImportModal from '../../components/admin/AdminOrderImportModal';
import AdminPageToolbar from '../../components/admin/AdminPageToolbar';
import { orderService } from '../../services/orderService';
import type { Order, OrderStatus } from '../../types/order';
import { downloadExcel, downloadJson, exportDateStamp } from '../../utils/adminExport';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() => orderService.getOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Success / info toast banner
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  const refreshOrders = () => {
    void orderService.fetchAdminOrders().then((latest) => {
      setOrders(latest);
    });
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  // Dismiss feedback after 5 seconds
  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = setTimeout(() => setFeedbackMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [feedbackMessage]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const res = orderService.updateOrderStatus(orderId, newStatus);
    if (res.success) {
      setFeedbackMessage({
        type: 'success',
        text: `Order ${orderId} status updated to ${newStatus}.`,
      });
      refreshOrders();
    }
  };

  // KPI / Summary card statistics
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const totalAmount = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const completedOrders = orders.filter((o) => o.status === 'Completed');
    const completedCount = completedOrders.length;
    const completedAmount = completedOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing');
    const pendingCount = pendingOrders.length;
    const pendingAmount = pendingOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const cancelledOrders = orders.filter((o) => o.status === 'Cancelled');
    const cancelledCount = cancelledOrders.length;
    const cancelledAmount = cancelledOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return {
      total: { count: totalCount, amount: totalAmount },
      completed: { count: completedCount, amount: completedAmount },
      pending: { count: pendingCount, amount: pendingAmount },
      cancelled: { count: cancelledCount, amount: cancelledAmount },
    };
  }, [orders]);

  // Filtered orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.orderId && o.orderId.toLowerCase().includes(q)) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.includes(q);

      const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;

      return matchesQuery && matchesStatus;
    });
  }, [orders, searchQuery, selectedStatus]);

  // Reset pagination to page 1 whenever search query or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = filteredOrders.length > 0 ? (validCurrentPage - 1) * itemsPerPage : 0;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  const displayEndIndex = Math.min(startIndex + itemsPerPage, filteredOrders.length);

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const orderExportRows = filteredOrders.map((order) => ({
    OrderId: order.id,
    Date: new Date(order.createdAt).toLocaleString('en-IN'),
    Customer: order.customerName,
    Email: order.customerEmail,
    Phone: order.customerPhone,
    Address: order.shippingAddress || '',
    Items: order.items.map((item) => `${item.quantity}x ${item.title}`).join('; '),
    Subtotal: order.subtotal,
    GST: order.gst,
    Total: order.totalAmount,
    Status: order.status,
    PaymentMethod: order.paymentMethod,
    PaymentStatus: order.paymentStatus || (order.status === 'Completed' ? 'Paid' : 'Pending'),
  }));

  const handleImportComplete = (result: { inserted: number; updated: number }) => {
    setFeedbackMessage({
      type: 'success',
      text: `Excel Import Completed: ${result.inserted} new orders added, ${result.updated} existing orders updated.`,
    });
    refreshOrders();
  };

  return (
    <AdminLayout title="Order Management">
      {/* Toast / Notification Banner */}
      {feedbackMessage && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-bold transition-all shadow-xs ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI / Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <button
          type="button"
          onClick={() => setSelectedStatus('All')}
          className={`text-left bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            selectedStatus === 'All'
              ? 'border-[#F5A000] ring-2 ring-[#F5A000]/30 shadow-md'
              : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Orders
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {stats.total.count}
              </h3>
              <p className="text-xs font-extrabold text-[#F5A000] mt-1">
                ₹{stats.total.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-2.5">
            <span>All store orders</span>
            <span
              className={`font-bold ${
                selectedStatus === 'All' ? 'text-[#F5A000]' : 'text-slate-500'
              }`}
            >
              {selectedStatus === 'All' ? 'Active Filter' : 'Filter by all'}
            </span>
          </div>
        </button>

        {/* Success / Completed Orders Card */}
        <button
          type="button"
          onClick={() => setSelectedStatus('Completed')}
          className={`text-left bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            selectedStatus === 'Completed'
              ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
              : 'border-slate-200/80 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Success / Completed
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {stats.completed.count}
              </h3>
              <p className="text-xs font-extrabold text-emerald-600 mt-1">
                ₹{stats.completed.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-2.5">
            <span>Delivered & Paid</span>
            <span
              className={`font-bold ${
                selectedStatus === 'Completed' ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {selectedStatus === 'Completed' ? 'Active Filter' : 'Filter success'}
            </span>
          </div>
        </button>

        {/* Pending / Processing Orders Card */}
        <button
          type="button"
          onClick={() => setSelectedStatus('Pending')}
          className={`text-left bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            selectedStatus === 'Pending' || selectedStatus === 'Processing'
              ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-md'
              : 'border-slate-200/80 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                Pending / Processing
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {stats.pending.count}
              </h3>
              <p className="text-xs font-extrabold text-amber-600 mt-1">
                ₹{stats.pending.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-2.5">
            <span>Action needed</span>
            <span
              className={`font-bold ${
                selectedStatus === 'Pending' || selectedStatus === 'Processing'
                  ? 'text-amber-600'
                  : 'text-slate-500'
              }`}
            >
              {selectedStatus === 'Pending' || selectedStatus === 'Processing'
                ? 'Active Filter'
                : 'Filter pending'}
            </span>
          </div>
        </button>

        {/* Cancelled Orders Card */}
        <button
          type="button"
          onClick={() => setSelectedStatus('Cancelled')}
          className={`text-left bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            selectedStatus === 'Cancelled'
              ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-md'
              : 'border-slate-200/80 hover:border-rose-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                Cancelled / Failed
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {stats.cancelled.count}
              </h3>
              <p className="text-xs font-extrabold text-rose-600 mt-1">
                ₹{stats.cancelled.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-2.5">
            <span>Voided or cancelled</span>
            <span
              className={`font-bold ${
                selectedStatus === 'Cancelled' ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              {selectedStatus === 'Cancelled' ? 'Active Filter' : 'Filter cancelled'}
            </span>
          </div>
        </button>
      </div>

      {/* Toolbar with Search, Status Filter, Import Excel, Export Excel */}
      <AdminPageToolbar
        title="Orders"
        description="Search by order ID or customer, filter by status, import from spreadsheet, or export records."
        count={filteredOrders.length}
        countLabel="orders"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search order ID, customer name, email, or phone"
        filters={[
          {
            id: 'status',
            ariaLabel: 'Filter by order status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: [
              { value: 'All', label: 'All status' },
              { value: 'Completed', label: 'Completed (Success)' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Processing', label: 'Processing' },
              { value: 'Cancelled', label: 'Cancelled' },
            ],
          },
        ]}
        onClear={() => {
          setSearchQuery('');
          setSelectedStatus('All');
        }}
        onImportExcel={() => setIsImportModalOpen(true)}
        onExportExcel={() => downloadExcel(orderExportRows, 'Orders', `orders_${exportDateStamp()}`)}
        onExportJson={() => downloadJson(orderExportRows, `orders_${exportDateStamp()}`)}
      />

      {/* Orders Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Products / Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors items-start">
                    {/* Order ID & Date */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-extrabold text-slate-900">{order.id}</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-1">
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {order.paymentMethod}
                      </span>
                    </td>

                    {/* Customer Details */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{order.customerEmail}</div>
                      {order.customerPhone && (
                        <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                      )}
                      {order.shippingAddress && (
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {order.shippingAddress}
                        </div>
                      )}
                    </td>

                    {/* Products */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      <div className="space-y-1.5">
                        {order.items.map((item) => (
                          <div key={item.id || item.productId} className="flex items-center gap-2 text-slate-700">
                            <span className="font-bold text-[#F5A000] shrink-0">{item.quantity}x</span>
                            <span className="font-semibold truncate">{item.title}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-extrabold text-base text-slate-900">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Subtotal: ₹{order.subtotal} + GST: ₹{order.gst}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-2">
                        <span
                          className={`inline-block text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                        <div className="pt-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Change Status:
                          </label>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
                          >
                            <option value="Completed">Completed</option>
                            <option value="Processing">Processing</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                      <p className="text-sm font-bold text-slate-600">No orders found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try adjusting your search query or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing {filteredOrders.length > 0 ? startIndex + 1 : 0} to {displayEndIndex} of{' '}
              {filteredOrders.length} orders
            </span>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="text-slate-400">Rows:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 5) return true;
                  if (p === 1 || p === totalPages) return true;
                  return Math.abs(p - validCurrentPage) <= 1;
                })
                .map((pageNum, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && pageNum - prev > 1;

                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsis && <span className="px-1 text-slate-400 font-bold">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          validCurrentPage === pageNum
                            ? 'bg-[#F5A000] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Excel Import Modal */}
      <AdminOrderImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
        importFn={(imported) => orderService.importOrders(imported)}
      />
    </AdminLayout>
  );
};

export default AdminOrdersPage;
