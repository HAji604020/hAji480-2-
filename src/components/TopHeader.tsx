import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Building,
  ShieldCheck,
  Check,
  Store,
  ExternalLink,
  PlusCircle,
  X,
  Layers,
  ShoppingCart,
  Users,
  Globe
} from 'lucide-react';
import { Company, User, Language, Product, Order, Customer, AppNotification } from '../types';
import { translations } from '../translations';

interface TopHeaderProps {
  currentCompany: Company | null;
  currentUser: User;
  allCompanies: Company[];
  onSelectCompany: (companyId: string) => void;
  onSwitchUserRole: (email: string) => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onToggleMobileSidebar: () => void;
  isPublicView: boolean;
  onTogglePublicView: () => void;
  onOpenOnboarding: () => void;
  onOpenSecurityAudit: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  onNavigateTab: (tabId: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentCompany,
  currentUser,
  allCompanies,
  onSelectCompany,
  onSwitchUserRole,
  currentLang,
  onLanguageChange,
  onToggleMobileSidebar,
  isPublicView,
  onTogglePublicView,
  onOpenOnboarding,
  onOpenSecurityAudit,
  notifications,
  onOpenNotifications,
  products,
  orders,
  customers,
  onNavigateTab,
}) => {
  const t = translations[currentLang] || translations.en;
  const isRtl = currentLang === 'fa' || currentLang === 'ps';
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on search query
  const query = searchQuery.trim().toLowerCase();
  const matchedProducts = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.nameFa && p.nameFa.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const matchedOrders = query
    ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          (o.clientCompany && o.clientCompany.toLowerCase().includes(query))
      ).slice(0, 3)
    : [];

  const matchedCustomers = query
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          (c.clientCompany && c.clientCompany.toLowerCase().includes(query))
      ).slice(0, 3)
    : [];

  const hasSearchResults =
    matchedProducts.length > 0 || matchedOrders.length > 0 || matchedCustomers.length > 0;

  return (
    <header className="h-16 border-b border-[#E2E8F0] bg-white sticky top-0 z-30 shadow-xs flex items-center justify-between px-4 sm:px-6">
      {/* Left (or Right in RTL): Mobile Menu Button & Brand/Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-[#687386] hover:text-[#172033] hover:bg-[#F5F7FA] transition cursor-pointer"
          aria-label={isRtl ? 'باز کردن منوی ناوبری' : 'Open navigation sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* HEKA LTD Brand Logo in Header for immediate visual clarity */}
        <div className="flex items-center gap-2.5">
          {currentCompany?.logoUrl ? (
            <img
              src={currentCompany.logoUrl}
              alt={currentCompany.name}
              className="w-8 h-8 rounded-lg object-contain bg-white border border-[#E2E8F0] p-0.5 shadow-xs"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#101C35] flex items-center justify-center text-white">
              <Store className="w-4 h-4 text-[#C9A96E]" />
            </div>
          )}

          <div className="hidden sm:block">
            <span className="text-sm font-extrabold text-[#172033] tracking-tight leading-none block">
              {currentCompany?.name || 'HEKA LTD'}
            </span>
            <span className="text-[10px] text-[#687386] font-medium">
              {currentCompany?.id === 'comp_heka_ltd'
                ? (isRtl ? 'دفتر مرکزی لندن • تجارت بین‌الملل' : 'London HQ · International Commerce')
                : (isRtl ? 'سوئیت تجارتی' : 'Corporate Suite')}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search Field */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search
            className={`w-4 h-4 text-[#687386] absolute top-1/2 -translate-y-1/2 pointer-events-none ${
              isRtl ? 'right-3' : 'left-3'
            }`}
          />
          <input
            type="text"
            placeholder={t.searchDashboard || (isRtl ? 'جستجو در محصولات، سفارشات و مشتریان...' : 'Search products, orders, customers...')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className={`w-full text-xs py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA]/70 text-[#172033] hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#101C35]/15 focus:border-[#C9A96E] transition ${
              isRtl ? 'pr-9 pl-8' : 'pl-9 pr-8'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={`absolute top-1/2 -translate-y-1/2 text-[#687386] hover:text-[#172033] cursor-pointer ${
                isRtl ? 'left-2.5' : 'right-2.5'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchOpen && searchQuery && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl border border-[#E2E8F0] shadow-xl p-2 z-50 max-h-96 overflow-y-auto">
            {hasSearchResults ? (
              <div className="space-y-3">
                {matchedProducts.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#687386] px-2 py-1 block">
                      {isRtl ? 'محصولات' : 'Products'}
                    </span>
                    {matchedProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onNavigateTab('products');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left rtl:text-right px-2 py-1.5 rounded-lg hover:bg-[#F5F7FA] flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Layers className="w-3.5 h-3.5 text-[#101C35] shrink-0" />
                          <span className="font-semibold text-[#172033] truncate">
                            {isRtl ? (p.nameFa || p.name) : p.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#687386] shrink-0 tabular-nums">
                          {p.currency}{p.retailPrice}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {matchedOrders.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#687386] px-2 py-1 block">
                      {isRtl ? 'سفارشات' : 'Orders'}
                    </span>
                    {matchedOrders.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => {
                          onNavigateTab('orders');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left rtl:text-right px-2 py-1.5 rounded-lg hover:bg-[#F5F7FA] flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <ShoppingCart className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                          <span className="font-semibold text-[#172033] truncate">
                            {o.orderNumber} · {o.customerName}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#101C35] font-bold shrink-0 tabular-nums">
                          {o.currency}{o.totalAmount.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {matchedCustomers.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#687386] px-2 py-1 block">
                      {isRtl ? 'مشتریان' : 'Customers'}
                    </span>
                    {matchedCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onNavigateTab('customers');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left rtl:text-right px-2 py-1.5 rounded-lg hover:bg-[#F5F7FA] flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Users className="w-3.5 h-3.5 text-[#687386] shrink-0" />
                          <span className="font-semibold text-[#172033] truncate">
                            {c.name} {c.clientCompany ? `(${c.clientCompany})` : ''}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#687386] shrink-0 truncate max-w-[120px]">
                          {c.location}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[#687386]">
                {isRtl ? `موردی برای «${searchQuery}» یافت نشد` : `No matching results for "${searchQuery}"`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right (or Left in RTL) Controls: Language Switcher, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Visible 3-Way Interface Language Switcher (Specification Requirement #2) */}
        <div
          className="flex items-center bg-[#F5F7FA] p-0.5 rounded-xl border border-[#E2E8F0] shadow-2xs"
          role="group"
          aria-label="Interface language selection"
        >
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentLang === 'en'
                ? 'bg-[#101C35] text-white shadow-xs'
                : 'text-[#687386] hover:text-[#172033]'
            }`}
            title="Switch to English (LTR)"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('fa')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentLang === 'fa'
                ? 'bg-[#101C35] text-white shadow-xs'
                : 'text-[#687386] hover:text-[#172033]'
            }`}
            title="تغییر به زبان دری (RTL)"
          >
            دری
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('ps')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentLang === 'ps'
                ? 'bg-[#101C35] text-white shadow-xs'
                : 'text-[#687386] hover:text-[#172033]'
            }`}
            title="پښتو ژبې ته بدلون (RTL)"
          >
            پښتو
          </button>
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-[#687386] hover:text-[#172033] hover:bg-[#F5F7FA] border border-transparent hover:border-[#E2E8F0] transition cursor-pointer"
          title={isRtl ? 'مشاهده اعلان‌ها' : 'Notifications'}
          aria-label={isRtl ? 'مشاهده اعلان‌ها' : 'Notifications'}
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C9A96E] ring-2 ring-white" />
          )}
        </button>

        {/* User Profile & Account Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 rtl:pr-2 rtl:pl-1.5 py-1 rounded-xl hover:bg-[#F5F7FA] border border-transparent hover:border-[#E2E8F0] transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#101C35] text-[#C9A96E] font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left rtl:text-right text-xs leading-tight">
              <span className="font-bold text-[#172033] block truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#687386] font-medium block truncate max-w-[120px]">
                {currentUser.role === 'platform_owner'
                  ? (isRtl ? 'مدیر ارشد پلتفرم' : 'Platform Owner')
                  : currentCompany?.name || (isRtl ? 'مدیر شرکت' : 'Director')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#687386]" />
          </button>

          {/* Profile Menu Popover */}
          {isProfileMenuOpen && (
            <div
              className={`absolute top-full mt-2 w-72 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-3 z-50 space-y-3 ${
                isRtl ? 'left-0' : 'right-0'
              }`}
            >
              {/* User Bio */}
              <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
                <span className="font-bold text-xs text-[#172033] block">{currentUser.name}</span>
                <span className="text-[11px] text-[#687386] block truncate">{currentUser.email}</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#101C35] text-[#C9A96E] font-bold">
                    {currentUser.role}
                  </span>
                  <span className="text-[10px] text-[#687386] font-mono">
                    {currentUser.companyId || 'Global'}
                  </span>
                </div>
              </div>

              {/* Business Switcher */}
              <div>
                <span className="text-[10px] uppercase font-bold text-[#687386] px-1 block mb-1">
                  {isRtl ? 'تغییر شرکت فعال' : 'Switch Active Business'}
                </span>
                <div className="space-y-1">
                  {allCompanies.map((c) => {
                    const isSelected = currentCompany?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectCompany(c.id);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#101C35] text-white font-bold'
                            : 'text-[#172033] hover:bg-[#F5F7FA]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={c.logoUrl}
                            alt=""
                            className="w-4 h-4 rounded object-contain bg-white border shrink-0"
                          />
                          <span className="truncate">{c.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fast Role Simulator */}
              <div className="pt-2 border-t border-[#E2E8F0]">
                <span className="text-[10px] uppercase font-bold text-[#687386] px-1 block mb-1">
                  {isRtl ? 'شبیه‌سازی دسترسی' : 'Simulate Role Access'}
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchUserRole('admin@hekaltd.com');
                      setIsProfileMenuOpen(false);
                    }}
                    className="px-2 py-1 rounded bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#172033] text-left rtl:text-right font-semibold truncate cursor-pointer"
                  >
                    HEKA Director
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchUserRole('admin@zibafashion.com');
                      setIsProfileMenuOpen(false);
                    }}
                    className="px-2 py-1 rounded bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#172033] text-left rtl:text-right font-semibold truncate cursor-pointer"
                  >
                    Ziba Admin
                  </button>
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenSecurityAudit();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.securityAuditBtn || (isRtl ? 'تست تفکیک داده‌ها' : 'Security Audit')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenOnboarding();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-[#101C35] hover:bg-[#F5F7FA] cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>{t.onboardCompanyBtn || (isRtl ? 'ثبت شرکت جدید' : 'Register New Business')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
