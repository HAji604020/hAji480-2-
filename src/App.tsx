import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { CustomersView } from './components/CustomersView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { OrderDetailModal } from './components/OrderDetailModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PublicCatalogView } from './components/PublicCatalogView';
import { ProductManagement } from './components/ProductManagement';
import { SalesAIView } from './components/SalesAIView';
import { InquiryManagement } from './components/InquiryManagement';
import { CompanyProfileView } from './components/CompanyProfileView';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SupportView } from './components/SupportView';
import {
  Company,
  Product,
  User,
  CustomerInquiry,
  Language,
  Order,
  Customer,
  ActivityItem,
  AppNotification,
  SupportTicket
} from './types';
import {
  sampleOrders,
  sampleCustomers,
  sampleActivities,
  sampleNotifications,
  sampleSalesTrend
} from './data/sampleData';
import { translations } from './translations';
import { api } from './services/api';
import { ShieldCheck, ArrowLeft, Bell } from 'lucide-react';

export default function App() {
  // Persist language across reloads
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('heka_lang');
      if (stored === 'fa' || stored === 'en' || stored === 'ps') return stored;
    } catch {
      // fallback
    }
    return 'en';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPublicView, setIsPublicView] = useState<boolean>(false);
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState<boolean>(false);

  // Tenant & User state
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user_heka_admin',
    email: 'admin@hekaltd.com',
    name: 'HEKA Corporate Director',
    role: 'company_admin',
    companyId: 'comp_heka_ltd',
    token: 'token_heka_admin_secret'
  });

  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<Order[]>(sampleOrders['comp_heka_ltd'] || []);
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers['comp_heka_ltd'] || []);
  const [activities, setActivities] = useState<ActivityItem[]>(sampleActivities['comp_heka_ltd'] || []);
  const [notifications, setNotifications] = useState<AppNotification[]>(sampleNotifications['comp_heka_ltd'] || []);
  const [salesTrend, setSalesTrend] = useState<{ month: string; revenue: number; orders: number; target: number }[]>(
    sampleSalesTrend['comp_heka_ltd'] || []
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState<boolean>(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);

  // Transfer state from inquiry to AI Sales Assistant
  const [inquiryForAI, setInquiryForAI] = useState<CustomerInquiry | null>(null);

  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  // Sync RTL/LTR & language in HTML document (Specification Requirement #2)
  useEffect(() => {
    try {
      localStorage.setItem('heka_lang', currentLang);
    } catch {
      // fallback
    }
    document.documentElement.lang = currentLang;
    document.documentElement.dir = (currentLang === 'fa' || currentLang === 'ps') ? 'rtl' : 'ltr';
  }, [currentLang]);

  // Load initial data from persistent backend
  const loadTenantData = async (companyId?: string) => {
    setIsLoading(true);
    try {
      // 1. Get companies
      const companies = await api.getCompanies();
      setAllCompanies(companies);

      const targetId = companyId || currentUser.companyId || companies[0]?.id;
      const comp = companies.find((c) => c.id === targetId) || companies[0] || null;
      setCurrentCompany(comp);

      if (comp) {
        // 2. Load private products for this tenant
        const prods = await api.getProducts(comp.id);
        setProducts(prods);

        // 3. Load private inquiries for this tenant
        const inqs = await api.getInquiries(comp.id);
        setInquiries(inqs);

        // 4. Load private support tickets for this tenant (Specification Requirement #4 & #5)
        try {
          const tcks = await api.getSupportTickets(comp.id);
          setSupportTickets(tcks);
        } catch (e) {
          console.warn('Could not load persistent support tickets:', e);
        }

        // 5. Load tenant-specific demo orders & customers
        setOrders(sampleOrders[comp.id] || sampleOrders['comp_heka_ltd'] || []);
        setCustomers(sampleCustomers[comp.id] || sampleCustomers['comp_heka_ltd'] || []);
        setActivities(sampleActivities[comp.id] || sampleActivities['comp_heka_ltd'] || []);
        setNotifications(sampleNotifications[comp.id] || sampleNotifications['comp_heka_ltd'] || []);
        setSalesTrend(sampleSalesTrend[comp.id] || sampleSalesTrend['comp_heka_ltd'] || []);
      }
    } catch (err: any) {
      console.error('Failed to load tenant data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenantData();
  }, []);

  // Tenant switch
  const handleSelectCompany = async (companyId: string) => {
    const comp = allCompanies.find((c) => c.id === companyId);
    if (!comp) return;

    setCurrentCompany(comp);

    // Update user context for the chosen company
    if (companyId === 'comp_heka_ltd' || companyId === 'comp_mehr_saffron') {
      api.setToken('token_heka_admin_secret');
      setCurrentUser({
        id: 'user_heka_admin',
        email: 'admin@hekaltd.com',
        name: 'HEKA Corporate Director',
        role: 'company_admin',
        companyId: 'comp_heka_ltd',
        token: 'token_heka_admin_secret'
      });
    } else if (companyId === 'comp_ziba_fashion') {
      api.setToken('token_ziba_admin_secret');
      setCurrentUser({
        id: 'user_ziba_admin',
        email: 'admin@zibafashion.com',
        name: 'Ziba Samimi (Founder)',
        role: 'company_admin',
        companyId: 'comp_ziba_fashion',
        token: 'token_ziba_admin_secret'
      });
    }

    // Refresh products and inquiries for the new company
    try {
      const prods = await api.getProducts(companyId);
      setProducts(prods);
      const inqs = await api.getInquiries(companyId);
      setInquiries(inqs);
      setOrders(sampleOrders[companyId] || sampleOrders['comp_heka_ltd'] || []);
      setCustomers(sampleCustomers[companyId] || sampleCustomers['comp_heka_ltd'] || []);
      setActivities(sampleActivities[companyId] || sampleActivities['comp_heka_ltd'] || []);
      setNotifications(sampleNotifications[companyId] || sampleNotifications['comp_heka_ltd'] || []);
      setSalesTrend(sampleSalesTrend[companyId] || sampleSalesTrend['comp_heka_ltd'] || []);
    } catch (err: any) {
      console.warn('Tenant data reload error:', err);
    }
  };

  // Switch role directly (HEKA Admin vs Ziba Admin vs Platform Super Admin)
  const handleSwitchUserRole = async (email: string) => {
    try {
      const { user, company } = await api.login(email);
      setCurrentUser(user);
      if (company) {
        setCurrentCompany(company);
        const prods = await api.getProducts(company.id);
        setProducts(prods);
        const inqs = await api.getInquiries(company.id);
        setInquiries(inqs);
        setOrders(sampleOrders[company.id] || sampleOrders['comp_heka_ltd'] || []);
        setCustomers(sampleCustomers[company.id] || sampleCustomers['comp_heka_ltd'] || []);
        setActivities(sampleActivities[company.id] || sampleActivities['comp_heka_ltd'] || []);
        setNotifications(sampleNotifications[company.id] || sampleNotifications['comp_heka_ltd'] || []);
        setSalesTrend(sampleSalesTrend[company.id] || sampleSalesTrend['comp_heka_ltd'] || []);
      } else if (user.role === 'platform_owner') {
        if (allCompanies.length > 0) {
          const comp = allCompanies[0];
          setCurrentCompany(comp);
          const prods = await api.getProducts(comp.id);
          setProducts(prods);
          const inqs = await api.getInquiries(comp.id);
          setInquiries(inqs);
        }
      }
    } catch (err: any) {
      alert(`Role switch error: ${err.message}`);
    }
  };

  // Handle transfer from Inquiries tab to AI Sales Assistant
  const handleSelectInquiryForAI = (inq: CustomerInquiry) => {
    setInquiryForAI(inq);
    setActiveTab('sales_ai');
  };

  // Handle new company created via Onboarding wizard
  const handleCompanyCreated = (newCompany: Company) => {
    setAllCompanies((prev) => [...prev, newCompany]);
    setCurrentCompany(newCompany);
    setProducts([]);
    setInquiries([]);
    setOrders([]);
    setCustomers([]);
    setActiveTab('dashboard');
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSelectNotification = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.linkTab) {
      setActiveTab(notif.linkTab);
      setIsNotificationsModalOpen(false);
    }
  };

  const t = translations[currentLang] || translations.en;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#172033] antialiased selection:bg-[#C9A96E]/20 selection:text-[#101C35]">
      {isPublicView && currentCompany ? (
        /* Public Storefront Catalog View */
        <div>
          {/* Top Return Bar */}
          <div className="bg-[#101C35] text-white px-4 sm:px-6 py-2.5 text-xs flex items-center justify-between shadow-xs sticky top-0 z-40 border-b border-[#E2E8F0]/20">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#C9A96E]">{currentCompany.name}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">
                {isRtl ? 'پیش‌نمایش کاتالوگ رسمی عمومی' : 'Public Storefront Preview'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPublicView(false)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isRtl ? 'بازگشت به پیشخوان شرکت' : 'Back to Dashboard'}</span>
            </button>
          </div>

          <PublicCatalogView
            company={currentCompany}
            products={products}
            currentLang={currentLang}
          />
        </div>
      ) : (
        /* Professional Company Workspace Layout */
        <div className="flex min-h-screen">
          {/* Sidebar Navigation */}
          <Sidebar
            currentCompany={currentCompany}
            currentUser={currentUser}
            activeTab={activeTab}
            onTabChange={(tab) => {
              if (tab === 'security_audit') {
                setIsSecurityAuditOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            isOpenMobile={isOpenMobileSidebar}
            onCloseMobile={() => setIsOpenMobileSidebar(false)}
            currentLang={currentLang}
            unreadCount={notifications.filter((n) => !n.read).length}
            ordersCount={orders.length}
            inquiriesCount={inquiries.length}
            supportCount={supportTickets.filter((t) => t.status === 'new' || t.status === 'open' || t.status === 'in_progress').length}
            onTogglePublicView={() => setIsPublicView(true)}
          />

          {/* Main Content Area (automatically offsets by 18rem in LTR or RTL) */}
          <div className="flex-1 flex flex-col min-w-0 lg:ms-72 transition-all duration-200">
            {/* Top Navigation Bar */}
            <TopHeader
              currentCompany={currentCompany}
              currentUser={currentUser}
              allCompanies={allCompanies}
              onSelectCompany={handleSelectCompany}
              onSwitchUserRole={handleSwitchUserRole}
              currentLang={currentLang}
              onLanguageChange={setCurrentLang}
              onToggleMobileSidebar={() => setIsOpenMobileSidebar(!isOpenMobileSidebar)}
              isPublicView={isPublicView}
              onTogglePublicView={() => setIsPublicView(!isPublicView)}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenSecurityAudit={() => setIsSecurityAuditOpen(true)}
              notifications={notifications}
              onOpenNotifications={() => setIsNotificationsModalOpen(true)}
              products={products}
              orders={orders}
              customers={customers}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />

            {/* Viewport Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
              {isLoading ? (
                <div className="py-24 text-center text-[#687386]">
                  {isRtl ? 'در حال بارگذاری اطلاعات پیشخوان...' : 'Loading operations hub...'}
                </div>
              ) : (
                <>
                  {/* 1. Dashboard View */}
                  {activeTab === 'dashboard' && currentCompany && (
                    <DashboardView
                      company={currentCompany}
                      products={products}
                      orders={orders}
                      customers={customers}
                      activities={activities}
                      salesTrend={salesTrend}
                      currentLang={currentLang}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                      onOpenAddProduct={() => {
                        setIsAddingProduct(true);
                        setActiveTab('products');
                      }}
                      onTogglePublicView={() => setIsPublicView(true)}
                      onSelectOrderDetails={(ord) => setSelectedOrderForModal(ord)}
                    />
                  )}

                  {/* 2. Company Profile View */}
                  {activeTab === 'company_profile' && currentCompany && (
                    <CompanyProfileView
                      company={currentCompany}
                      currentUser={currentUser}
                      onRefresh={() => loadTenantData(currentCompany.id)}
                      currentLang={currentLang}
                    />
                  )}

                  {/* 3. Products Management View */}
                  {activeTab === 'products' && currentCompany && (
                    <ProductManagement
                      company={currentCompany}
                      products={products}
                      onRefresh={() => {
                        setIsAddingProduct(false);
                        loadTenantData(currentCompany.id);
                      }}
                      currentLang={currentLang}
                      initialIsAdding={isAddingProduct}
                    />
                  )}

                  {/* 4. Orders View */}
                  {activeTab === 'orders' && currentCompany && (
                    <OrdersView
                      company={currentCompany}
                      orders={orders}
                      currentLang={currentLang}
                      onSelectOrder={(ord) => setSelectedOrderForModal(ord)}
                    />
                  )}

                  {/* 5. Customers Directory View */}
                  {activeTab === 'customers' && currentCompany && (
                    <CustomersView
                      company={currentCompany}
                      customers={customers}
                      currentLang={currentLang}
                    />
                  )}

                  {/* 6. Analytics View */}
                  {activeTab === 'analytics' && currentCompany && (
                    <AnalyticsView
                      company={currentCompany}
                      products={products}
                      orders={orders}
                      salesTrend={salesTrend}
                      currentLang={currentLang}
                    />
                  )}

                  {/* 7. Notifications View */}
                  {activeTab === 'notifications' && (
                    <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-[#F5F7FA] pb-3">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-[#101C35]" />
                          <h2 className="text-lg font-extrabold text-[#172033]">
                            {t.tabNotifications || (isRtl ? 'اعلان‌ها و رویدادهای سیستم' : 'Notifications & System Logs')}
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={handleMarkAllNotificationsRead}
                          className="text-xs font-bold text-[#101C35] hover:text-[#C9A96E] cursor-pointer transition-colors"
                        >
                          {isRtl ? 'علامت‌گذاری همه به عنوان خوانده‌شده' : 'Mark all read'}
                        </button>
                      </div>

                      <div className="divide-y divide-[#E2E8F0]">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleSelectNotification(notif)}
                            className="py-3.5 flex items-start gap-3 hover:bg-[#F5F7FA] transition cursor-pointer px-2 rounded-xl text-left rtl:text-right"
                          >
                            <div className="w-8 h-8 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] text-[#101C35] flex items-center justify-center shrink-0">
                              <Bell className="w-4 h-4 text-[#C9A96E]" />
                            </div>
                            <div className="flex-1 text-xs">
                              <div className="flex items-center justify-between">
                                <strong className="font-bold text-[#172033]">{notif.title}</strong>
                                <span className="text-[10px] text-[#687386] font-mono">{notif.timestamp}</span>
                              </div>
                              <p className="text-[#687386] mt-1 leading-relaxed">{notif.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. Settings View */}
                  {activeTab === 'settings' && currentCompany && (
                    <SettingsView
                      company={currentCompany}
                      currentUser={currentUser}
                      onRefresh={() => loadTenantData(currentCompany.id)}
                      currentLang={currentLang}
                    />
                  )}

                  {/* 9. AI Sales Assistant */}
                  {activeTab === 'sales_ai' && currentCompany && (
                    <SalesAIView
                      company={currentCompany}
                      products={products}
                      currentLang={currentLang}
                      initialInquiryMessage={inquiryForAI?.message}
                      initialProductId={inquiryForAI?.productId}
                    />
                  )}

                  {/* 10. Inquiries & Quote Requests */}
                  {activeTab === 'inquiries' && (
                    <InquiryManagement
                      inquiries={inquiries}
                      onSelectForAIReply={handleSelectInquiryForAI}
                      currentLang={currentLang}
                    />
                  )}

                  {/* 11. Support & Corporate Ticket Desk (Specification Requirement #1 - #5) */}
                  {activeTab === 'support' && currentCompany && (
                    <SupportView
                      company={currentCompany}
                      tickets={supportTickets}
                      currentLang={currentLang}
                      onRefresh={() => loadTenantData(currentCompany.id)}
                    />
                  )}
                </>
              )}
            </main>

            {/* Quiet Corporate Footer */}
            <footer className="border-t border-[#E2E8F0] bg-white py-4 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#687386] gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#172033]">
                    {currentCompany?.name || 'HEKA LTD'}
                  </span>
                  <span>·</span>
                  <span>{currentCompany?.id === 'comp_heka_ltd' ? (isRtl ? 'دفتر مرکزی لندن' : '100 Bishopsgate, London') : currentCompany?.country}</span>
                  <span>·</span>
                  <span className="text-emerald-800 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isRtl ? 'دامنه سازمانی ایزوله' : 'Isolated Tenant Domain'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSecurityAuditOpen(true)}
                    className="text-[#101C35] hover:text-[#C9A96E] underline cursor-pointer transition-colors"
                  >
                    {isRtl ? 'گزارش ممیزی امنیت' : 'Security Audit'}
                  </button>
                  <span>·</span>
                  <span>{isRtl ? 'معماری چندمستاجره سازمانی' : 'Multi-Tenant Architecture'}</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Modals */}
      <OrderDetailModal
        order={selectedOrderForModal}
        company={currentCompany || ({ name: 'HEKA LTD', slug: 'heka-ltd' } as Company)}
        onClose={() => setSelectedOrderForModal(null)}
        isRtl={isRtl}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
        isRtl={isRtl}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onCompanyCreated={handleCompanyCreated}
        currentLang={currentLang}
      />

      <SecurityAuditModal
        isOpen={isSecurityAuditOpen}
        onClose={() => setIsSecurityAuditOpen(false)}
        currentLang={currentLang}
      />
    </div>
  );
}
