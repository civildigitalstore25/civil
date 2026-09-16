import React from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../../components/layout/AnnouncementBar';
import Header from '../../components/layout/Header';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/orderService';

export const MyOrdersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const userOrders = currentUser
    ? orderService.getUserOrders(currentUser.id, currentUser.email)
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#F5A623] selection:text-white">
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        {/* Navigation Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Purchased Downloads</h1>
            <p className="text-xs text-slate-500 font-normal">
              View your order history and access your instant digital downloads.
            </p>
          </div>

          <Link
            to="/account"
            className="text-xs font-bold text-[#F5A623] hover:underline flex items-center gap-1"
          >
            ← Back to Account Profile
          </Link>
        </div>

        {/* Orders List */}
        {userOrders.length > 0 ? (
          <div className="space-y-6">
            {userOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 transition-all hover:shadow-md"
              >
                {/* Order Top Summary Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm">{order.id}</span>
                    <span className="text-slate-400 font-medium ml-3">
                      Ordered on{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 text-sm">
                      Total: ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`inline-block text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-lg shrink-0">
                            📁
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Format: {item.fileFormat || 'ZIP Download'} • Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-xs font-extrabold text-slate-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>

                        <button
                          onClick={() => alert(`Demo Mode: Download starting for "${item.title}". File format: ${item.fileFormat || 'ZIP'}`)}
                          className="bg-[#F5A623] hover:bg-[#e0951a] text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Download Files</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        ) : (
          /* Empty Orders State */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-16 text-center space-y-6 max-w-xl mx-auto my-8 shadow-xs">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-4xl text-[#F5A623]">
              📦
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">No orders found</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                You have not placed any orders yet. Browse our store to get AutoCAD drawings, Revit BIM families, or Excel calculation sheets.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-block bg-[#F5A623] hover:bg-[#e0951a] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Browse Digital Store
            </Link>
          </div>
        )}

      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default MyOrdersPage;
