import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Play, CheckCircle2, XCircle, X, Lock, Terminal } from 'lucide-react';
import { SecurityAuditResult, Language } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  if (!isOpen) return null;
  const t = translations[currentLang];

  const [isRunning, setIsRunning] = useState(false);
  const [auditData, setAuditData] = useState<{
    timestamp: string;
    totalTests: number;
    allPassed: boolean;
    results: SecurityAuditResult[];
  } | null>(null);

  const handleRunAudit = async () => {
    setIsRunning(true);
    try {
      const data = await api.runSecurityAudit();
      setAuditData(data);
    } catch (err: any) {
      alert(`Audit execution error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-slate-900 text-base">{t.securityAuditTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          <p className="text-slate-600 text-xs leading-relaxed">{t.securityAuditDesc}</p>

          {/* Action to trigger tests */}
          <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
            <div>
              <span className="font-bold text-sm block">Run Cross-Tenant Security Audit</span>
              <span className="text-[11px] text-slate-400">
                Executes 4 real attack vectors against backend authorization rules.
              </span>
            </div>
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? t.runningAudit : t.runAuditNowBtn}</span>
            </button>
          </div>

          {/* Results Display */}
          {auditData && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-2 font-bold text-xs ${
                  auditData.allPassed
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {auditData.allPassed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{t.allPassedBanner}</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{t.breachBanner}</span>
                  </>
                )}
              </div>

              {/* Test Items */}
              <div className="space-y-3">
                {auditData.results.map((test) => (
                  <div
                    key={test.testId}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                          {test.testId}
                        </span>
                        <strong className="text-slate-900">{test.testName}</strong>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          test.isIsolated
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {test.isIsolated ? 'BLOCKED (SECURE)' : 'LEAK DETECTED'}
                      </span>
                    </div>

                    <p className="text-slate-500 text-[11px]">{test.testDescription}</p>

                    <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px] space-y-0.5">
                      <div className="text-slate-400">Action: {test.actionAttempted}</div>
                      <div>Status: HTTP {test.statusCodeReceived} (Expected: {test.expectedStatus})</div>
                      <div className="text-slate-300 text-[10px] mt-1">{test.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
          >
            {t.closeModal}
          </button>
        </div>
      </div>
    </div>
  );
};
