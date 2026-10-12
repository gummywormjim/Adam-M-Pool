import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  ArrowUpRight,
  Download,
  Cloud,
  Trash2,
} from 'lucide-react';
import { Substance, ExpenseLog } from '../types';
import { sqliteStorage } from '../db/sqliteStorage';
import { MonochromeIcon } from './icons/MonochromeIcon';
import { ConfirmDestructiveDialog } from './drive/ConfirmDestructiveDialog';

interface FinancialReportsViewProps {
  onBack: () => void;
  currency: string;
  isDarkMode: boolean;
  onOpenDrive?: () => void;
  onDataUpdated?: () => void;
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  onBack,
  currency,
  isDarkMode,
  onOpenDrive,
  onDataUpdated,
}) => {
  const [showEraseConfirm, setShowEraseConfirm] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  const handleConfirmErase = async () => {
    setIsErasing(true);
    await sqliteStorage.clearAllExpenseLogs();
    setIsErasing(false);
    setShowEraseConfirm(false);
    if (onDataUpdated) {
      onDataUpdated();
    }
  };
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly' | 'annual'>('weekly');
  const substances = sqliteStorage.getSubstances();
  const allLogs = sqliteStorage.getExpenseLogs();

  const timeframe = reportPeriod === 'weekly' ? 'week' : reportPeriod === 'monthly' ? 'month' : 'all';
  const financials = sqliteStorage.calculateFinancials(timeframe);

  // Group logs by trigger tag
  const triggerCounts: Record<string, { count: number; totalSpent: number }> = {};
  allLogs.forEach((log) => {
    const tag = log.trigger_tag || 'Untagged';
    if (!triggerCounts[tag]) {
      triggerCounts[tag] = { count: 0, totalSpent: 0 };
    }
    triggerCounts[tag].count += 1;
    triggerCounts[tag].totalSpent += log.amount_spent;
  });

  const sortedTriggers = Object.entries(triggerCounts).sort((a, b) => b[1].totalSpent - a[1].totalSpent);

  // Calculate annual projected savings
  const annualSavingsPerSubstance = substances.map((s) => {
    const dailyCost =
      s.cost_per_day ??
      (s.cost_per_unit != null
        ? (s.cost_per_unit * (s.daily_habit_units || 1)) / (s.frequency === 'weekly' ? 7 : 1)
        : 10);
    const yearSaved = dailyCost * 365;
    const fiveYearSaved = dailyCost * 365 * 5;
    return {
      substance: s,
      dailyCost,
      yearSaved,
      fiveYearSaved,
    };
  });

  const totalProjectedYearlySavings = annualSavingsPerSubstance.reduce((sum, item) => sum + item.yearSaved, 0);

  const exportCSV = () => {
    const rows = [
      ['Date', 'Substance', 'Amount Spent', 'Trigger', 'Note'],
      ...allLogs.map((log) => {
        const sub = substances.find((s) => s.id === log.substance_id);
        return [
          new Date(log.logged_at).toISOString(),
          sub?.name || 'Unknown',
          log.amount_spent.toFixed(2),
          log.trigger_tag || 'N/A',
          `"${(log.note || '').replace(/"/g, '""')}"`,
        ];
      }),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `habitvault-financial-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="min-h-[44px] flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenDrive && (
            <button
              onClick={onOpenDrive}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl border border-sky-300 dark:border-sky-800/80 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/60 flex items-center gap-1.5 transition-colors"
              title="Backup or sync reports to Google Drive"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-500" />
              <span>Google Drive</span>
            </button>
          )}

          <button
            onClick={exportCSV}
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Ledger</span>
          </button>
        </div>
      </div>

      {/* Page Title & Scope Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Impact Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed spending audits, trigger breakdown, and future wealth projection
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setReportPeriod('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              reportPeriod === 'weekly'
                ? 'bg-white dark:bg-[#25282E] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Weekly Audit
          </button>
          <button
            onClick={() => setReportPeriod('monthly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              reportPeriod === 'monthly'
                ? 'bg-white dark:bg-[#25282E] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Monthly Audit
          </button>
          <button
            onClick={() => setReportPeriod('annual')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              reportPeriod === 'annual'
                ? 'bg-white dark:bg-[#25282E] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}
        >
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 block mb-1">
            Period Saved
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
            {currency}{financials.totalSaved.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-700/70 dark:text-emerald-300/60 mt-1 block">
            Retained through abstinence
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-slate-900/60 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-rose-500 dark:text-rose-400">
              Period Spent
            </span>
            {financials.totalSpent > 0 && (
              <button
                type="button"
                onClick={() => setShowEraseConfirm(true)}
                className="px-2 py-0.5 rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Erase all logged expense records and reset total spent to 0.00"
              >
                <Trash2 className="w-3 h-3" />
                <span>Erase</span>
              </button>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums text-slate-800 dark:text-slate-200">
            {currency}{financials.totalSpent.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {financials.relevantExpensesCount} logged slips
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#181A1E] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <span className="text-xs font-medium text-slate-400 block mb-1">
            Net Financial Protection
          </span>
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums ${
              financials.netImpact >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {financials.netImpact >= 0 ? '+' : ''}
            {currency}{financials.netImpact.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Saved minus expenditures
          </span>
        </div>
      </div>

      {/* Projected Future Wealth Section */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#181A1E] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Projected Long-Term Wealth Protected
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-500 font-semibold">
            {currency}{totalProjectedYearlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })} / Year
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Based on your historical usage baselines across all tracked substances, here is what staying clean preserves:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#14161A]">
            <span className="text-[11px] text-slate-400 block mb-1">In 3 Months</span>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-500">
              {currency}{(totalProjectedYearlySavings * 0.25).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-slate-400">Equivalent to a weekend getaway</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#14161A]">
            <span className="text-[11px] text-slate-400 block mb-1">In 1 Full Year</span>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-500">
              {currency}{totalProjectedYearlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-slate-400">Major investment or emergency fund</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#14161A]">
            <span className="text-[11px] text-slate-400 block mb-1">In 5 Years</span>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-500">
              {currency}{(totalProjectedYearlySavings * 5).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-slate-400">Substantial life-changing capital</span>
          </div>
        </div>
      </div>

      {/* Triggers Analysis Section */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#181A1E] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Trigger Cost Analysis
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Identifies the psychological emotional states that lead to spending slips:
        </p>

        {sortedTriggers.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 border border-dashed rounded-xl">
            No tagged slips recorded. Clean streak intact!
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTriggers.map(([tag, data]) => {
              const percent =
                financials.totalSpent > 0 ? (data.totalSpent / financials.totalSpent) * 100 : 0;
              return (
                <div key={tag} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200">{tag}</span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {currency}{data.totalSpent.toFixed(2)} ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Per-Substance Breakdown Table */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#181A1E] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Substance Financial Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5">Substance</th>
                <th className="py-2.5">Peak Baseline</th>
                <th className="py-2.5">Unit Cost</th>
                <th className="py-2.5 text-right">Saved</th>
                <th className="py-2.5 text-right">Spent</th>
                <th className="py-2.5 text-right">Net Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono tabular-nums">
              {substances.map((sub) => {
                const saved = financials.perSubstanceSaved[sub.id] || 0;
                const spent = financials.perSubstanceSpent[sub.id] || 0;
                const net = saved - spent;
                const unitCost = sub.cost_per_unit != null && sub.cost_per_unit > 0 ? sub.cost_per_unit : sub.cost_per_day;
                const unitLabel = sub.unit_name || 'unit';
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-3 font-sans font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color_hex }} />
                      <span className="text-slate-900 dark:text-white">{sub.name}</span>
                    </td>
                    <td className="py-3 text-amber-500/90 dark:text-amber-400 font-mono text-xs font-semibold">
                      {currency}{sub.cost_per_day.toFixed(2)}/day
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-xs">
                      {currency}{unitCost.toFixed(2)}/{unitLabel}
                    </td>
                    <td className="py-3 text-right text-emerald-500 font-bold">
                      {currency}{saved.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-rose-500 font-bold">
                      {currency}{spent.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 text-right font-bold ${
                        net >= 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {net >= 0 ? '+' : ''}{currency}{net.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Window for Erasing Spent History */}
      <ConfirmDestructiveDialog
        isOpen={showEraseConfirm}
        title="Erase All Spending Records?"
        description={`Are you sure you want to erase all logged expense records? This will permanently reset Total Spent to ${currency}0.00 across all audits. Your sobriety milestones and savings will remain intact.`}
        confirmLabel="Erase & Reset to 0.00"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isErasing}
        onConfirm={handleConfirmErase}
        onCancel={() => setShowEraseConfirm(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
