import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Order, OrderStatus } from '../../types/order';
import { downloadExcel } from '../../utils/adminExport';

interface AdminOrderImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (result: { inserted: number; updated: number }) => void;
  importFn: (orders: Partial<Order>[]) => { inserted: number; updated: number; orders: Order[] };
}

interface ParsedOrderPreview {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  itemsSummary: string;
  totalAmount: number;
  subtotal: number;
  gst: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
}

export const AdminOrderImportModal: React.FC<AdminOrderImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  importFn,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedOrderPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setErrorMessage(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const downloadSampleTemplate = () => {
    const sampleRows = [
      {
        OrderId: 'ORD-2026-101',
        Date: new Date().toISOString().slice(0, 10),
        CustomerName: 'Rahul Sharma',
        CustomerEmail: 'rahul.sharma@example.com',
        CustomerPhone: '9876543210',
        ShippingAddress: '12, Sector 15, Pune, Maharashtra',
        Items: '1x AutoCAD 2026 Complete Bundle; 1x Revit Architecture Template',
        Subtotal: 2999,
        GST: 539,
        TotalAmount: 3538,
        Status: 'Completed',
        PaymentMethod: 'PhonePe UPI',
        PaymentStatus: 'Paid',
      },
      {
        OrderId: 'ORD-2026-102',
        Date: new Date().toISOString().slice(0, 10),
        CustomerName: 'Priya Patel',
        CustomerEmail: 'priya.patel@example.com',
        CustomerPhone: '9876543211',
        ShippingAddress: 'A-201, Green Heights, Ahmedabad, Gujarat',
        Items: '1x STAAD Pro Advanced Masterclass',
        Subtotal: 1499,
        GST: 269,
        TotalAmount: 1768,
        Status: 'Pending',
        PaymentMethod: 'Online',
        PaymentStatus: 'Pending',
      },
      {
        OrderId: 'ORD-2026-103',
        Date: new Date().toISOString().slice(0, 10),
        CustomerName: 'Anil Kumar',
        CustomerEmail: 'anil.k@example.com',
        CustomerPhone: '9876543212',
        ShippingAddress: 'Bengaluru, Karnataka',
        Items: '1x Estimating & Costing Excel Sheets',
        Subtotal: 999,
        GST: 179,
        TotalAmount: 1178,
        Status: 'Cancelled',
        PaymentMethod: 'Online',
        PaymentStatus: 'Failed',
      },
    ];

    downloadExcel(sampleRows, 'Orders_Template', 'orders_import_template');
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error('The uploaded spreadsheet contains no sheets.');
        }

        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('The sheet is empty or contains no valid rows.');
        }

        const normalized: ParsedOrderPreview[] = rawJson.map((row, index) => {
          // Normalize column keys case-insensitively
          const getVal = (...keys: string[]): any => {
            for (const key of keys) {
              const lowerKey = key.toLowerCase().replace(/[\s_-]/g, '');
              for (const rowKey of Object.keys(row)) {
                if (rowKey.toLowerCase().replace(/[\s_-]/g, '') === lowerKey) {
                  return row[rowKey];
                }
              }
            }
            return '';
          };

          const rawId = getVal('orderid', 'order_id', 'id', 'order') || `ORD-${Date.now().toString(36).toUpperCase()}-${index + 100}`;
          const customerName = getVal('customername', 'customer', 'name', 'buyer') || 'Customer';
          const customerEmail = getVal('customeremail', 'email', 'mail') || '';
          const customerPhone = String(getVal('customerphone', 'phone', 'mobile', 'contact') || '');
          const shippingAddress = String(getVal('shippingaddress', 'address', 'city', 'location') || '');
          const itemsRaw = String(getVal('items', 'products', 'product', 'itemsordered') || 'Digital Engineering Package');
          const totalAmount = Number(getVal('totalamount', 'total', 'amount', 'price')) || 0;
          const subtotal = Number(getVal('subtotal', 'sub_total')) || Math.round(totalAmount / 1.18);
          const gst = Number(getVal('gst', 'tax')) || Math.max(0, totalAmount - subtotal);

          const rawStatus = String(getVal('status', 'orderstatus', 'state') || 'Completed').toLowerCase().trim();
          let status: OrderStatus = 'Pending';
          if (rawStatus === 'completed' || rawStatus === 'paid' || rawStatus === 'success' || rawStatus === 'delivered') {
            status = 'Completed';
          } else if (rawStatus === 'processing' || rawStatus === 'in progress') {
            status = 'Processing';
          } else if (rawStatus === 'cancelled' || rawStatus === 'canceled' || rawStatus === 'failed' || rawStatus === 'rejected') {
            status = 'Cancelled';
          }

          const paymentMethod = String(getVal('paymentmethod', 'payment', 'method', 'mode') || 'Online');
          const paymentStatus = String(getVal('paymentstatus', 'pay_status') || (status === 'Completed' ? 'Paid' : 'Pending'));

          return {
            id: String(rawId).trim(),
            customerName: String(customerName).trim(),
            customerEmail: String(customerEmail).trim(),
            customerPhone,
            shippingAddress,
            itemsSummary: itemsRaw,
            totalAmount,
            subtotal,
            gst,
            status,
            paymentMethod,
            paymentStatus,
          };
        });

        if (normalized.length === 0) {
          throw new Error('Could not parse any valid order rows from the file.');
        }

        setParsedRows(normalized);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to read or parse the spreadsheet file.');
        setParsedRows([]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Error reading file. Please check file permissions or try another file.');
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    try {
      const ordersToImport: Partial<Order>[] = parsedRows.map((r) => {
        // Parse items string (e.g. "1x AutoCAD; 2x Revit") into items array
        const rawItems = r.itemsSummary.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
        const items = rawItems.length > 0 ? rawItems.map((str, idx) => {
          const match = str.match(/^(\d+)x\s*(.*)$/i);
          const quantity = match ? Number(match[1]) || 1 : 1;
          const title = match ? match[2].trim() : str;
          return {
            id: `item-${idx}`,
            productId: `prod-${idx}`,
            title: title || 'Civil Engineering Package',
            price: r.totalAmount / (rawItems.length || 1),
            quantity,
            fileFormat: 'ZIP Download',
            hasDownload: true,
          };
        }) : [
          {
            id: 'item-1',
            productId: 'digital-product',
            title: r.itemsSummary || 'Civil Engineering Package',
            price: r.totalAmount,
            quantity: 1,
            fileFormat: 'ZIP Download',
            hasDownload: true,
          },
        ];

        return {
          id: r.id,
          orderId: r.id,
          customerName: r.customerName,
          customerEmail: r.customerEmail,
          customerPhone: r.customerPhone,
          shippingAddress: r.shippingAddress,
          items,
          subtotal: r.subtotal,
          gst: r.gst,
          totalAmount: r.totalAmount,
          status: r.status,
          paymentMethod: r.paymentMethod,
          paymentStatus: r.paymentStatus,
          createdAt: new Date().toISOString(),
        };
      });

      const res = importFn(ordersToImport);
      onImportComplete(res);
      handleClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to import orders. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Import Orders from Excel</h3>
              <p className="text-xs text-slate-500">
                Bulk upload orders or update statuses via .xlsx, .xls, or .csv
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Instructions and Download Template Bar */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#F5A000]" />
                <span>Need the standard Excel format?</span>
              </div>
              <p className="text-amber-800/90 text-[11px]">
                Download our sample template with pre-filled columns for orders, customers, amounts, and statuses.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-amber-100/50 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#F5A000]" />
              <span>Download Template (.xlsx)</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#F5A000] bg-amber-50/50 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">{selectedFile.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click or drag to replace
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  Click to browse or drag and drop your spreadsheet here
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Supports Microsoft Excel (.xlsx, .xls) and CSV files
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Preview ({parsedRows.length} orders found)</span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  Showing top {Math.min(parsedRows.length, 5)} rows
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-400">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-bold text-slate-900">{row.id}</td>
                        <td className="py-2 px-3 text-slate-700 font-medium">{row.customerName}</td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-[180px]">
                          {row.itemsSummary}
                        </td>
                        <td className="py-2 px-3 font-extrabold text-slate-900">
                          ₹{row.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              row.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : row.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Notice:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Orders with existing Order IDs in the system will have their status & details updated.</li>
                  <li>Orders with new Order IDs will be inserted as new records.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || isProcessing}
            onClick={handleConfirmImport}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#F5A000] hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Orders` : 'Orders'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderImportModal;

