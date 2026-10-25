import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Bell,
  Settings,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Eye,
  X,
  Store,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';
import { Company, User, Language } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  currentCompany: Company | null;
  currentUser: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentLang: Language;
  unreadCount?: number;
  ordersCount?: number;
  inquiriesCount?: number;
  supportCount?: number;
  onTogglePublicView: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCompany,
  currentUser,
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  currentLang,
  unreadCount = 2,
  ordersCount = 6,
  inquiriesCount = 2,
  supportCount = 0,
  onTogglePublicView,
}) => {
  const t = translations[currentLang] || translations.en;
  const primaryColor = currentCompany?.brandColors.primary || '#101C35';
  const accentColor = currentCompany?.brandColors.accent || '#C9A96E';
  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  const navItems = [
    {
      id: 'dashboard',
      label: t.tabDashboard || (isRtl ? (currentLang === 'ps' ? 'ډشبورډ' : 'پیشخوان مدیریت') : 'Dashboard'),
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'company_profile',
      label: t.tabCompanyProfile || (isRtl ? (currentLang === 'ps' ? 'د شرکت پروفایل' : 'پروفایل شرکت') : 'Company Profile'),
      icon: Building2,
      badge: null
    },
    {
      id: 'products',
      label: t.tabProducts || (isRtl ? (currentLang === 'ps' ? 'محصولات' : 'محصولات و انبار') : 'Products'),
      icon: Package,
      badge: null
    },
    {
      id: 'orders',
      label: t.tabOrders || (isRtl ? (currentLang === 'ps' ? 'فرمایشونه' : 'سفارشات تجارتی') : 'Orders'),
      icon: ShoppingCart,
      badge: ordersCount > 0 ? String(ordersCount) : null,
      badgeColor: 'bg-[#101C35]/5 text-[#101C35] border border-[#101C35]/10'
    },
    {
      id: 'customers',
      label: t.tabCustomers || (isRtl ? (currentLang === 'ps' ? 'پېرودونکي' : 'مشتریان و همکاران') : 'Customers'),
      icon: Users,
      badge: null
    },
    {
      id: 'analytics',
      label: t.tabAnalytics || (isRtl ? (currentLang === 'ps' ? 'احصایې' : 'آمار و تحلیل') : 'Analytics'),
      icon: BarChart3,
      badge: null
    },
    {
      id: 'notifications',
      label: t.tabNotifications || (isRtl ? (currentLang === 'ps' ? 'خبرتیاوې' : 'اعلان‌ها') : 'Notifications'),
      icon: Bell,
      badge: unreadCount > 0 ? String(unreadCount) : null,
      badgeColor: 'bg-[#C9A96E]/20 text-[#8C6D2E] border border-[#C9A96E]/40'
    },
    {
      id: 'support',
      label: t.tabSupport || (isRtl ? (currentLang === 'ps' ? 'مرسته او ملاتړ' : 'پشتیبانی و تیکت‌ها') : 'Support'),
      icon: LifeBuoy,
      badge: supportCount > 0 ? String(supportCount) : null,
      badgeColor: 'bg-[#C9A96E]/20 text-[#8C6D2E] border border-[#C9A96E]/40'
    },
    {
      id: 'settings',
      label: t.tabSettings || (isRtl ? (currentLang === 'ps' ? 'تنظیمات' : 'تنظیمات سیستم') : 'Settings'),
      icon: Settings,
      badge: null
    }
  ];

  const secondaryNavItems = [
    {
      id: 'sales_ai',
      label: t.tabSalesAI || (isRtl ? 'دستیار هوشمند فروش' : 'AI Sales Assistant'),
      icon: Sparkles,
      tag: isRtl ? 'تاییدشده' : 'Grounded'
    },
    {
      id: 'inquiries',
      label: t.tabInquiries || (isRtl ? 'استعلام‌ها و لیدها' : 'Inquiries & Leads'),
      icon: MessageSquare,
      badge: inquiriesCount > 0 ? String(inquiriesCount) : null
    },
    {
      id: 'security_audit',
      label: t.tabSecurityAudit || (isRtl ? 'تفکیک داده‌ها و امنیت' : 'Security Audit'),
      icon: ShieldCheck,
      tag: isRtl ? 'ایزوله' : 'Protected'
    }
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#101C35]/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 ${
          isRtl ? 'right-0 border-l' : 'left-0 border-r'
        } z-50 w-72 bg-white border-[#E2E8F0] shadow-lg lg:shadow-none flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile
            ? 'translate-x-0'
            : isRtl
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-5 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {currentCompany?.logoUrl ? (
              <img
                src={currentCompany.logoUrl}
                alt={currentCompany.name}
                className="w-9 h-9 rounded-xl object-contain bg-white border border-[#E2E8F0] p-0.5 shadow-xs shrink-0"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                <Store className="w-5 h-5 text-[#C9A96E]" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-[#172033] truncate tracking-tight">
                {currentCompany?.name || 'HEKA LTD'}
              </h1>
              <p className="text-[11px] text-[#687386] truncate">
                {currentCompany?.industry || 'International Trade'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#687386] hover:text-[#172033] hover:bg-[#F5F7FA] transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Main Section */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#687386]">
              {isRtl ? 'منوی اصلی' : 'MAIN MENU'}
            </div>
            <nav className="space-y-1" aria-label="Main Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer relative ${
                      isActive
                        ? 'bg-[#101C35] text-white shadow-xs'
                        : 'text-[#172033] hover:bg-[#F5F7FA] hover:text-[#101C35]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#C9A96E]' : 'text-[#687386]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tabular-nums ${
                            isActive
                              ? 'bg-white/20 text-[#C9A96E]'
                              : item.badgeColor || 'bg-[#F5F7FA] text-[#687386]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Intelligence & Support */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#687386]">
              {isRtl ? 'هوش تجارتی و ارتباطات' : 'INTELLIGENCE & LEADS'}
            </div>
            <nav className="space-y-1" aria-label="Secondary Navigation">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer relative ${
                      isActive
                        ? 'bg-[#101C35] text-white shadow-xs'
                        : 'text-[#172033] hover:bg-[#F5F7FA] hover:text-[#101C35]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#C9A96E]' : 'text-[#687386]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.tag && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                            isActive
                              ? 'bg-white/15 text-[#C9A96E]'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.tag}
                        </span>
                      )}

                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tabular-nums ${
                            isActive ? 'bg-white/20 text-[#C9A96E]' : 'bg-[#101C35]/5 text-[#101C35]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Storefront & Tenant Card */}
        <div className="p-3.5 border-t border-[#E2E8F0] bg-[#F5F7FA]/70 shrink-0 space-y-2">
          {/* Storefront Link */}
          <button
            type="button"
            onClick={onTogglePublicView}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-[#F5F7FA] border border-[#E2E8F0] text-[#172033] shadow-xs transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>{t.viewPublicCatalog || (isRtl ? 'کاتالوگ رسمی عمومی' : 'Public Catalog')}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#687386] group-hover:text-[#172033]" />
          </button>

          {/* Active Tenant Pill */}
          <div className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between text-[11px]">
            <div className="min-w-0">
              <span className="text-[#687386] block text-[10px]">
                {isRtl ? 'محیط تجارتی فعال' : 'Tenant Account'}
              </span>
              <strong className="text-[#172033] truncate block font-semibold">
                {currentCompany?.name}
              </strong>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F7FA] text-[#101C35] font-bold border border-[#E2E8F0]">
              {currentCompany?.plan || 'enterprise'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
