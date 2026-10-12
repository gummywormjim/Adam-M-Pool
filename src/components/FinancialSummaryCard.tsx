import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ChevronRight, PieChart, Trash2, RotateCcw } from 'lucide-react';
import { sqliteStorage } from '../db/sqliteStorage';
import { ConfirmDestructiveDialog } from './drive/ConfirmDestructiveDialog';

interface FinancialSummaryCardProps {
  totalSaved: number;
  totalSpent: number;
  currency: string;
  timeframe: 'week' | 'month' | 'all';
  onTimeframeChange: (tf: 'week' | 'month' | 'all') => void;
  onOpenDetailedReports: () => void;
  onResetTotalSpent?: () => void;
  isDarkMode: boolean;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  totalSaved,
  totalSpent,
  currency,
  timeframe,
  onTimeframeChange,
  onOpenDetailedReports,
  onResetTotalSpent,
  isDarkMode,
}) => {
  const [showEraseConfirm, setShowEraseConfirm] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  const handleConfirmErase = async () => {
    setIsErasing(true);
    await sqliteStorage.clearAllExpenseLogs();
    setIsErasing(false);
    setShowEraseConfirm(false);
    if (onResetTotalSpent) {
      onResetTotalSpent();
    }
  };
  const netImpact = totalSaved - totalSpent;
  const isNetPositive = netImpact >= 0;
  const totalCombined = totalSaved + totalSpent;
  const savedPercent = totalCombined > 0 ? (totalSaved / totalCombined) * 100 : 100;

  return (
    <section
      aria-label="Financial Summary Metrics"
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
        isDarkMode
          ? 'bg-[#181A1E] border-slate-800 text-slate-100 shadow-sm'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Card Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Financial Impact Overview
            </h3>
            <span className="text-xs font-mono text-slate-400">· Saved vs. Spent</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real cash preserved since establishing recovery baselines
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => onTimeframeChange('week')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              timeframe === 'week'
                ? 'bg-white dark:bg-[#25282E] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => onTimeframeChange('month')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              timeframe === 'month'
                ? 'bg-white dark:bg-[#25282E] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => onTimeframeChange('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              timeframe === 'all'
                ? 'bg-white dark:bg-[#25282E] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Main KPI Grid: Total Saved vs Total Spent */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Total Saved */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            isDarkMode
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-500 dark:text-emerald-400 mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Total Saved
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums text-emerald-500 dark:text-emerald-400">
            {currency}
            {totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-white/80' : 'text-emerald-800'}`}>
            Protected from addiction expenses
          </p>
        </div>

        {/* Total Spent */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            isDarkMode
              ? 'bg-[#14161A] border-slate-800 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-rose-500 dark:text-rose-400 mb-1">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              Total Spent
            </span>

            {/* Button to erase total spent and reset to 0.00 */}
            <button
              type="button"
              onClick={() => setShowEraseConfirm(true)}
              aria-label="Erase Total Spent"
              title="Erase all logged expenses and reset total spent to 0.00"
              className="px-2 py-0.5 rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Erase</span>
            </button>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {currency}
            {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className={`text-[11px] ${isDarkMode ? 'text-white/70' : 'text-slate-500'}`}>
              Logged consumption purchases
            </p>
            {totalSpent > 0 && (
              <button
                type="button"
                onClick={() => setShowEraseConfirm(true)}
                className="text-[10px] font-bold text-rose-500 hover:underline"
              >
                Reset to 0.00
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Preservation Ratio Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
          <span className={isDarkMode ? 'text-white/80' : 'text-slate-600'}>
            Financial Retention Ratio
          </span>
          <span className="font-mono tabular-nums text-emerald-400">
            {savedPercent.toFixed(1)}% Protected
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${savedPercent}%` }}
          />
          <div
            className="h-full bg-rose-500/80 transition-all duration-500"
            style={{ width: `${100 - savedPercent}%` }}
          />
        </div>
      </div>

      {/* Net Financial Impact & Detailed Reports Trigger */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>Net Impact:</span>
          <span
            className={`font-mono text-sm sm:text-base font-bold tabular-nums ${
              isNetPositive
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {isNetPositive ? '+' : ''}
            {currency}
            {netImpact.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <button
          onClick={onOpenDetailedReports}
          className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
            isDarkMode
              ? 'text-white hover:bg-slate-800'
              : 'text-slate-800 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Full Reports</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Confirmation Window for Erasing Total Spent */}
      <ConfirmDestructiveDialog
        isOpen={showEraseConfirm}
        title="Erase Total Spent?"
        description={`Are you sure you want to erase all logged expense records? This will permanently reset your Total Spent calculation to ${currency}0.00. Your saved metrics, streaks, and tracked habits will remain preserved.`}
        confirmLabel="Erase & Reset to 0.00"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isErasing}
        onConfirm={handleConfirmErase}
        onCancel={() => setShowEraseConfirm(false)}
        isDarkMode={isDarkMode}
      />
    </section>
  );
};
