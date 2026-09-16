import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { orderService } from '../../services/orderService';
import type { Order, OrderStatus } from '../../types/order';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() => orderService.getOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const refreshOrders = () => {
    setOrders(orderService.getOrders());
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    orderService.updateOrderStatus(orderId, newStatus);
    refreshOrders();
  };

  const filteredOrders = orders.filter((o) => {
    const matchesQuery =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;

    return matchesQuery && matchesStatus;
  });

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

  return (
    <AdminLayout title="Order Management">
      {/* Top Header & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Customer Orders ({filteredOrders.length})</h2>
            <p className="text-xs text-slate-500">Track and manage digital product order statuses.</p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search Order ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-60 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
            />

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Products / Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status & Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
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
                      <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {order.paymentMethod}
                      </span>
                    </td>

                    {/* Customer Details */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500">{order.customerEmail}</div>
                      <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                      {order.shippingAddress && (
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          📍 {order.shippingAddress}
                        </div>
                      )}
                    </td>

                    {/* Products */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      <div className="space-y-1.5">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-slate-700">
                            <span className="font-bold text-amber-600 shrink-0">{item.quantity}x</span>
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
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                    No orders found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
