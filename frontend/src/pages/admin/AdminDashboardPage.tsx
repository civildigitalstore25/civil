import React from 'react';
import { Link } from 'react-router-dom';
import { FolderTree, Package, Plus, ShoppingBag, Sparkles, Star, Users } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminButtonClass } from '../../components/admin/AdminPageToolbar';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/orderService';
import { downloadExcelSheets, downloadJson, exportDateStamp } from '../../utils/adminExport';

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

  const summaryRows = [
    { Metric: 'Products', Value: totalProducts },
    { Metric: 'Best sellers', Value: bestSellerCount },
    { Metric: 'New arrivals', Value: newArrivalCount },
    { Metric: 'Categories', Value: totalCategories },
    { Metric: 'Orders', Value: totalOrders },
    { Metric: 'Users', Value: totalUsers },
  ];
  const orderRows = orders.map((order) => ({
    OrderId: order.id,
    Customer: order.customerName,
    Email: order.customerEmail,
    Total: order.totalAmount,
    Status: order.status,
    Date: new Date(order.createdAt).toLocaleDateString(),
  }));
  const userRows = users.map((user) => ({
    Name: user.name,
    Email: user.email,
    Role: user.role,
    Joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
  }));

  const exportDashboard = (format: 'excel' | 'json') => {
    if (format === 'json') {
      downloadJson({ summary: summaryRows, orders: orderRows, users: userRows }, `dashboard_${exportDateStamp()}`);
      return;
    }
    downloadExcelSheets(
      [
        { name: 'Summary', rows: summaryRows },
        { name: 'Orders', rows: orderRows },
        { name: 'Users', rows: userRows },
      ],
      `dashboard_${exportDateStamp()}`,
    );
  };

  return (
    <AdminLayout title="Admin Overview">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Store overview</h2>
          <p className="mt-1 text-xs text-slate-500">Catalogue, orders, and accounts at a glance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button type="button" onClick={() => exportDashboard('excel')} className={adminButtonClass.excel}>
            Export Excel
          </button>
          <button type="button" onClick={() => exportDashboard('json')} className={adminButtonClass.json}>
            Export JSON
          </button>
          <Link to="/admin/products" className={adminButtonClass.secondary}>Products</Link>
          <Link to="/admin/catalog" className={adminButtonClass.secondary}>Brands</Link>
          <Link to="/admin/orders" className={adminButtonClass.secondary}>Orders</Link>
          <Link to="/admin/products/add" className={adminButtonClass.primary}>
            <Plus className="h-4 w-4" />
            Add product
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Package className="h-5 w-5" />
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Best Sellers</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{bestSellerCount}</h3>
            <span className="text-[10px] font-semibold text-amber-600">Highlighted</span>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[#F5A000]">
            <Star className="h-5 w-5" />
          </div>
        </div>

        {/* New Arrivals */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">New Arrivals</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{newArrivalCount}</h3>
            <span className="text-[10px] font-semibold text-blue-600">Latest items</span>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Categories</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalCategories}</h3>
            <span className="text-[10px] font-semibold text-blue-600">Active groupings</span>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <FolderTree className="h-5 w-5" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalOrders}</h3>
            <span className="text-[10px] font-semibold text-emerald-600">Recorded orders</span>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalUsers}</h3>
            <span className="text-[10px] font-semibold text-purple-600">Registered</span>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="h-5 w-5" />
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
              <p className="text-xs text-slate-500">Latest transactions</p>
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
