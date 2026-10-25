import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Languages,
  ArrowRight,
  ArrowLeft,
  Package
} from 'lucide-react';
import { Product, Company, Language, GeneratedSalesReply } from '../types';
import { translations } from '../translations';
import { generateUniversalSalesReply } from '../utils/salesAssistantEngine';

interface SalesAIViewProps {
  company: Company;
  products: Product[];
  currentLang: Language;
  initialInquiryMessage?: string;
  initialProductId?: string;
}

export const SalesAIView: React.FC<SalesAIViewProps> = ({
  company,
  products,
  currentLang,
  initialInquiryMessage,
  initialProductId,
}) => {
  const t = translations[currentLang];
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || products[0]?.id || ''
  );
  const [replyLang, setReplyLang] = useState<Language>(currentLang);
  const [customerMessage, setCustomerMessage] = useState<string>(
    initialInquiryMessage ||
      (currentLang === 'fa'
        ? `سلام و احترام، آیا این جنس را در گدام موجود دارید؟ قیمت نهایی با ارسال چند می‌شود و آیا برای خرید ۲ عدد تخفیف می‌دهید؟`
        : `Hello! Is this product in stock? What is the final price with delivery, and do you give any discount if I buy 2 units?`)
  );
  const [reply, setReply] = useState<GeneratedSalesReply | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleGenerate = () => {
    if (!selectedProduct || !customerMessage.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const result = generateUniversalSalesReply(selectedProduct, company, customerMessage, replyLang);
      setReply(result);
      setIsGenerating(false);
    }, 250);
  };

  // Generate on first mount or selection
  useEffect(() => {
    if (selectedProduct && customerMessage.trim()) {
      const result = generateUniversalSalesReply(selectedProduct, company, customerMessage, replyLang);
      setReply(result);
    }
  }, [selectedProductId, replyLang]);

  const handleCopy = async () => {
    if (!reply?.text) return;
    try {
      await navigator.clipboard.writeText(reply.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleWhatsAppSend = () => {
    if (!reply?.text) return;
    const phone = company.contactPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(reply.text);
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Product Selection & Inquiry Input */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{t.salesAITitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t.salesAIDesc}</p>
          </div>

          {/* Product Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.selectProductLabel}</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.currency}{p.retailPrice} • {p.stock} in stock)
                </option>
              ))}
            </select>
          </div>

          {/* Selected Product Card Snapshot */}
          {selectedProduct && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center gap-3">
              <img
                src={selectedProduct.images[0] || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&auto=format&fit=crop&q=80'}
                alt=""
                className="w-12 h-12 rounded-lg object-cover border"
              />
              <div className="flex-1 text-xs">
                <strong className="text-slate-900 block truncate">{selectedProduct.name}</strong>
                <span className="text-slate-500">
                  {selectedProduct.currency}{selectedProduct.retailPrice} / {selectedProduct.unit} • Stock: {selectedProduct.stock}
                </span>
              </div>
            </div>
          )}

          {/* Customer Message Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.customerInquiryLabel}</span>
              </label>

              {/* Reply Language Switcher */}
              <div className="flex items-center gap-1 bg-[#F5F7FA] p-0.5 rounded-xl border border-[#E2E8F0] text-xs">
                <button
                  type="button"
                  onClick={() => setReplyLang('fa')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                    replyLang === 'fa' ? 'bg-[#101C35] text-white shadow-xs' : 'text-[#687386] hover:text-[#172033]'
                  }`}
                >
                  دری
                </button>
                <button
                  type="button"
                  onClick={() => setReplyLang('en')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                    replyLang === 'en' ? 'bg-[#101C35] text-white shadow-xs' : 'text-[#687386] hover:text-[#172033]'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-[#172033] hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#101C35] resize-none leading-relaxed"
            />
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !customerMessage.trim()}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#101C35] hover:bg-[#192b52] text-white transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            {isGenerating ? (
              <span>{t.generating}</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                <span>{t.generateReplyBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Grounded Reply Card */}
      <div className="lg:col-span-7 space-y-4">
        {reply && (
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-[#172033] text-base">{t.step3Title}</h3>
              </div>
              <span className="text-xs text-[#687386] font-mono">{reply.createdAt}</span>
            </div>

            {/* Warning if unconfirmed details */}
            {reply.hasUnconfirmedDetails && (
              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3.5 text-amber-950 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t.unconfirmedAlertTitle}</span>
                </div>
                <p className="text-[11px] text-amber-800">{t.unconfirmedAlertDesc}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {reply.unconfirmedItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 font-bold text-[10px]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Text Box */}
            <div className="bg-[#F5F7FA] p-4 rounded-xl border border-[#E2E8F0] whitespace-pre-wrap text-xs sm:text-sm text-[#172033] leading-relaxed font-sans">
              {reply.text}
            </div>

            {/* Action Buttons: Copy and WhatsApp */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#101C35] hover:bg-[#192b52] text-white shadow-xs'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-[#C9A96E]" />}
                <span>{copied ? t.copiedBtn : t.copyReplyBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppSend}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition cursor-pointer"
                title="Send reply via WhatsApp"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{t.whatsappReply}</span>
              </button>
            </div>

            {/* Verified Facts List */}
            {reply.factsUsed.length > 0 && (
              <div className="rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] p-3 space-y-1.5 text-xs">
                <span className="font-bold text-[#172033] block text-[11px]">{t.verifiedFacts}</span>
                <div className="flex flex-wrap gap-1.5">
                  {reply.factsUsed.map((fact, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {fact}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
