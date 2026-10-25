import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Download,
  Info,
  Calendar,
  Building,
  CheckCircle2
} from 'lucide-react';
import { Order, Company, Language } from '../types';
import { translations } from '../translations';

interface OrdersViewProps {
  company: Company;
  orders: Order[];
  currentLang: Language;
  onSelectOrder: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  company,
  orders,
  currentLang,
  onSelectOrder,
}) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'fa';
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currencySymbol = company.currency === 'USD' ? '$' : company.currency;

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchComp = order.clientCompany?.toLowerCase().includes(q) || false;
      const matchDest = order.customerLocation.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchComp && !matchDest) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Client Company', 'Destination', 'Total', 'Status', 'Payment'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName}"`,
      `"${o.clientCompany || ''}"`,
      `"${o.customerLocation}"`,
      o.totalAmount,
      o.status,
      o.paymentStatus
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${company.slug}-orders-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors: Record<string, string> = {
    shipped: 'bg-blue-50 text-blue-700 border-blue-200',
    delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    processing: 'bg-[#C9A96E]/15 text-[#8C6D2E] border-[#C9A96E]/30',
    pending: 'bg-[#F5F7FA] text-[#687386] border-[#E2E8F0]',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#172033] tracking-tight">
              {t.tabOrders || (isRtl ? 'سفارشات و محموله‌های تجارتی' : 'Commercial Orders & Consignments')}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#F5F7FA] text-[#101C35] border border-[#E2E8F0]">
              {filteredOrders.length} {isRtl ? 'سفارش' : (filteredOrders.length === 1 ? 'Order' : 'Orders')}
            </span>
          </div>
          <p className="text-xs text-[#687386] mt-1">
            {isRtl
              ? 'مدیریت بارنامه‌های صادراتی، پیگیری گمرکی و بازبینی فاکتورهای عمده‌فروشی'
              : 'Manage wholesale shipments, customs clearances, and inspect commercial invoices.'}
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#172033] border border-[#E2E8F0] transition flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <Download className="w-4 h-4 text-[#687386]" />
          <span>{isRtl ? 'خروجی اکسل / CSV' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Demo Notice */}
      <div className="px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#687386] text-xs flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#C9A96E] shrink-0" />
          <span>
            <strong className="text-[#172033]">{isRtl ? 'محیط آزمایشی:' : 'Demo Staging:'}</strong>{' '}
            {isRtl
              ? `سفارشات زیر فرآیند ارسال و صدور پیش‌فاکتور برای ${company.name} را شبیه‌سازی می‌کنند.`
              : `Consignments below illustrate realistic B2B consignment workflows for ${company.name}.`}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D2E] bg-[#F5F7FA] px-2 py-0.5 rounded border border-[#C9A96E]/30">
          {isRtl ? 'داده‌های نمونه' : 'DEMO DATA'}
        </span>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-[#F5F7FA] p-1 rounded-xl border border-[#E2E8F0] text-xs font-semibold overflow-x-auto">
          {['all', 'processing', 'shipped', 'delivered', 'pending'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#101C35] text-white shadow-xs font-bold'
                  : 'text-[#687386] hover:text-[#172033]'
              }`}
            >
              {isRtl
                ? { all: 'همه', processing: 'در حال پردازش', shipped: 'ارسال شده', delivered: 'تحویل شده', pending: 'در انتظار' }[st] || st
                : st}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex-1 max-w-xs">
          <Search
            className={`w-4 h-4 text-[#687386] absolute top-1/2 -translate-y-1/2 pointer-events-none ${
              isRtl ? 'right-3' : 'left-3'
            }`}
          />
          <input
            type="text"
            placeholder={isRtl ? 'جستجو بر اساس شماره سفارش، مشتری، کشور...' : 'Search by order #, client, country...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-[#172033] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#101C35] ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F7FA] border-b border-[#E2E8F0] text-[11px] font-bold text-[#687386] uppercase tracking-wider">
                <th className="py-3 px-4">{isRtl ? 'سفارش' : 'Order'}</th>
                <th className="py-3 px-4">{isRtl ? 'مشتری / سازمان خریدار' : 'Client Organization'}</th>
                <th className="py-3 px-4">{isRtl ? 'اقلام محموله' : 'Consignment Items'}</th>
                <th className="py-3 px-4">{isRtl ? 'مبلغ و تسویه' : 'Amount & Payment'}</th>
                <th className="py-3 px-4">{isRtl ? 'باربری و رهگیری' : 'Carrier & Tracking'}</th>
                <th className="py-3 px-4">{isRtl ? 'وضعیت' : 'Status'}</th>
                <th className="py-3 px-4 text-right rtl:text-left">{isRtl ? 'مشاهده' : 'Invoice'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="hover:bg-[#F5F7FA] transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#172033] block tabular-nums">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-[#687386]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-[#172033] block font-bold">
                        {order.customerName}
                      </strong>
                      <span className="text-[#687386] block text-[11px]">
                        {order.clientCompany || order.customerLocation}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="text-[#172033] truncate">
                          <span className="font-mono font-bold">{it.quantity}x</span> {it.productName}
                        </div>
                      ))}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#172033] text-sm block tabular-nums">
                        {order.currency}{order.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-800 capitalize font-medium">
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[#172033] font-medium block truncate max-w-[150px]">
                        {order.shippingMethod}
                      </span>
                      {order.trackingNumber && (
                        <span className="font-mono text-[10px] text-[#101C35] block font-semibold">
                          {order.trackingNumber}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                          statusColors[order.status] || 'bg-[#F5F7FA] text-[#687386]'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right rtl:text-left">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(order);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#101C35] hover:bg-[#192b52] text-white transition shadow-2xs cursor-pointer"
                      >
                        {isRtl ? 'پیش‌فاکتور' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#687386]">
                    {isRtl ? 'هیچ سفارشی با شرایط جستجو یافت نشد.' : 'No orders match your filter criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
