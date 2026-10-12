import React, { useState } from 'react';
import { Plus, Clock, ChevronRight, Sparkles, TrendingUp, Calendar, Check } from 'lucide-react';
import { Substance } from '../types';
import { MonochromeIcon } from './icons/MonochromeIcon';

interface SubstanceCardProps {
  substance: Substance;
  savedAmount: number;
  spentAmount: number;
  currency: string;
  onQuickLog: (substance: Substance) => void;
  onQuickAddUnit?: (substance: Substance) => void;
  onOpenDetails: (substance: Substance) => void;
  onEdit?: (substance: Substance) => void;
  isDarkMode: boolean;
}

export const SubstanceCard: React.FC<SubstanceCardProps> = ({
  substance,
  savedAmount,
  spentAmount,
  currency,
  onQuickLog,
  onQuickAddUnit,
  onOpenDetails,
  isDarkMode,
}) => {
  const [isJustAdded, setIsJustAdded] = useState(false);
  // Calculate clean streak if quit_date exists
  const getStreakDisplay = () => {
    if (!substance.quit_date) {
      return { days: 0, text: 'Tracking Reduction' };
    }
    const diffMs = Date.now() - new Date(substance.quit_date).getTime();
    if (diffMs < 0) return { days: 0, text: 'Quitting today' };
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

    if (diffDays === 0) {
      if (diffHours === 0) {
        return { days: 0, text: '0 days clean streak' };
      }
      return { days: 0, text: `0 days (${diffHours}h clean)` };
    }
    return { days: diffDays, text: `${diffDays}d ${diffHours}h clean` };
  };

  const streak = getStreakDisplay();
  const dailyCost = substance.cost_per_day ?? 10;
  const monthlyEstimated = dailyCost * 30;

  const unitCost = substance.cost_per_unit != null && substance.cost_per_unit > 0
    ? substance.cost_per_unit
    : dailyCost;
  const unitName = substance.unit_name || 'unit';
  const hasSetCost = unitCost > 0;

  const handleQuickTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onQuickAddUnit || !hasSetCost) return;
    onQuickAddUnit(substance);
  };

  const cardBgClass = isDarkMode
    ? 'bg-[#1E1E1E] border-slate-800 text-white hover:border-slate-700'
    : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300';

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between ${cardBgClass}`}
    >
      <div>
        {/* 1. Quick Action Buttons — positioned ABOVE the Tracked substance name so they line up cleanly across cards in mobile view */}
        <div className={`grid ${hasSetCost && onQuickAddUnit ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-3.5`}>
          {hasSetCost && onQuickAddUnit && (
            <button
              type="button"
              onClick={handleQuickTap}
              disabled={isJustAdded}
              aria-label={`Quick add 1 ${unitName} to ${substance.name} (${currency}${unitCost.toFixed(2)})`}
              title={`Quick add 1 ${unitName} at set cost: ${currency}${unitCost.toFixed(2)}`}
              className={`min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 border shadow-2xs cursor-pointer ${
                isJustAdded
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-extrabold'
                  : isDarkMode
                  ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 hover:border-slate-600 text-white'
                  : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-800'
              }`}
            >
              {isJustAdded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">+1 Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5] text-emerald-500 dark:text-emerald-400" />
                  <span className="truncate">+1 {unitName ? unitName.charAt(0).toUpperCase() + unitName.slice(1) : 'Unit'}</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => onQuickLog(substance)}
            aria-label={`Log expense for ${substance.name}`}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow-sm text-white cursor-pointer"
            style={{ backgroundColor: substance.color_hex }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+Log</span>
          </button>
        </div>

        {/* 2. Tracked Substance Header: Icon, Name, Peak Baseline & Unit Cost */}
        <div className="flex items-start gap-3 mb-3">
          {/* Monochromatic tinted SVG icon */}
          <MonochromeIcon
            name={substance.icon_name}
            colorHex={substance.color_hex}
            size={22}
            showContainer
            containerSize="md"
            isDarkMode={isDarkMode}
          />

          <div className="flex-1 min-w-0">
            <button
              onClick={() => onOpenDetails(substance)}
              className={`text-left font-bold text-base sm:text-lg hover:underline transition-colors flex items-center gap-1.5 w-full ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              <span className="truncate">{substance.name}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 opacity-60 shrink-0" />
            </button>

            {/* Peak Spend Baseline and Unit Cost */}
            <div className="flex flex-col gap-0.5 mt-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
                <span className={`text-[11px] font-medium ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  Peak:
                </span>
                <span className="font-mono tabular-nums font-bold text-emerald-400">
                  {currency}{dailyCost.toFixed(2)}/day
                </span>
                <span className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  (~{currency}{monthlyEstimated.toFixed(0)}/mo)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                  Unit Cost:
                </span>
                <span className="font-mono font-bold text-emerald-300 dark:text-emerald-400">
                  {currency}{unitCost.toFixed(2)}
                </span>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                  / {unitName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Streak & Metrics Strip */}
        <div className={`grid grid-cols-2 gap-2 my-2.5 p-2.5 rounded-xl border ${
          isDarkMode ? 'bg-[#14161A] border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          {/* Sober Streak */}
          <div>
            <span className={`text-[10px] uppercase tracking-wider block font-bold ${
              isDarkMode ? 'text-slate-200' : 'text-slate-500'
            }`}>
              Sober Streak
            </span>
            <div className={`flex items-center gap-1 text-xs font-bold mt-0.5 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{streak.text}</span>
            </div>
          </div>

          {/* Money Saved */}
          <div>
            <span className={`text-[10px] uppercase tracking-wider block font-bold ${
              isDarkMode ? 'text-slate-200' : 'text-slate-500'
            }`}>
              Saved So Far
            </span>
            <div className="flex items-center gap-1 text-xs font-bold font-mono tabular-nums mt-0.5 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>
                {currency}
                {savedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom details link */}
      <div className={`pt-2 flex items-center justify-between text-xs border-t mt-1 ${
        isDarkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-700'
      }`}>
        <span className="font-mono tabular-nums font-semibold">
          Spent: {currency}{spentAmount.toFixed(2)}
        </span>
        <button
          onClick={() => onOpenDetails(substance)}
          className={`text-xs font-bold min-h-[32px] flex items-center gap-0.5 transition-colors ${
            isDarkMode ? 'text-white hover:text-slate-200' : 'text-slate-800 hover:text-slate-950'
          }`}
        >
          <span>Ledger &amp; Settings</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
