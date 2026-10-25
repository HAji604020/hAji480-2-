import React, { useState } from 'react';
import {
  Search,
  Filter,
  Package,
  MessageCircle,
  FileText,
  Truck,
  Award,
  CheckCircle2,
  Tag,
  ArrowRight,
  Send,
  X,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Company, Product, Language, CustomerInquiry } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface PublicCatalogViewProps {
  company: Company;
  products: Product[];
  currentLang: Language;
}

export const PublicCatalogView: React.FC<PublicCatalogViewProps> = ({
  company,
  products,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<Product | null>(null);

  // Quote / Inquiry Form State
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    // Only published products in public catalog
    if (!p.isPublished) return false;

    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nameFa && p.nameFa.includes(searchTerm)) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStock = !onlyInStock || p.stock > 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleOpenQuoteModal = (product: Product) => {
    setSelectedProductForQuote(product);
    setSubmitSuccess(false);
    setMessage(
      currentLang === 'fa'
        ? `سلام، من مایل به دریافت پیش‌فاکتور برای محصول «${product.nameFa || product.name}» می‌باشم.`
        : `Hello, I would like to request a formal quote for "${product.name}".`
    );
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerContact.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await api.submitPublicInquiry({
        companyId: company.id,
        customerName: customerName || 'Prospective Buyer',
        customerContact,
        customerLocation,
        inquiryType: 'wholesale_quote',
        productId: selectedProductForQuote?.id,
        productName: selectedProductForQuote?.name,
        requestedQuantity,
        message,
        replyLanguage: currentLang
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSelectedProductForQuote(null);
        setSubmitSuccess(false);
        setCustomerName('');
        setCustomerContact('');
        setMessage('');
      }, 2500);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryColor = company.brandColors?.primary || '#101C35';
  const accentColor = company.brandColors?.accent || '#C9A96E';

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] pb-16">
      {/* Brand Hero Banner */}
      <div
        className="text-white relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8 shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0a1122 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain p-1 border-2 border-[#C9A96E]/50 shadow-md bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                  {company.industry}
                </span>
                <span className="text-xs text-white/70">• {company.country}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">{company.name}</h1>
              <p className="text-xs sm:text-sm text-white/80 max-w-xl mt-1 leading-relaxed">
                {currentLang === 'fa' && company.settings.customGreetingFa
                  ? company.settings.customGreetingFa
                  : company.settings.customGreetingEn || t.catalogSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Contact Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {company.contactPhone && (
              <a
                href={`https://wa.me/${company.contactPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.openWhatsApp}</span>
              </a>
            )}
            {company.contactEmail && (
              <a
                href={`mailto:${company.contactEmail}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{company.contactEmail}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#687386] absolute start-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full text-sm ps-10 pe-4 py-2 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#101C35]/20 bg-[#F5F7FA] hover:bg-white focus:bg-white transition"
            />
          </div>

          {/* Category Chips & Stock Toggle */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#101C35] text-white font-bold'
                      : 'bg-[#F5F7FA] hover:bg-slate-200 text-[#172033]'
                  }`}
                >
                  {cat === 'ALL' ? t.allCategories : cat}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#687386] ps-2 border-s border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded border-[#E2E8F0] text-[#101C35] focus:ring-[#101C35] cursor-pointer"
              />
              <span>{t.inStockOnly}</span>
            </label>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
            <Package className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No products match your search or filter.</p>
            <p className="text-xs">Try selecting another category or clearing search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const displayName = currentLang === 'fa' && product.nameFa ? product.nameFa : product.name;
              const displayDesc = currentLang === 'fa' && product.descriptionFa ? product.descriptionFa : product.description;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition overflow-hidden flex flex-col group"
                >
                  {/* Image Gallery */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&auto=format&fit=crop&q=80'}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 start-3 flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
                        {product.category}
                      </span>
                    </div>

                    <div className="absolute top-3 end-3">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                          product.stock > 0
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} ${t.unitsInStock}` : t.outOfStock}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                        {displayName}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{displayDesc}</p>

                      {/* Package Sizes / Variants */}
                      {product.packageSizes && product.packageSizes.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[11px] font-bold text-slate-600 block mb-1">
                            {t.packageSizesLabel}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {product.packageSizes.map((size) => (
                              <span
                                key={size.id}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium border border-slate-200"
                              >
                                {size.name} ({size.weightOrSize}): {product.currency}{size.price}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quality & Lab Badge if confirmed */}
                      {product.qualityInfo.isConfirmed && (
                        <div className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">
                            {[product.qualityInfo.grade, product.qualityInfo.standard].filter(Boolean).join(' • ')}
                          </span>
                        </div>
                      )}

                      {/* Shipping info */}
                      {product.shippingDetails.isConfirmed && product.shippingDetails.transitTime && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{product.shippingDetails.transitTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Price & Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        {company.settings.showRetailPricesPublicly ? (
                          <div>
                            <span className="text-[10px] text-slate-400 block">{t.retailPrice}</span>
                            <span className="text-lg font-extrabold text-slate-900">
                              {product.currency}{product.retailPrice}
                              <span className="text-xs font-normal text-slate-500"> / {product.unit}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            Price on Quote
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenQuoteModal(product)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#101C35] hover:bg-[#192b52] text-white transition cursor-pointer shadow-xs active:scale-95"
                        >
                          {t.requestQuoteBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Quote / Customer Inquiry Modal */}
      {selectedProductForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E2E8F0] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F5F7FA]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C9A96E]" />
                <h3 className="font-extrabold text-[#172033] text-base">{t.quoteModalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForQuote(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmitQuote} className="p-6 space-y-4">
              {submitSuccess ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center text-emerald-900 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <p className="font-bold text-base">{t.inquirySubmittedSuccess}</p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Product:</span>
                      <strong className="text-sm text-slate-900">{selectedProductForQuote.name}</strong>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">
                      {selectedProductForQuote.currency}{selectedProductForQuote.retailPrice}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.yourName}</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ahmad Khan or Global Trading Ltd"
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.contactInfo} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerContact}
                        onChange={(e) => setCustomerContact(e.target.value)}
                        placeholder="WhatsApp phone or email"
                        className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.desiredQuantity}</label>
                      <input
                        type="number"
                        min="1"
                        value={requestedQuantity}
                        onChange={(e) => setRequestedQuantity(parseInt(e.target.value, 10) || 1)}
                        className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.location}</label>
                    <input
                      type="text"
                      value={customerLocation}
                      onChange={(e) => setCustomerLocation(e.target.value)}
                      placeholder="e.g. Kabul, Herat, Dubai, Frankfurt"
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.inquiryMessage} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProductForQuote(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#687386] hover:bg-[#F5F7FA] transition"
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#101C35] hover:bg-[#192b52] text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      {isSubmitting ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>{t.submitInquiryBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
