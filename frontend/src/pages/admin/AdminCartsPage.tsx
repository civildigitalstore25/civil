import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageToolbar, { adminButtonClass } from '../../components/admin/AdminPageToolbar';
import WhatsAppIcon from '../../components/common/WhatsAppIcon';
import { cartService } from '../../services/cartService';
import type { AdminCartRecord } from '../../types/cart';
import { downloadExcel, downloadJson, exportDateStamp } from '../../utils/adminExport';

type CartFilterMode = 'all' | 'multi' | 'high-value' | 'recent-24h';

const formatInr = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatUpdatedAt = (iso: string): string => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const normalizePhoneForWhatsApp = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 10 ? `91${digits}` : digits;
};

export const AdminCartsPage: React.FC = () => {
  const [carts, setCarts] = useState<AdminCartRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<CartFilterMode>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const loadCarts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await cartService.fetchAdminCarts();
      setCarts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch user carts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCarts();
  }, [loadCarts]);

  const toggleExpanded = (cartId: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [cartId]: !prev[cartId],
    }));
  };

  const filteredCarts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return carts.filter((cart) => {
      if (filterMode === 'multi' && cart.totalItems < 2) return false;
      if (filterMode === 'high-value' && cart.totalAmount < 1000) return false;
      if (filterMode === 'recent-24h') {
        const updatedMs = new Date(cart.updatedAt).getTime();
        if (!Number.isFinite(updatedMs) || now - updatedMs > oneDayMs) return false;
      }

      if (!q) return true;

      const userMatch =
        cart.user.name.toLowerCase().includes(q) ||
        cart.user.email.toLowerCase().includes(q) ||
        cart.user.phone.toLowerCase().includes(q);

      if (userMatch) return true;

      return cart.items.some(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.displayName.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.license.toLowerCase().includes(q)
      );
    });
  }, [carts, searchQuery, filterMode]);

  const exportRows = useMemo(
    () =>
      filteredCarts.flatMap((cart) =>
        cart.items.map((item) => ({
          Customer: cart.user.name,
          Email: cart.user.email,
          Phone: cart.user.phone || '-',
          Product: item.name,
          Brand: item.brand,
          Category: item.category,
          License: item.license,
          Qty: item.quantity,
          Price: item.price,
          LineTotal: item.lineTotal,
          CartTotal: cart.totalAmount,
          Updated: formatUpdatedAt(cart.updatedAt),
        }))
      ),
    [filteredCarts]
  );

  return (
    <AdminLayout title="Cart Management">
      <AdminPageToolbar
        title="Cart Management"
        description="Track users with products in cart for manual follow-up"
        count={filteredCarts.length}
        countLabel={filteredCarts.length === 1 ? 'cart found' : 'carts found'}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by user, email, phone, product..."
        filters={[
          {
            id: 'cart-filter-mode',
            ariaLabel: 'Filter user carts',
            value: filterMode,
            onChange: (value) => setFilterMode(value as CartFilterMode),
            options: [
              { value: 'all', label: 'All Carts' },
              { value: 'multi', label: 'Multi-Item (2+)' },
              { value: 'high-value', label: 'High Value (₹1,000+)' },
              { value: 'recent-24h', label: 'Updated Last 24h' },
            ],
          },
        ]}
        onClear={
          searchQuery || filterMode !== 'all'
            ? () => {
                setSearchQuery('');
                setFilterMode('all');
              }
            : undefined
        }
        onExportExcel={() =>
          downloadExcel(exportRows, `user-carts-${exportDateStamp()}.xlsx`, 'User Carts')
        }
        onExportJson={() =>
          downloadJson(filteredCarts, `user-carts-${exportDateStamp()}.json`)
        }
        actions={
          <button
            type="button"
            onClick={() => void loadCarts()}
            disabled={isLoading}
            className={adminButtonClass.secondary}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-xs font-bold text-rose-800">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadCarts()}
            className="self-start sm:self-auto rounded-xl bg-rose-600 px-3.5 py-1.5 text-white hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-20 rounded-2xl border border-slate-200 bg-white animate-pulse"
            />
          ))}
        </div>
      ) : filteredCarts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#F5A000]">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            {carts.length === 0 ? 'No active user carts yet' : 'No matching carts found'}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {carts.length === 0
              ? 'When signed-in customers add products to their cart, they will appear here for follow-up.'
              : 'Try adjusting your search keyword or filter selection.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCarts.map((cart) => {
            const isExpanded = Boolean(expandedIds[cart.id]);
            const waPhone = cart.user.phone ? normalizePhoneForWhatsApp(cart.user.phone) : '';

            return (
              <div
                key={cart.id}
                className={`rounded-2xl border bg-white shadow-xs transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-[#F5A000]/60 ring-1 ring-[#F5A000]/25 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Collapsible Cart Header */}
                <button
                  type="button"
                  onClick={() => toggleExpanded(cart.id)}
                  aria-expanded={isExpanded}
                  className="w-full px-4 sm:px-6 py-4 text-left flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-[15px] font-extrabold text-[#0B1B2E] truncate">
                        {cart.user.name}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-slate-500 break-all">
                      {cart.user.email || 'No email'}
                      {' • '}
                      {cart.user.phone || 'No phone'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 lg:justify-end shrink-0">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                      <ShoppingCart className="h-3.5 w-3.5 text-[#F5A000]" />
                      <span>
                        {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
                      </span>
                    </span>

                    <span className="font-medium text-slate-600">
                      Total:{' '}
                      <strong className="font-extrabold text-slate-900">
                        {formatInr(cart.totalAmount)}
                      </strong>
                    </span>

                    <span className="text-[11px] font-medium text-slate-500">
                      Updated: {formatUpdatedAt(cart.updatedAt)}
                    </span>

                    <span className="ml-auto lg:ml-1 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </div>
                </button>

                {/* Expanded Product List */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-white">
                    {/* Desktop & Tablet Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            <th className="py-3 pl-6 pr-3">Product</th>
                            <th className="py-3 px-3">Brand</th>
                            <th className="py-3 px-3">Category</th>
                            <th className="py-3 px-3">License</th>
                            <th className="py-3 px-3 text-center">Qty</th>
                            <th className="py-3 px-3 text-right">Price</th>
                            <th className="py-3 pl-3 pr-6 text-right">Line Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {cart.items.map((item) => (
                            <tr
                              key={item.id || item.productId}
                              className="hover:bg-amber-50/30 transition-colors"
                            >
                              <td className="py-3.5 pl-6 pr-3 font-bold text-[#0B1B2E]">
                                <div className="flex items-center gap-3 min-w-0">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 object-contain shrink-0 p-0.5"
                                    />
                                  )}
                                  <span className="truncate max-w-xs">{item.name}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-slate-600 font-medium capitalize">
                                {item.brand || '-'}
                              </td>
                              <td className="py-3.5 px-3 text-slate-600 font-medium">
                                {item.category || '-'}
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                                  {item.license || 'Standard'}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                                {item.quantity}
                              </td>
                              <td className="py-3.5 px-3 text-right font-semibold text-slate-700">
                                {formatInr(item.price)}
                              </td>
                              <td className="py-3.5 pl-3 pr-6 text-right font-extrabold text-[#0B1B2E]">
                                {formatInr(item.lineTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Product Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                      {cart.items.map((item) => (
                        <div key={item.id || item.productId} className="p-4 space-y-2 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-[#0B1B2E] leading-snug">{item.name}</p>
                            <span className="shrink-0 font-extrabold text-[#0B1B2E]">
                              {formatInr(item.lineTotal)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span>
                              Brand: <strong className="text-slate-700">{item.brand || '-'}</strong>
                            </span>
                            <span>
                              Category:{' '}
                              <strong className="text-slate-700">{item.category || '-'}</strong>
                            </span>
                            <span>
                              License:{' '}
                              <strong className="text-amber-700">{item.license || 'Standard'}</strong>
                            </span>
                            <span>
                              Qty: <strong className="text-slate-700">{item.quantity}</strong> ×{' '}
                              {formatInr(item.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Follow-up Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 sm:px-6 py-2.5 text-[11px]">
                      <span className="font-semibold text-slate-500">
                        Manual Follow-up Actions:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {cart.user.email && (
                          <a
                            href={`mailto:${cart.user.email}?subject=${encodeURIComponent('Complete your order at Civil Digital Store')}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-bold text-slate-700 hover:border-[#F5A000] hover:text-[#B45309] transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>Email</span>
                          </a>
                        )}
                        {cart.user.phone && (
                          <a
                            href={`tel:${cart.user.phone}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>Call</span>
                          </a>
                        )}
                        {waPhone && (
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                              `Hi ${cart.user.name}, we noticed you left ${cart.items
                                .map((i) => i.name)
                                .join(', ')} in your Civil Digital Store cart. Let us know if you need any help completing your order!`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                          >
                            <WhatsAppIcon className="h-3.5 w-3.5 fill-emerald-700" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCartsPage;
