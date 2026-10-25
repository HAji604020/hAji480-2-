import React from 'react';
import { X, CheckCircle2, Clock, Truck, Printer, Phone, Mail, Building, MapPin, Package } from 'lucide-react';
import { Order, Company } from '../types';

interface OrderDetailModalProps {
  order: Order | null;
  company: Company;
  onClose: () => void;
  isRtl?: boolean;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, company, onClose, isRtl = false }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const phone = order.customerPhone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello ${order.customerName}, regarding your consignment ${order.orderNumber} with ${company.name}...`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-[#101C35]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F5F7FA]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#687386] uppercase">
                {isRtl ? 'پیش‌فاکتور رسمی بازرگانی' : 'Commercial Consignment'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#C9A96E]/20 text-[#8C6D2E] border border-[#C9A96E]/40">
                {order.isDemo ? (isRtl ? 'سفارش آزمایشی' : 'DEMO INVOICE') : 'OFFICIAL'}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-[#172033] tracking-tight mt-0.5">
              {isRtl ? `سفارش ${order.orderNumber}` : `Order ${order.orderNumber}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#687386] hover:text-[#172033] hover:bg-[#E2E8F0] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status & Carrier Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#687386] block">
                {isRtl ? 'وضعیت سفارش' : 'Status'}
              </span>
              <span className="font-bold text-[#172033] capitalize text-sm">{order.status}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#687386] block">
                {isRtl ? 'وضعیت پرداخت' : 'Payment'}
              </span>
              <span className="font-bold text-emerald-800 capitalize text-sm">{order.paymentStatus}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#687386] block">
                {isRtl ? 'تاریخ ثبت' : 'Order Date'}
              </span>
              <span className="font-mono text-[#172033] text-xs">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#687386] block">
                {isRtl ? 'باربری و ارسال' : 'Shipping Carrier'}
              </span>
              <span className="font-semibold text-[#172033] text-xs truncate block">
                {order.shippingMethod}
              </span>
            </div>
          </div>

          {/* Customer & Destination Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-2 bg-white">
              <span className="text-[10px] uppercase font-bold text-[#687386] block">
                {isRtl ? 'مشخصات خریدار / شرکت' : 'Client Details'}
              </span>
              <strong className="text-sm font-bold text-[#172033] block">{order.customerName}</strong>
              {order.clientCompany && (
                <div className="flex items-center gap-1.5 text-[#687386]">
                  <Building className="w-3.5 h-3.5 text-[#687386]" />
                  <span>{order.clientCompany}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[#687386]">
                <Mail className="w-3.5 h-3.5 text-[#687386]" />
                <span className="truncate">{order.customerEmail}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#687386]">
                <Phone className="w-3.5 h-3.5 text-[#687386]" />
                <span>{order.customerPhone}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-2 bg-white">
              <span className="text-[10px] uppercase font-bold text-[#687386] block">
                {isRtl ? 'مقصد تحویل بار' : 'Delivery Destination'}
              </span>
              <div className="flex items-start gap-1.5 text-[#172033]">
                <MapPin className="w-4 h-4 text-[#C9A96E] shrink-0 mt-0.5" />
                <span>{order.customerLocation}</span>
              </div>
              {order.trackingNumber && (
                <div className="pt-2 border-t border-[#F5F7FA]">
                  <span className="text-[10px] uppercase font-bold text-[#687386] block">
                    {isRtl ? 'شماره رهگیری بارنامه' : 'Consignment Tracking'}
                  </span>
                  <span className="font-mono font-bold text-[#101C35] text-xs">
                    {order.trackingNumber}
                  </span>
                </div>
              )}
              {order.notes && (
                <div className="pt-2 border-t border-[#F5F7FA] text-[#687386] italic text-[11px]">
                  &ldquo;{order.notes}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
            <div className="px-4 py-2.5 bg-[#F5F7FA] border-b border-[#E2E8F0] font-bold text-[#172033] text-xs">
              {isRtl ? 'اقلام سفارش داده‌شده و نرخ‌های بازرگانی' : 'Ordered Items & Commercial Pricing'}
            </div>
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[10px] font-bold text-[#687386] uppercase bg-[#F5F7FA]/50">
                  <th className="py-2.5 px-4">{isRtl ? 'شرح کالا' : 'Item Description'}</th>
                  <th className="py-2.5 px-3 text-center">{isRtl ? 'تعداد' : 'Qty'}</th>
                  <th className="py-2.5 px-3 text-right rtl:text-left">{isRtl ? 'قیمت واحد' : 'Unit Price'}</th>
                  <th className="py-2.5 px-4 text-right rtl:text-left">{isRtl ? 'مجموع' : 'Total'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F5F7FA]/70">
                    <td className="py-3 px-4 font-semibold text-[#172033]">
                      {item.productName}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-[#687386]">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right rtl:text-left font-mono tabular-nums text-[#687386]">
                      {order.currency}{item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right rtl:text-left font-mono font-bold tabular-nums text-[#172033]">
                      {order.currency}{item.totalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#F5F7FA] border-t border-[#E2E8F0] font-bold">
                  <td colSpan={3} className="py-3 px-4 text-right rtl:text-left text-[#172033]">
                    {isRtl ? 'مجموع کل فاکتور:' : 'Grand Total:'}
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left font-mono text-sm tabular-nums text-[#101C35]">
                    {order.currency}{order.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F5F7FA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isRtl ? 'ارتباط واتساپ با خریدار' : 'Contact Client'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F5F7FA] text-[#172033] font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#687386]" />
              <span>{isRtl ? 'چاپ فاکتور' : 'Print Invoice'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#101C35] hover:bg-[#192b52] text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            {isRtl ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
