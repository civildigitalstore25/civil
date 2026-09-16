import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/orderService';

export const AdminDashboardPage: React.FC = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { users } = useAuth();
  const orders = orderService.getOrders();

  const totalProducts = products.length;
  const bestSellerCount = products.filter((p) => (p.isBestSeller || p.badge === 'Bestseller') && p.status !== 'inactive').length;
  const newArrivalCount = products.filter((p) => (p.isNewArrival || p.badge === 'New') && p.status !== 'inactive').length;
  const totalCategories = categories.length;
  const totalOrders = orders.length;
  const totalUsers = users.length;

  const recentOrders = orders.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <AdminLayout title="Admin Overview">
      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Store Performance
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Real-time metric summary powered by LocalStorage architecture.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/products/add"
            className="bg-[#F5A000] hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/products"
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/categories"
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all"
          >
            Manage Categories
          </Link>
          <Link
            to="/admin/orders"
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Products */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Products</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalProducts}</h3>
            <span className="text-[10px] font-semibold text-emerald-600">In catalogue</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-lg shrink-0">
            📦
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Best Sellers</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{bestSellerCount}</h3>
            <span className="text-[10px] font-semibold text-amber-600">Highlighted</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F5A000] flex items-center justify-center text-lg shrink-0">
            ★
          </div>
        </div>

        {/* New Arrivals */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">New Arrivals</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{newArrivalCount}</h3>
            <span className="text-[10px] font-semibold text-blue-600">Latest items</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
            ✨
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Categories</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalCategories}</h3>
            <span className="text-[10px] font-semibold text-blue-600">Active groupings</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg shrink-0">
            📂
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalOrders}</h3>
            <span className="text-[10px] font-semibold text-emerald-600">Recorded orders</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
            🛍️
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalUsers}</h3>
            <span className="text-[10px] font-semibold text-purple-600">Registered</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
            👥
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Orders + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Orders</h3>
              <p className="text-xs text-slate-500">Latest transactions saved in LocalStorage</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-[#F5A000] hover:underline">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{order.id}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        <div>{order.customerName}</div>
                        <div className="text-[10px] text-slate-400">{order.customerEmail}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                      No orders found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users List (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Registered Users</h3>
              <p className="text-xs text-slate-500">Recently created accounts</p>
            </div>
            <Link to="/admin/users" className="text-xs font-bold text-[#F5A000] hover:underline">
              Manage →
            </Link>
          </div>

          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-[#0B1B2E] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-amber-400/40">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 uppercase ${
                    user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
