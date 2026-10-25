import React, { useState } from 'react';
import {
  Building,
  Palette,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Users,
  ShieldCheck,
  Save
} from 'lucide-react';
import { Company, Language, User } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface CompanyProfileViewProps {
  company: Company;
  currentUser: User;
  onRefresh: () => void;
  currentLang: Language;
}

export const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({
  company,
  currentUser,
  onRefresh,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [profile, setProfile] = useState<Company>({ ...company });
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const publicUrl = `${window.location.origin}/c/${company.slug}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateCompany(company.id, profile);
      onRefresh();
      alert(currentLang === 'fa' ? 'پروفایل شرکت با موفقیت ذخیره شد.' : 'Company profile saved successfully!');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Public Catalog Link Card */}
      <div className="bg-[#101C35] text-white p-6 rounded-2xl shadow-xs border border-[#E2E8F0] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-[#C9A96E] border border-[#C9A96E]/30">
            {currentLang === 'fa' ? 'لینک کاتالوگ عمومی' : 'Dedicated Public Storefront Link'}
          </span>
          <h3 className="text-lg font-bold mt-1.5 text-white">
            {currentLang === 'fa' ? 'آدرس درگاه عمومی شرکت' : 'Your Public Catalog URL'}
          </h3>
          <p className="text-xs text-white/70 font-mono mt-0.5">{publicUrl}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#101C35] hover:bg-[#F5F7FA] transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#E2E8F0]"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#C9A96E]" />}
            <span>{copiedUrl ? (currentLang === 'fa' ? 'کپی شد!' : 'Copied Link!') : (currentLang === 'fa' ? 'کپی لینک عمومی' : 'Copy Public Link')}</span>
          </button>
        </div>
      </div>

      {/* Edit Company Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#F5F7FA] pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#101C35]" />
            <h3 className="text-base font-bold text-[#172033]">{t.tabCompanyProfile}</h3>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#101C35] hover:bg-[#192b52] text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>{isSaving ? (currentLang === 'fa' ? 'در حال ذخیره...' : 'Saving...') : (currentLang === 'fa' ? 'ذخیره تغییرات' : 'Save Changes')}</span>
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Legal / Trading Name</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Industry / Trade Sector</label>
            <input
              type="text"
              value={profile.industry}
              onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Country of Operation</label>
            <input
              type="text"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Default Base Currency</label>
            <input
              type="text"
              value={profile.currency}
              onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Business WhatsApp Phone</label>
            <input
              type="text"
              value={profile.contactPhone}
              onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={profile.contactEmail}
              onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Logo and Banner Asset Preview */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-slate-700" />
            <span>Official Company Logo & Storefront Banner</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex items-center gap-3">
              <img
                src={profile.logoUrl}
                alt="Logo preview"
                className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-200 p-1 shadow-2xs"
              />
              <div className="flex-1">
                <span className="text-[11px] text-slate-600 font-bold block mb-1">Company Logo URL</span>
                <input
                  type="text"
                  value={profile.logoUrl}
                  onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                  placeholder="/heka-logo.jpg or https://..."
                />
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-600 font-bold block mb-1">Storefront Banner URL</span>
              <input
                type="text"
                value={profile.bannerUrl}
                onChange={(e) => setProfile({ ...profile, bannerUrl: e.target.value })}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-purple-600" />
            <span>Brand Colors & Theme</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-slate-600 block mb-1">Primary Color (Hex)</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={profile.brandColors?.primary || '#1e3a8a'}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      brandColors: { ...(profile.brandColors || { accent: '#3b82f6' }), primary: e.target.value }
                    })
                  }
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={profile.brandColors?.primary || '#1e3a8a'}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      brandColors: { ...(profile.brandColors || { accent: '#3b82f6' }), primary: e.target.value }
                    })
                  }
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-600 block mb-1">Accent Color (Hex)</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={profile.brandColors?.accent || '#3b82f6'}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      brandColors: { ...(profile.brandColors || { primary: '#1e3a8a' }), accent: e.target.value }
                    })
                  }
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={profile.brandColors?.accent || '#3b82f6'}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      brandColors: { ...(profile.brandColors || { primary: '#1e3a8a' }), accent: e.target.value }
                    })
                  }
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Public Settings */}
        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.settings.showRetailPricesPublicly}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  settings: { ...profile.settings, showRetailPricesPublicly: e.target.checked }
                })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Show retail prices publicly on storefront</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.settings.allowWholesaleQuoteRequests}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  settings: { ...profile.settings, allowWholesaleQuoteRequests: e.target.checked }
                })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Allow wholesale buyers to submit quote requests</span>
          </label>
        </div>
      </form>
    </div>
  );
};
