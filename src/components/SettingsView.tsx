import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { Company, User, Language } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface SettingsViewProps {
  company: Company;
  currentUser: User;
  onRefresh: () => void;
  currentLang: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company,
  currentUser,
  onRefresh,
  currentLang,
}) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'fa';
  const [formData, setFormData] = useState({
    name: company.name,
    industry: company.industry,
    contactPhone: company.contactPhone,
    contactEmail: company.contactEmail,
    address: company.address,
    currency: company.currency,
    showRetailPricesPublicly: company.settings.showRetailPricesPublicly,
    allowWholesaleQuoteRequests: company.settings.allowWholesaleQuoteRequests,
    primaryColor: company.brandColors.primary || '#101C35',
    accentColor: company.brandColors.accent || '#C9A96E'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateCompany(company.id, {
        name: formData.name,
        industry: formData.industry,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        address: formData.address,
        currency: formData.currency,
        brandColors: {
          primary: formData.primaryColor,
          accent: formData.accentColor,
          background: company.brandColors.background || '#F5F7FA'
        },
        settings: {
          ...company.settings,
          showRetailPricesPublicly: formData.showRetailPricesPublicly,
          allowWholesaleQuoteRequests: formData.allowWholesaleQuoteRequests
        }
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      onRefresh();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#172033] tracking-tight">
            {t.tabSettings || (isRtl ? 'تنظیمات رسمی پلتفرم تجارتی' : 'Enterprise Platform Settings')}
          </h1>
          <p className="text-xs text-[#687386] mt-1">
            {isRtl
              ? 'پیکربندی هویت شرکتی، ارز مبادلاتی، تنظیمات کاتالوگ عمومی و پالت رنگ برند'
              : 'Configure corporate identity, settlement currencies, public storefront preferences, and brand palette.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Company Identity */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-[#172033] border-b border-[#F5F7FA] pb-2">
            {isRtl ? 'مشخصات رسمی شرکت و اطلاعات ثبت بازرگانی' : 'Company Identity & Registered Commerce Details'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#172033] mb-1">
                {isRtl ? 'نام رسمی شرکت' : 'Company Legal Name'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-[#172033] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#101C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#172033] mb-1">
                {isRtl ? 'صنعت و حوزه فعالیت' : 'Commercial Industry'}
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-[#172033] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#101C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#172033] mb-1">
                {isRtl ? 'شماره تماس رسمی (واتساپ)' : 'Official WhatsApp Phone'}
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-[#172033] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#101C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#172033] mb-1">
                {isRtl ? 'ایمیل رسمی تماس' : 'Official Contact Email'}
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-[#172033] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#101C35]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#172033] mb-1">
                {isRtl ? 'آدرس ثبتی دفتر مرکزی' : 'Registered Corporate Address'}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-[#172033] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#101C35]"
              />
            </div>
          </div>
        </div>

        {/* Commercial Currency & Public Storefront Visibility */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-[#172033] border-b border-[#F5F7FA] pb-2">
            {isRtl ? 'ارز تسویه و تنظیمات کاتالوگ عمومی' : 'Storefront & Commercial Preferences'}
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#172033] mb-1">
                {isRtl ? 'ارز اصلی تسویه حساب' : 'Settlement Currency'}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-[#172033] font-mono font-bold focus:bg-white focus:outline-none"
              >
                <option value="USD">USD ($ - United States Dollar)</option>
                <option value="GBP">GBP (£ - British Pound Sterling)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="AED">AED (د.إ - UAE Dirham)</option>
                <option value="AFN">AFN (؋ - Afghan Afghani)</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showRetailPricesPublicly}
                  onChange={(e) =>
                    setFormData({ ...formData, showRetailPricesPublicly: e.target.checked })
                  }
                  className="rounded text-[#101C35] focus:ring-[#101C35] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-[#172033] block">
                    {isRtl ? 'نمایش عمومی قیمت‌های تکی / پرچون' : 'Show Retail Prices Publicly'}
                  </span>
                  <span className="text-[#687386] text-[11px] block">
                    {isRtl
                      ? 'در صورت غیرفعال بودن، قیمت‌ها مخفی شده و بازدیدکنندگان باید استعلام پیش‌فاکتور ارسال کنند.'
                      : 'When disabled, prices are hidden and visitors must request a quotation.'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowWholesaleQuoteRequests}
                  onChange={(e) =>
                    setFormData({ ...formData, allowWholesaleQuoteRequests: e.target.checked })
                  }
                  className="rounded text-[#101C35] focus:ring-[#101C35] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-[#172033] block">
                    {isRtl ? 'امکان ثبت درخواست استعلام عمده در کاتالوگ' : 'Allow Wholesale Quote Requests'}
                  </span>
                  <span className="text-[#687386] text-[11px] block">
                    {isRtl
                      ? 'دکمه درخواست پیش‌فاکتور عمده را در صفحه محصولات کاتالوگ عمومی فعال می‌کند.'
                      : 'Enables quote request modal on public storefront product pages.'}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Corporate Branding Colors */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-[#172033] border-b border-[#F5F7FA] pb-2">
            {isRtl ? 'پالت رنگ برند شرکتی' : 'Corporate Brand Palette'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#172033] mb-1">
                {isRtl ? 'رنگ اصلی (سرمه‌ای تیره)' : 'Primary Color (Hex)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-[#E2E8F0] cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-[#172033] font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#172033] mb-1">
                {isRtl ? 'رنگ تاکیدی (طلایی لوکس)' : 'Accent Color (Hex)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-[#E2E8F0] cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-[#172033] font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>{isRtl ? 'تنظیمات با موفقیت ذخیره شد!' : 'Settings updated successfully!'}</span>
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-6 rounded-xl font-bold text-xs bg-[#101C35] hover:bg-[#192b52] text-white transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4 text-[#C9A96E]" />
            <span>{isSaving ? (isRtl ? 'در حال ذخیره‌سازی...' : 'Saving Changes...') : (isRtl ? 'ذخیره تنظیمات شرکت' : 'Save Company Settings')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
