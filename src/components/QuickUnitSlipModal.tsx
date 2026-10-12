import React from 'react';
import { X, RotateCcw, ShieldCheck, Heart, AlertCircle } from 'lucide-react';
import { Substance } from '../types';
import { MonochromeIcon } from './icons/MonochromeIcon';

interface QuickUnitSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  substance: Substance | null;
  currency: string;
  isDarkMode: boolean;
  onConfirm: (resetSoberDate: boolean) => void | Promise<void>;
}

export const QuickUnitSlipModal: React.FC<QuickUnitSlipModalProps> = ({
  isOpen,
  onClose,
  substance,
  currency,
  isDarkMode,
  onConfirm,
}) => {
  if (!isOpen || !substance) return null;

  const unitCost =
    substance.cost_per_unit != null && substance.cost_per_unit > 0
      ? substance.cost_per_unit
      : substance.cost_per_day || 10;
  const unitName = substance.unit_name || 'unit';

  const formatSoberStreak = () => {
    if (!substance.quit_date) return null;
    const diffMs = Date.now() - new Date(substance.quit_date).getTime();
    if (diffMs < 0) return 'Quitting today';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    if (diffDays === 0) return `${diffHours} hours clean`;
    return `${diffDays} days, ${diffHours} hours clean`;
  };

  const streakDisplay = formatSoberStreak();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slip-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-2xl border shadow-2xl overflow-hidden transition-all flex flex-col ${
          isDarkMode
            ? 'bg-[#181A1F] border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <MonochromeIcon
              name={substance.icon_name}
              colorHex={substance.color_hex}
              size={22}
              showContainer
              containerSize="md"
              isDarkMode={isDarkMode}
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 font-mono">
                  +1 {unitName.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">
                  {currency}{unitCost.toFixed(2)}
                </span>
              </div>
              <h2 id="slip-modal-title" className="text-base sm:text-lg font-bold tracking-tight">
                {substance.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Empathetic check-in message */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isDarkMode
                ? 'bg-slate-900/60 border-slate-800 text-slate-200'
                : 'bg-emerald-50/70 border-emerald-100 text-slate-800'
            }`}
          >
            <Heart className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 fill-emerald-500/20" />
            <div className="text-xs leading-relaxed">
              <p className="font-semibold mb-0.5">Slips happen. What matters is staying honest.</p>
              <p className="text-slate-500 dark:text-slate-400">
                You are logging 1 {unitName} for <span className="font-semibold text-slate-900 dark:text-white">{substance.name}</span>.
                {streakDisplay && (
                  <span className="block mt-1 font-mono text-[11px] text-amber-500 dark:text-amber-400">
                    Current clean streak: {streakDisplay}
                  </span>
                )}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-center text-slate-700 dark:text-slate-200 pt-1">
            Would you like to reset your sober date?
          </p>

          {/* Decision Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* Option 1: It was just a slip, keep my sober date. */}
            <button
              type="button"
              onClick={() => onConfirm(false)}
              className={`w-full min-h-[50px] p-3.5 rounded-xl border text-left font-bold transition-all active:scale-[0.99] flex items-center gap-3.5 cursor-pointer shadow-xs ${
                isDarkMode
                  ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:border-emerald-500/60'
                  : 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-300 text-emerald-900 hover:border-emerald-400'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm block font-bold leading-tight">
                  &ldquo;It was just a slip, keep my sober date.&rdquo;
                </span>
                <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  Logs 1 unit expense while preserving your clean streak
                </span>
              </div>
            </button>

            {/* Option 2: Reset sober date */}
            <button
              type="button"
              onClick={() => onConfirm(true)}
              className={`w-full min-h-[50px] p-3.5 rounded-xl border text-left font-bold transition-all active:scale-[0.99] flex items-center gap-3.5 cursor-pointer shadow-xs ${
                isDarkMode
                  ? 'bg-amber-950/20 hover:bg-amber-950/40 border-amber-500/30 text-amber-300 hover:border-amber-500/50'
                  : 'bg-amber-50 hover:bg-amber-100/80 border-amber-300 text-amber-900 hover:border-amber-400'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm block font-bold leading-tight">
                  Reset sober date
                </span>
                <span className="text-[11px] font-normal text-amber-600 dark:text-amber-400 block mt-0.5">
                  Logs 1 unit expense and resets your sober streak to today
                </span>
              </div>
            </button>
          </div>

          {/* Cancel button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`w-full min-h-[44px] py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Cancel (Don&apos;t log)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
