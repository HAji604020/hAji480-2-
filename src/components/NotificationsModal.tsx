import React from 'react';
import { X, Bell, ShoppingCart, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: AppNotification) => void;
  isRtl?: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
  isRtl = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#101C35]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F5F7FA]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#101C35]" />
            <h2 className="text-base font-extrabold text-[#172033]">
              {isRtl ? 'اعلان‌ها و رویدادهای سیستم' : 'Notifications & Alerts'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-xs font-bold text-[#101C35] hover:text-[#C9A96E] cursor-pointer transition-colors"
            >
              {isRtl ? 'علامت‌گذاری همه به عنوان خوانده‌شده' : 'Mark all read'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[#687386] hover:text-[#172033] hover:bg-[#E2E8F0] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-[#E2E8F0] max-h-[65vh] overflow-y-auto p-2">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              const Icon = {
                order: ShoppingCart,
                inquiry: MessageSquare,
                security: ShieldCheck,
                system: Clock,
                inventory: Bell
              }[notif.type] || Bell;

              const iconBg = {
                order: 'bg-[#101C35]/5 text-[#101C35]',
                inquiry: 'bg-emerald-50 text-emerald-800',
                security: 'bg-rose-50 text-rose-800',
                system: 'bg-[#F5F7FA] text-[#687386]',
                inventory: 'bg-[#C9A96E]/20 text-[#8C6D2E]'
              }[notif.type] || 'bg-[#F5F7FA] text-[#687386]';

              return (
                <div
                  key={notif.id}
                  onClick={() => onSelectNotification(notif)}
                  className={`p-3.5 rounded-xl transition cursor-pointer flex items-start gap-3 ${
                    notif.read ? 'hover:bg-[#F5F7FA] opacity-75' : 'bg-[#F5F7FA]/70 hover:bg-[#F5F7FA] font-medium'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-[#E2E8F0] ${iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 text-xs text-left rtl:text-right">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-[#172033] font-bold truncate block">
                        {notif.title}
                      </strong>
                      <span className="text-[10px] text-[#687386] font-mono shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-[#687386] mt-0.5 leading-relaxed">{notif.message}</p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-[#C9A96E] shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-[#687386]">
              {isRtl ? 'هیچ اعلان جدیدی وجود ندارد.' : 'No notifications at this time.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F5F7FA] text-right rtl:text-left">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#101C35] hover:bg-[#192b52] text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            {isRtl ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
