import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageToolbar from '../../components/admin/AdminPageToolbar';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import type { Order, OrderStatus } from '../../types/order';
import { downloadExcel, downloadJson, exportDateStamp } from '../../utils/adminExport';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() => orderService.getOrders());
  const [serverOrderIds, setServerOrderIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const mergeOrders = (remoteOrders: Order[]) => {
    const remoteIds = new Set(remoteOrders.map((order) => order.id));
    const localOnly = orderService.getOrders().filter((order) => !remoteIds.has(order.id));
    setServerOrderIds(remoteIds);
    setOrders([...remoteOrders, ...localOnly]);
  };

  useEffect(() => {
    let cancelled = false;
    paymentService
      .adminOrders()
      .then((remoteOrders) => {
        if (!cancelled) mergeOrders(remoteOrders);
      })
      .catch(() => {
        if (!cancelled) setOrders(orderService.getOrders());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    if (serverOrderIds.has(orderId)) {
      paymentService
        .updateStatus(orderId, newStatus)
        .then((updated) => {
          setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
        })
        .catch(() => undefined);
      return;
    }

    orderService.updateOrderStatus(orderId, newStatus);
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
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
    Payment: order.paymentMethod,
    Paid: order.paymentState === 'COMPLETED' ? 'Completed' : order.paymentState === 'FAILED' ? 'Failed' : 'Pending',
  }));

  return (
    <AdminLayout title="Order Management">
      <AdminPageToolbar
        title="Orders"
        description="Search by order or customer, filter by status, and export the current list."
        count={filteredOrders.length}
        countLabel="orders"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search order ID, name, or email"
        filters={[
          {
            id: 'status',
            ariaLabel: 'Filter by order status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: [
              { value: 'All', label: 'All status' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Processing', label: 'Processing' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ],
          },
        ]}
        onClear={() => {
          setSearchQuery('');
          setSelectedStatus('All');
        }}
        onExportExcel={() => downloadExcel(orderExportRows, 'Orders', `orders_${exportDateStamp()}`)}
        onExportJson={() => downloadJson(orderExportRows, `orders_${exportDateStamp()}`)}
      />

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
                      {order.paymentState === 'COMPLETED' && (
                        <span className="inline-block mt-1 ml-1 text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                          Paid · Completed
                        </span>
                      )}
                    </td>

                    {/* Customer Details */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500">{order.customerEmail}</div>
                      <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
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
                            Order status
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
