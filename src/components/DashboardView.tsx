import React, { useState } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  Eye,
  Clock,
  CheckCircle2,
  Info,
  Building,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Search,
  MessageSquare
} from 'lucide-react';
import { Company, Product, Order, Customer, ActivityItem, Language } from '../types';
import { translations } from '../translations';

interface DashboardViewProps {
  company: Company;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  activities: ActivityItem[];
  salesTrend: { month: string; revenue: number; orders: number; target: number }[];
  currentLang: Language;
  onNavigateTab: (tabId: string) => void;
  onOpenAddProduct: () => void;
  onTogglePublicView: () => void;
  onSelectOrderDetails: (order: Order) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  products,
  orders,
  customers,
  activities,
  salesTrend,
  currentLang,
  onNavigateTab,
  onOpenAddProduct,
  onTogglePublicView,
  onSelectOrderDetails,
}) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'fa';
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [chartRange, setChartRange] = useState<'6m' | '30d' | '7d'>('6m');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  const currencySymbol = company.currency === 'USD' ? '$' : company.currency;

  // Real calculations
  const totalProductsCount = products.length;
  const inStockProductsCount = products.filter((p) => p.stock > 0).length;
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const totalCustomersCount = customers.length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);

  // Filter orders for table
  const filteredOrders = orders.filter((order) => {
    if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) {
      return false;
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchComp = order.clientCompany?.toLowerCase().includes(q) || false;
      if (!matchNum && !matchName && !matchComp) return false;
    }
    return true;
  });

  // Chart max calculation
  const maxVal = Math.max(
    ...salesTrend.map((d) => (chartMetric === 'revenue' ? Math.max(d.revenue, d.target) : d.orders)),
    100
  );

  const ArrowForward = isRtl ? ArrowLeft : ArrowRight;
  const ChevronForward = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-6">
      {/* Welcome Banner: Deep Navy (#101C35) with Muted Gold (#C9A96E) Accent */}
      <div
        className="rounded-2xl p-6 sm:p-7 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-[#101C35]"
      >
        <div className="relative z-10 flex items-start sm:items-center gap-4">
          <img
            src={company.logoUrl}
            alt={company.name}
            className="w-14 h-14 rounded-xl object-contain bg-white p-1 border border-[#E2E8F0]/30 shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-[#C9A96E] tracking-wider uppercase border border-[#C9A96E]/30">
                {company.industry}
              </span>
              <span className="text-xs text-white/70 font-mono">
                {company.id === 'comp_heka_ltd' ? (isRtl ? 'دفتر مرکزی لندن' : 'London Headquarters') : company.country}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1.5 text-white">
              {company.name} {isRtl ? '– مرکز عملیات و پیشخوان تجارتی' : '– Corporate Operations Hub'}
            </h1>
            <p className="text-xs text-white/80 mt-1 line-clamp-1 max-w-2xl">
              {isRtl && company.settings.customGreetingFa
                ? company.settings.customGreetingFa
                : company.settings.customGreetingEn || company.address}
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onTogglePublicView}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#101C35] hover:bg-[#F5F7FA] transition shadow-xs flex items-center gap-2 cursor-pointer border border-[#E2E8F0]"
          >
            <Eye className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>{t.viewPublicCatalog || (isRtl ? 'مشاهده کاتالوگ عمومی' : 'Public Catalog')}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('sales_ai')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#172033] hover:bg-[#1f2c46] text-white border border-[#C9A96E]/40 transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>{t.tabSalesAI || (isRtl ? 'دستیار AI فروش' : 'AI Sales Assistant')}</span>
          </button>
        </div>

        {/* Subtle decorative geometry */}
        <div
          className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none bg-[#C9A96E]"
        />
      </div>

      {/* Demo Notice Banner */}
      <div className="px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#687386] text-xs flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <Info className="w-4 h-4 text-[#C9A96E] shrink-0" />
          <span className="text-[11px] leading-relaxed truncate sm:text-clip">
            <strong className="text-[#172033]">{isRtl ? 'محیط آزمایشی:' : 'Demonstration Data:'}</strong>{' '}
            {t.demoNotice ||
              (isRtl
                ? 'ارقام مالی، سفارشات عمده و آمارهای این صفحه صرفاً جهت نمایش امکانات سیستم طراحی شده‌اند.'
                : 'Operational metrics and staged wholesale transactions are presented for staging and demonstration.')}
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#F5F7FA] text-[#8C6D2E] border border-[#C9A96E]/30 shrink-0">
          {isRtl ? 'داده‌های نمونه' : 'DEMO STAGING'}
        </span>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Total Products */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#C9A96E]/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#687386] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#687386]">
              {t.totalProductsCard || (isRtl ? 'مجموع کالاها' : 'Total Products')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5F7FA] text-[#101C35] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#E2E8F0]">
              <Package className="w-4 h-4 text-[#C9A96E]" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#172033] font-mono tabular-nums tracking-tight">
              {totalProductsCount}
            </span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{inStockProductsCount} {isRtl ? 'موجود در انبار' : 'In Stock'}</span>
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#F5F7FA] flex items-center justify-between text-[11px] text-[#687386]">
            <span>{isRtl ? 'تاییدشده در کاتالوگ' : 'Verified in catalog'}</span>
            <span className="text-[#101C35] font-bold group-hover:text-[#C9A96E] transition-colors flex items-center gap-0.5">
              <span>{isRtl ? 'مدیریت' : 'Manage'}</span>
              <ChevronForward className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 2. Total Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#C9A96E]/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#687386] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#687386]">
              {t.totalOrdersCard || (isRtl ? 'مجموع سفارشات' : 'Total Orders')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5F7FA] text-[#101C35] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#E2E8F0]">
              <ShoppingCart className="w-4 h-4 text-[#C9A96E]" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#172033] font-mono tabular-nums tracking-tight">
              {totalOrdersCount}
            </span>
            <span className="text-xs font-semibold text-[#101C35] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>{pendingOrdersCount} {isRtl ? 'فعال' : 'Active'}</span>
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#F5F7FA] flex items-center justify-between text-[11px] text-[#687386]">
            <span>{isRtl ? '۱۴.۲٪ رشد ماهانه' : '+14.2% monthly growth'}</span>
            <span className="text-[#101C35] font-bold group-hover:text-[#C9A96E] transition-colors flex items-center gap-0.5">
              <span>{isRtl ? 'مشاهده' : 'View'}</span>
              <ChevronForward className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 3. Total Customers */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#C9A96E]/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#687386] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#687386]">
              {t.totalCustomersCard || (isRtl ? 'مشتریان فعال' : 'Active Customers')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5F7FA] text-[#101C35] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#E2E8F0]">
              <Users className="w-4 h-4 text-[#C9A96E]" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#172033] font-mono tabular-nums tracking-tight">
              {totalCustomersCount}
            </span>
            <span className="text-xs font-semibold text-[#101C35] flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-[#687386]" />
              <span>{isRtl ? 'عمده و پرچون' : 'B2B & Retail'}</span>
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#F5F7FA] flex items-center justify-between text-[11px] text-[#687386]">
            <span>{isRtl ? 'توزیع‌کنندگان جهانی' : 'Global distributors'}</span>
            <span className="text-[#101C35] font-bold group-hover:text-[#C9A96E] transition-colors flex items-center gap-0.5">
              <span>{isRtl ? 'فهرست' : 'Directory'}</span>
              <ChevronForward className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 4. Total Revenue */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#C9A96E]/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#687386] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#687386]">
              {t.totalRevenueCard || (isRtl ? 'گردش مالی کل' : 'Total Revenue')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5F7FA] text-[#101C35] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#E2E8F0]">
              <DollarSign className="w-4 h-4 text-[#C9A96E]" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#172033] font-mono tabular-nums tracking-tight">
              {currencySymbol}{totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>+18.4%</span>
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#F5F7FA] flex items-center justify-between text-[11px] text-[#687386]">
            <span>{isRtl ? 'تراز بازرگانی سالانه' : 'Annualised trade volume'}</span>
            <span className="text-[#101C35] font-bold group-hover:text-[#C9A96E] transition-colors flex items-center gap-0.5">
              <span>{isRtl ? 'آمار' : 'Analytics'}</span>
              <ChevronForward className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#172033] uppercase tracking-wider">
            {t.quickActionsTitle || (isRtl ? 'اقدامات سریع:' : 'Quick Actions:')}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#101C35] hover:bg-[#192b52] text-white transition shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>{t.actionAddProduct || (isRtl ? 'افزودن محصول جدید' : 'Add Product')}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#172033] border border-[#E2E8F0] transition cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#687386]" />
            <span>{t.actionViewOrders || (isRtl ? 'مشاهده سفارشات' : 'View Orders')}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('customers')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#172033] border border-[#E2E8F0] transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#687386]" />
            <span>{t.actionManageCustomers || (isRtl ? 'مدیریت مشتریان' : 'Manage Customers')}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('sales_ai')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#101C35]/5 hover:bg-[#101C35]/10 text-[#101C35] border border-[#C9A96E]/40 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>{t.actionSalesAI || (isRtl ? 'دستیار هوشمند فروش' : 'AI Assistant')}</span>
          </button>
        </div>
      </div>

      {/* Sales Overview Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5F7FA] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#172033] tracking-tight">
              {t.salesOverviewTitle || (isRtl ? 'نمای کلی فروش و گردش مالی' : 'Sales & Revenue Overview')}
            </h2>
            <p className="text-xs text-[#687386] mt-0.5">
              {isRtl
                ? 'روند ماهانه توزیع بازرگانی در کانال‌های عمده‌فروشی بین‌المللی و نمایندگی‌ها'
                : 'Monthly trade distribution across international wholesale accounts and retail partners'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Metric Toggle */}
            <div className="flex items-center bg-[#F5F7FA] p-0.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  chartMetric === 'revenue'
                    ? 'bg-[#101C35] text-white shadow-xs font-bold'
                    : 'text-[#687386] hover:text-[#172033]'
                }`}
              >
                {isRtl ? `درآمد (${currencySymbol})` : `Revenue (${currencySymbol})`}
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('orders')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  chartMetric === 'orders'
                    ? 'bg-[#101C35] text-white shadow-xs font-bold'
                    : 'text-[#687386] hover:text-[#172033]'
                }`}
              >
                {isRtl ? 'تعداد سفارشات' : 'Orders'}
              </button>
            </div>

            {/* Range Selector */}
            <div className="hidden sm:flex items-center bg-[#F5F7FA] p-0.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartRange('6m')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  chartRange === '6m'
                    ? 'bg-white text-[#101C35] shadow-xs font-bold'
                    : 'text-[#687386] hover:text-[#172033]'
                }`}
              >
                6M
              </button>
              <button
                type="button"
                onClick={() => setChartRange('30d')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  chartRange === '30d'
                    ? 'bg-white text-[#101C35] shadow-xs font-bold'
                    : 'text-[#687386] hover:text-[#172033]'
                }`}
              >
                30D
              </button>
            </div>
          </div>
        </div>

        {/* SVG Interactive Chart Canvas */}
        <div className="relative pt-2">
          <div className="h-64 sm:h-72 w-full flex items-end gap-2 sm:gap-4 px-2 sm:px-4 pb-6 pt-4">
            {salesTrend.map((item, idx) => {
              const currentVal = chartMetric === 'revenue' ? item.revenue : item.orders;
              const heightPercent = Math.max((currentVal / maxVal) * 100, 6);
              const targetHeightPercent = (item.target / maxVal) * 100;
              const isHovered = hoveredPoint === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer"
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-[#101C35] text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap font-mono tabular-nums border border-[#C9A96E]/30">
                      <strong className="block text-[#C9A96E] font-sans font-bold">{item.month}</strong>
                      <span>
                        {chartMetric === 'revenue'
                          ? `${currencySymbol}${item.revenue.toLocaleString()}`
                          : `${item.orders} Orders`}
                      </span>
                      {chartMetric === 'revenue' && (
                        <span className="text-[#687386] block text-[10px]">
                          Target: {currencySymbol}{item.target.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Target line indicator if revenue */}
                  {chartMetric === 'revenue' && (
                    <div
                      className="absolute w-full border-t border-dashed border-[#C9A96E]/40 pointer-events-none"
                      style={{ bottom: `${targetHeightPercent}%` }}
                      title={`Target: ${currencySymbol}${item.target}`}
                    />
                  )}

                  {/* Main Bar */}
                  <div
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-200 ${
                      isHovered
                        ? 'bg-[#C9A96E] shadow-sm'
                        : idx === salesTrend.length - 1
                        ? 'bg-[#101C35]'
                        : 'bg-[#101C35]/70 hover:bg-[#101C35]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* X-axis Label */}
                  <span className="absolute -bottom-5 text-[10px] sm:text-xs text-[#687386] font-medium truncate max-w-full">
                    {item.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-5 pt-3 border-t border-[#F5F7FA] text-xs text-[#687386]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#101C35]" />
              <span>{chartMetric === 'revenue' ? (isRtl ? 'درآمد قطعی' : 'Actual Revenue') : (isRtl ? 'حجم سفارشات' : 'Order Volume')}</span>
            </div>
            {chartMetric === 'revenue' && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 border-t-2 border-dashed border-[#C9A96E]" />
                <span>{isRtl ? 'تارگت رشد' : 'Growth Target'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders (Left) + Recent Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#172033] tracking-tight">
                {t.recentOrdersTitle || (isRtl ? 'سفارشات اخیر' : 'Recent Orders')}
              </h2>
              <p className="text-xs text-[#687386] mt-0.5">
                {isRtl ? 'معاملات بازرگانی، ارسال‌های بین‌المللی و فاکتورهای عمده' : 'Commercial consignments, international freight, and wholesale invoices'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#101C35] hover:text-[#C9A96E] flex items-center gap-1 cursor-pointer self-start sm:self-auto transition-colors"
            >
              <span>{t.viewAll || (isRtl ? 'مشاهده تمام سفارشات' : 'View All Orders')}</span>
              <ArrowForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Order Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-[#F5F7FA] p-0.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold overflow-x-auto">
              {['all', 'shipped', 'processing', 'delivered', 'pending'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition cursor-pointer text-[11px] ${
                    orderStatusFilter === st
                      ? 'bg-[#101C35] text-white shadow-xs font-bold'
                      : 'text-[#687386] hover:text-[#172033]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* In-table search */}
            <div className="relative w-full sm:w-48">
              <Search
                className={`w-3.5 h-3.5 text-[#687386] absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                  isRtl ? 'right-2.5' : 'left-2.5'
                }`}
              />
              <input
                type="text"
                placeholder={isRtl ? 'فیلتر سفارش...' : 'Filter orders...'}
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className={`w-full text-xs py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#101C35] ${
                  isRtl ? 'pr-8 pl-2.5' : 'pl-8 pr-2.5'
                }`}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F7FA] border-b border-[#E2E8F0] text-[11px] font-bold text-[#687386] uppercase tracking-wider">
                  <th className="py-2.5 px-3">{isRtl ? 'شماره سفارش' : 'Order Number'}</th>
                  <th className="py-2.5 px-3">{isRtl ? 'مشتری / شرکت' : 'Client / Company'}</th>
                  <th className="py-2.5 px-3">{isRtl ? 'مبلغ' : 'Amount'}</th>
                  <th className="py-2.5 px-3">{isRtl ? 'وضعیت' : 'Status'}</th>
                  <th className="py-2.5 px-3 text-right rtl:text-left">{isRtl ? 'عملیات' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredOrders.length > 0 ? (
                  filteredOrders.slice(0, 5).map((order) => {
                    const statusColors: Record<string, string> = {
                      shipped: 'bg-blue-50 text-blue-700 border-blue-200',
                      delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      processing: 'bg-[#C9A96E]/15 text-[#8C6D2E] border-[#C9A96E]/30',
                      pending: 'bg-[#F5F7FA] text-[#687386] border-[#E2E8F0]',
                      cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                    };

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[#F5F7FA] transition cursor-pointer"
                        onClick={() => onSelectOrderDetails(order)}
                      >
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-[#172033] block tabular-nums">
                            {order.orderNumber}
                          </span>
                          <span className="text-[10px] text-[#687386]">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <strong className="text-[#172033] block truncate max-w-[180px]">
                            {order.customerName}
                          </strong>
                          <span className="text-[11px] text-[#687386] block truncate max-w-[180px]">
                            {order.clientCompany || order.customerLocation}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-[#172033] block tabular-nums">
                            {order.currency}{order.totalAmount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-emerald-700 capitalize font-medium">
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                              statusColors[order.status] || 'bg-[#F5F7FA] text-[#687386]'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right rtl:text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectOrderDetails(order);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#172033] border border-[#E2E8F0] transition cursor-pointer"
                          >
                            {isRtl ? 'پیش‌فاکتور' : 'Invoice'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#687386]">
                      {isRtl ? 'هیچ سفارشی با این مشخصات یافت نشد.' : 'No orders match the current filter.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Recent Activity Panel */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5F7FA] pb-3">
            <h2 className="text-base font-extrabold text-[#172033] tracking-tight">
              {t.recentActivityTitle || (isRtl ? 'فعالیت‌های اخیر' : 'Recent Activity')}
            </h2>
            <span className="text-[10px] font-mono font-bold text-[#687386] uppercase">
              {isRtl ? 'ثبت لاگ زنده' : 'Audit Log'}
            </span>
          </div>

          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((act) => {
                const typeIcon = {
                  order: ShoppingCart,
                  product: Package,
                  inquiry: MessageSquare,
                  security: ShieldCheck,
                  system: Clock
                }[act.type] || Clock;

                const Icon = typeIcon;
                const iconColor = {
                  order: 'bg-[#101C35]/5 text-[#101C35]',
                  product: 'bg-[#C9A96E]/15 text-[#8C6D2E]',
                  inquiry: 'bg-emerald-50 text-emerald-700',
                  security: 'bg-rose-50 text-rose-700',
                  system: 'bg-[#F5F7FA] text-[#687386]'
                }[act.type] || 'bg-[#F5F7FA] text-[#687386]';

                return (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-[#E2E8F0] ${iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[#172033] leading-snug">
                        <strong className="font-bold">{act.user}</strong>{' '}
                        <span className="text-[#687386]">{act.action}</span>{' '}
                        <span className="font-semibold">{act.target}</span>
                      </p>
                      <span className="text-[10px] text-[#687386] mt-0.5 block font-mono">
                        {act.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-[#687386]">
                {isRtl ? 'هیچ فعالیتی ثبت نشده است.' : 'No recent activity recorded.'}
              </div>
            )}
          </div>

          {/* Quick link to security audit */}
          <div className="pt-3 border-t border-[#F5F7FA]">
            <button
              type="button"
              onClick={() => onNavigateTab('security_audit')}
              className="w-full py-2 px-3 rounded-xl bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#172033] text-xs font-bold transition flex items-center justify-between cursor-pointer border border-[#E2E8F0]"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isRtl ? 'تست و ارزیابی تفکیک اطلاعات' : 'Verify Tenant Security State'}</span>
              </div>
              <ChevronForward className="w-3.5 h-3.5 text-[#687386]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
