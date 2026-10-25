import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Languages,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  X,
  FileText,
  Calendar,
  User,
  ArrowUpDown,
  Layers,
  Send,
  Database,
  Building,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import {
  SupportTicket,
  Company,
  Language,
  ConversationLanguage,
  TicketStatus,
  TicketPriority,
  TicketCategory
} from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface SupportViewProps {
  company: Company;
  tickets: SupportTicket[];
  currentLang: Language;
  onRefresh: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({
  company,
  tickets,
  currentLang,
  onRefresh
}) => {
  const t = translations[currentLang] || translations.en;
  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form State for New Ticket
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<TicketCategory>('general');
  const [formPriority, setFormPriority] = useState<TicketPriority>('medium');
  // Independent Conversation Language default
  const [formConvLang, setFormConvLang] = useState<ConversationLanguage>(
    currentLang === 'ps' ? 'ps' : currentLang === 'fa' ? 'fa' : 'en'
  );
  const [formAttachment, setFormAttachment] = useState('');
  const [formUploadedFiles, setFormUploadedFiles] = useState<string[]>([]);

  // Status options as required by specification
  const statusOptions: { value: TicketStatus; label: string; color: string; dotColor: string }[] = [
    { value: 'new', label: t.statusNew, color: 'bg-blue-50 text-blue-800 border-blue-200', dotColor: 'bg-blue-500' },
    { value: 'open', label: t.statusOpen, color: 'bg-indigo-50 text-indigo-800 border-indigo-200', dotColor: 'bg-indigo-500' },
    { value: 'in_progress', label: t.statusInProgress, color: 'bg-amber-50 text-amber-900 border-amber-200', dotColor: 'bg-amber-500' },
    { value: 'waiting_customer', label: t.statusWaitingCustomer, color: 'bg-purple-50 text-purple-900 border-purple-200', dotColor: 'bg-purple-500' },
    { value: 'resolved', label: t.statusResolved, color: 'bg-emerald-50 text-emerald-900 border-emerald-200', dotColor: 'bg-emerald-500' },
    { value: 'closed', label: t.statusClosed, color: 'bg-slate-100 text-slate-700 border-slate-200', dotColor: 'bg-slate-400' }
  ];

  // Priority helpers
  const priorityMap: Record<TicketPriority, { label: string; badgeClass: string }> = {
    low: { label: t.priorityLow, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
    medium: { label: t.priorityMedium, badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
    high: { label: t.priorityHigh, badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
    urgent: { label: t.priorityUrgent, badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 font-bold' }
  };

  // Category helpers
  const categoryMap: Record<TicketCategory, string> = {
    technical: t.catTechnical,
    billing: t.catBilling,
    logistics: t.catLogistics,
    quality: t.catQuality,
    account: t.catAccount,
    general: t.catGeneral
  };

  // Conversation language label helper
  const getConversationLangLabel = (code: ConversationLanguage) => {
    switch (code) {
      case 'en':
        return { label: t.langEnglish, short: 'English (LTR)', isRtl: false, flag: 'EN' };
      case 'fa':
        return { label: t.langDari, short: 'دری (RTL)', isRtl: true, flag: 'دری' };
      case 'ps':
        return { label: t.langPashto, short: 'پښتو (RTL)', isRtl: true, flag: 'پښتو' };
      default:
        return { label: code, short: code, isRtl: false, flag: code };
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate quick metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'new').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const waitingCount = tickets.filter((t) => t.status === 'waiting_customer').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  // Handle Form Submission
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formDescription.trim()) return;

    setIsSubmitting(true);
    try {
      const allAttachments = [...formUploadedFiles];
      if (formAttachment.trim()) {
        allAttachments.push(formAttachment.trim());
      }

      await api.createSupportTicket({
        companyId: company.id,
        subject: formSubject.trim(),
        description: formDescription.trim(),
        category: formCategory,
        priority: formPriority,
        conversationLanguage: formConvLang, // Independent conversation language
        attachments: allAttachments,
        createdBy: 'HEKA Corporate Director',
        status: 'new'
      });

      // Reset form
      setFormSubject('');
      setFormDescription('');
      setFormCategory('general');
      setFormPriority('medium');
      setFormAttachment('');
      setFormUploadedFiles([]);
      setIsCreateModalOpen(false);

      setSuccessBanner(t.ticketCreatedSuccess);
      setTimeout(() => setSuccessBanner(null), 5000);

      onRefresh();
    } catch (err: any) {
      alert(`Error creating ticket: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle File Upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormUploadedFiles((prev) => [...prev, `${file.name} (${(file.size / 1024).toFixed(1)} KB)`]);
    }
  };

  // Handle Status Transition
  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateSupportTicket(ticketId, { status: newStatus });
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(updated);
      }
      onRefresh();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Corporate Support Desk Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#101C35] text-white shadow-xs">
              <LifeBuoy className="w-5 h-5 text-[#C9A96E]" />
            </span>
            <h1 className="text-xl font-extrabold text-[#172033] tracking-tight">{t.supportTitle}</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#C9A96E]/20 text-[#8C6D2E] border border-[#C9A96E]/40">
              {t.independentLangBadge}
            </span>
          </div>
          <p className="text-xs text-[#687386] max-w-2xl leading-relaxed">{t.supportSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] hover:bg-slate-200 text-[#172033] transition cursor-pointer"
            title="Refresh tickets"
          >
            <RefreshCw className="w-4 h-4 text-[#687386]" />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#101C35] hover:bg-[#192b52] text-white transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#C9A96E]" />
            <span>{t.newTicketBtn}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-semibold text-emerald-900 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">{t.persistentDbNotice}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-bold text-[#687386] block">{t.filterStatusAll}</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-[#172033] font-mono tabular-nums">{totalCount}</span>
            <span className="text-[10px] text-slate-500 font-medium">Recorded</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-bold text-indigo-700 block">{t.statusOpen} / {t.statusNew}</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-indigo-900 font-mono tabular-nums">{openCount}</span>
            <span className="text-[10px] text-indigo-600 font-medium">Needs Attention</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 block">{t.statusInProgress}</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-900 font-mono tabular-nums">{inProgressCount}</span>
            <span className="text-[10px] text-amber-600 font-medium">Under Review</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 block">{t.statusResolved}</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-900 font-mono tabular-nums">{resolvedCount}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Completed</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#687386] absolute start-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchTicketsPlaceholder}
              className="w-full text-xs sm:text-sm ps-10 pe-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#101C35]/20 transition"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#101C35]/20"
            >
              <option value="ALL">{currentLang === 'fa' ? 'همه دسته‌بندی‌ها' : currentLang === 'ps' ? 'ټولې وېشنیزې' : 'All Categories'}</option>
              {Object.entries(categoryMap).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-[#E2E8F0] pt-2">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#101C35] text-white shadow-xs'
                : 'bg-[#F5F7FA] text-[#687386] hover:bg-slate-200'
            }`}
          >
            {t.filterStatusAll} ({totalCount})
          </button>
          {statusOptions.map((opt) => {
            const count = tickets.filter((tk) => tk.status === opt.value).length;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === opt.value
                    ? 'bg-[#101C35] text-white font-bold shadow-xs'
                    : 'bg-[#F5F7FA] text-[#687386] hover:bg-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor}`} />
                <span>{opt.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tickets List Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead className="bg-[#F5F7FA] text-[#687386] uppercase font-bold text-[10px] tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3.5">{t.ticketNumber}</th>
                <th className="px-4 py-3.5">{t.subjectLabel}</th>
                <th className="px-4 py-3.5">{t.categoryLabel}</th>
                <th className="px-4 py-3.5">{t.priorityLabel}</th>
                <th className="px-4 py-3.5">
                  <span className="flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{t.conversationLangLabel}</span>
                  </span>
                </th>
                <th className="px-4 py-3.5">{t.statusLabel}</th>
                <th className="px-4 py-3.5">{t.creationDateLabel}</th>
                <th className="px-4 py-3.5 text-center">{t.actionsLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#687386] space-y-2">
                    <LifeBuoy className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-semibold text-sm text-[#172033]">{t.noTicketsFound}</p>
                    <p className="text-xs text-[#687386]">{t.noTicketsMatchingFilter}</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const statusInfo = statusOptions.find((s) => s.value === ticket.status) || statusOptions[0];
                  const priorityInfo = priorityMap[ticket.priority] || priorityMap.medium;
                  const convLangInfo = getConversationLangLabel(ticket.conversationLanguage);

                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="hover:bg-[#F5F7FA]/70 transition-colors cursor-pointer group"
                    >
                      {/* Ticket Number */}
                      <td className="px-4 py-3.5 font-mono font-bold text-[#101C35] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                          {ticket.ticketNumber}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-3.5 max-w-xs sm:max-w-md">
                        <div className="font-bold text-[#172033] group-hover:text-[#101C35] line-clamp-1">
                          {ticket.subject}
                        </div>
                        <p className="text-[11px] text-[#687386] line-clamp-1 mt-0.5">
                          {ticket.description}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[#172033] font-medium">
                        {categoryMap[ticket.category] || ticket.category}
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${priorityInfo.badgeClass}`}
                        >
                          {priorityInfo.label}
                        </span>
                      </td>

                      {/* Independent Conversation Language */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[#172033] border border-[#E2E8F0] font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
                          <span>{convLangInfo.short}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[#687386] font-mono text-[11px]">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#101C35] hover:bg-slate-100 transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>{t.viewTicket}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Storage & Data Integrity Footer */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#687386] gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#101C35]" />
          <span>
            {isRtl
              ? 'تیکت‌های ثبت‌شده در پایگاه داده اختصاصی شرکت ذخیره شده و پس از ریفرش حفظ می‌شوند.'
              : 'All support tickets are stored in the HEKA corporate database and persist across sessions.'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Tenant Isolated: {company.name}</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* INITIAL TICKET CREATION MODAL */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101C35]/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#E2E8F0] my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F5F7FA]">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-[#C9A96E]" />
                <div>
                  <h3 className="font-extrabold text-[#172033] text-base">{t.createTicketTitle}</h3>
                  <span className="text-[11px] text-[#687386] block">{company.name}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-[#687386] hover:text-[#172033] rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
              <p className="text-xs text-[#687386] bg-[#F5F7FA] p-3 rounded-xl border border-[#E2E8F0]">
                {t.createTicketDesc}
              </p>

              {/* 1. Subject */}
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  {t.subjectLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder={t.subjectPlaceholder}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#101C35]/20 bg-white"
                />
              </div>

              {/* 2. Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    {t.categoryLabel}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TicketCategory)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#101C35]/20"
                  >
                    {Object.entries(categoryMap).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    {t.priorityLabel}
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TicketPriority)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#101C35]/20"
                  >
                    <option value="low">{t.priorityLow}</option>
                    <option value="medium">{t.priorityMedium}</option>
                    <option value="high">{t.priorityHigh}</option>
                    <option value="urgent">{t.priorityUrgent}</option>
                  </select>
                </div>
              </div>

              {/* 3. Independent Conversation Language Selector (Specification Requirement #2) */}
              <div className="p-3.5 rounded-xl border border-[#C9A96E]/40 bg-[#C9A96E]/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#101C35] flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-[#C9A96E]" />
                    <span>{t.conversationLangLabel}</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#8C6D2E] border border-[#C9A96E]/30">
                    {t.independentLangBadge}
                  </span>
                </div>
                <p className="text-[11px] text-[#687386]">
                  {t.conversationLangDesc}
                </p>

                {/* 3-way radio button selector for English / Dari / Pashto */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { code: 'en' as ConversationLanguage, label: 'English', sub: 'Left-to-Right' },
                    { code: 'fa' as ConversationLanguage, label: 'دری (Dari)', sub: 'Right-to-Left' },
                    { code: 'ps' as ConversationLanguage, label: 'پښتو (Pashto)', sub: 'Right-to-Left' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setFormConvLang(lang.code)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        formConvLang === lang.code
                          ? 'border-[#101C35] bg-[#101C35] text-white shadow-xs'
                          : 'border-[#E2E8F0] bg-white text-[#172033] hover:bg-slate-50'
                      }`}
                    >
                      <strong className="block text-xs">{lang.label}</strong>
                      <span className="text-[10px] opacity-75 block mt-0.5">{lang.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Description (with correct text direction based on chosen conversation language) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#172033]">
                    {t.descriptionLabel} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#687386] font-mono">
                    Text dir: {formConvLang === 'en' ? 'LTR' : 'RTL'}
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  dir={formConvLang === 'en' ? 'ltr' : 'rtl'}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#101C35]/20 bg-white leading-relaxed resize-none"
                />
              </div>

              {/* 5. Optional Attachment Field (Specification Requirement #3) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#172033]">
                  {t.attachmentsLabel}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formAttachment}
                    onChange={(e) => setFormAttachment(e.target.value)}
                    placeholder={t.attachmentsPlaceholder}
                    className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#101C35]/20"
                  />
                  <label className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] hover:bg-slate-200 text-[#172033] font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Paperclip className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Upload</span>
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Uploaded files list */}
                {formUploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formUploadedFiles.map((fn, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-[#172033] border border-[#E2E8F0]"
                      >
                        <FileText className="w-3 h-3 text-[#C9A96E]" />
                        <span>{fn}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#687386] hover:bg-[#F5F7FA] transition cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#101C35] hover:bg-[#192b52] text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>{isSubmitting ? 'Submitting...' : t.newTicketBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TICKET DETAILS MODAL / DRAWER */}
      {/* ============================================================== */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101C35]/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E2E8F0] my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F5F7FA]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-[#101C35] text-white shadow-2xs">
                  {selectedTicket.ticketNumber}
                </span>
                <h3 className="font-extrabold text-[#172033] text-base truncate max-w-sm">
                  {t.ticketDetailsTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-[#687386] hover:text-[#172033] rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
              {/* Subject Banner */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#687386] uppercase tracking-wider block">
                  {t.subjectLabel}
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#172033] leading-snug">
                  {selectedTicket.subject}
                </h2>
              </div>

              {/* Status and Properties Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F7FA] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#687386] block">{t.statusLabel}</span>
                  <div className="mt-1">
                    <select
                      value={selectedTicket.status}
                      disabled={isUpdatingStatus}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as TicketStatus)}
                      className="text-xs font-bold px-2 py-1 rounded-lg border border-[#E2E8F0] bg-white text-[#101C35] focus:outline-none focus:ring-1 focus:ring-[#101C35]"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#687386] block">{t.priorityLabel}</span>
                  <span className="font-bold text-[#172033] block mt-1">
                    {priorityMap[selectedTicket.priority]?.label || selectedTicket.priority}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#687386] block">{t.categoryLabel}</span>
                  <span className="font-bold text-[#172033] block mt-1 truncate">
                    {categoryMap[selectedTicket.category] || selectedTicket.category}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#687386] block">
                    {t.conversationLangLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#101C35] block mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
                    <span>{getConversationLangLabel(selectedTicket.conversationLanguage).short}</span>
                  </span>
                </div>
              </div>

              {/* Description box formatted with conversation language's text direction */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172033]">{t.descriptionLabel}</span>
                  <span className="text-[10px] font-mono text-[#687386] bg-slate-100 px-2 py-0.5 rounded">
                    Conversation: {getConversationLangLabel(selectedTicket.conversationLanguage).short}
                  </span>
                </div>
                <div
                  dir={selectedTicket.conversationLanguage === 'en' ? 'ltr' : 'rtl'}
                  className="bg-white p-4 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#172033] leading-relaxed whitespace-pre-wrap font-sans shadow-2xs"
                >
                  {selectedTicket.description}
                </div>
              </div>

              {/* Attachments Section */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{t.attachmentsLabel}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-semibold text-[#172033]"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Metadata */}
              <div className="border-t border-[#E2E8F0] pt-3 flex flex-wrap items-center justify-between text-[11px] text-[#687386] gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  <span>Created by: {selectedTicket.createdBy || 'Staff'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Logged: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#101C35] hover:bg-[#192b52] text-white transition cursor-pointer"
                >
                  {t.closeModal}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
