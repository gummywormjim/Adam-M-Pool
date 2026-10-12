import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ShieldCheck,
  Edit3,
  Check,
  Layers,
  Sparkles,
  TrendingDown,
  Percent,
} from 'lucide-react';
import { sqliteStorage } from '../db/sqliteStorage';
import { Substance } from '../types';
import { MonochromeIcon } from './icons/MonochromeIcon';

interface MonthlyIncomeImpactCardProps {
  currency: string;
  isDarkMode: boolean;
  onIncomeUpdated?: () => void;
}

export const MonthlyIncomeImpactCard: React.FC<MonthlyIncomeImpactCardProps> = ({
  currency,
  isDarkMode,
  onIncomeUpdated,
}) => {
  const [incomeInput, setIncomeInput] = useState<string>('');
  const [savedIncome, setSavedIncome] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0); // 0 = ALL

  const substances = sqliteStorage.getSubstances();

  useEffect(() => {
    const stored = sqliteStorage.getSetting('monthly_income', '');
    if (stored && !isNaN(Number(stored)) && Number(stored) > 0) {
      setSavedIncome(Number(stored));
      setIncomeInput(stored);
    } else {
      setSavedIncome(null);
      setIncomeInput('');
    }
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(incomeInput);
    if (!isNaN(val) && val > 0) {
      setSavedIncome(val);
      await sqliteStorage.setSetting('monthly_income', String(val));
      setIsEditing(false);
      if (onIncomeUpdated) onIncomeUpdated();
    }
  };

  const handleClear = async () => {
    setSavedIncome(null);
    setIncomeInput('');
    setIsEditing(false);
    await sqliteStorage.setSetting('monthly_income', '');
    if (onIncomeUpdated) onIncomeUpdated();
  };

  // Switchable options: Far-left is 'ALL', followed by each tracked substance
  const substanceFilterOptions: Array<{
    id: number | 'ALL';
    name: string;
    substance?: Substance;
  }> = [
    { id: 'ALL', name: 'ALL' },
    ...substances.map((s) => ({
      id: s.id,
      name: s.name,
      substance: s,
    })),
  ];

  // Keep index within bounds if substances list changes
  const activeIndex = Math.min(selectedOptionIndex, substanceFilterOptions.length - 1);
  const activeOption = substanceFilterOptions[activeIndex] || substanceFilterOptions[0];
  const isAllSelected = activeOption.id === 'ALL';
  const activeSubstance = activeOption.substance;

  // 30-day (monthly) financial calculations
  const monthlyFinancials = sqliteStorage.calculateFinancials('month');

  // Determine spend and saved based on selection
  let currentSpent = 0;
  let currentSaved = 0;
  let targetColorHex = '#10B981'; // default emerald

  if (isAllSelected) {
    currentSpent = monthlyFinancials.totalSpent;
    currentSaved = monthlyFinancials.totalSaved;
    targetColorHex = '#F43F5E'; // rose for all slips
  } else if (activeSubstance) {
    currentSpent = monthlyFinancials.perSubstanceSpent[activeSubstance.id] || 0;
    currentSaved = monthlyFinancials.perSubstanceSaved[activeSubstance.id] || 0;
    targetColorHex = activeSubstance.color_hex || '#F43F5E';
  }

  // Percentage calculations against monthly income
  const spentPercentage =
    savedIncome && savedIncome > 0
      ? Math.min(100, (currentSpent / savedIncome) * 100)
      : 0;

  const savedPercentage =
    savedIncome && savedIncome > 0
      ? Math.min(100, (currentSaved / savedIncome) * 100)
      : 0;

  const retainedPercentage = Math.max(0, 100 - spentPercentage);

  return (
    <section
      aria-label="Monthly Income Substance Impact"
      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-sm ${
        isDarkMode
          ? 'bg-[#181A1E] border-slate-700 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDarkMode
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}
          >
            <Wallet className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Monthly Income Impact
              </h3>
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                  isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Optional
              </span>
            </div>
            <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
              Calculate what percentage of your monthly income is spent on substances vs retained for freedom
            </p>
          </div>
        </div>

        {savedIncome !== null && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
              isDarkMode
                ? 'text-white hover:bg-slate-800'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Income</span>
          </button>
        )}
      </div>

      {/* Income Input or Result */}
      {savedIncome === null || isEditing ? (
        /* Income Setup Form */
        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <span
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono ${
                  isDarkMode ? 'text-white' : 'text-slate-500'
                }`}
              >
                {currency}
              </span>
              <input
                type="number"
                step="1"
                min="100"
                required
                placeholder="Enter monthly net income (e.g. 4000)"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-mono font-bold outline-hidden transition-colors ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                }`}
                autoFocus={isEditing}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Income</span>
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                    isDarkMode
                      ? 'border-slate-700 text-white hover:bg-slate-800'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      ) : (
        /* Results Section with Substance Switchable Buttons */
        <div className="space-y-4 pt-1">
          {/* Substance Impact Switchable Buttons (ALL on the far left) */}
          <div
            className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-[#14161A] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  Substance Impact Selection
                </span>
                <span className={`text-[11px] ${isDarkMode ? 'text-white/80' : 'text-slate-500'}`}>
                  Quick-tap any button to inspect its monthly income impact, or tap ALL on the far left
                </span>
              </div>

              {/* Active Highlight Badge */}
              <div
                className="self-start sm:self-auto px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border shadow-xs transition-colors"
                style={{
                  backgroundColor: isAllSelected
                    ? '#059669'
                    : activeSubstance?.color_hex || '#059669',
                  borderColor: isAllSelected
                    ? '#10B981'
                    : activeSubstance?.color_hex || '#10B981',
                  color: '#FFFFFF',
                }}
              >
                {isAllSelected ? (
                  <Layers className="w-3.5 h-3.5" />
                ) : (
                  activeSubstance && (
                    <MonochromeIcon
                      name={activeSubstance.icon_name}
                      colorHex="#FFFFFF"
                      size={14}
                      isDarkMode={true}
                    />
                  )
                )}
                <span>
                  {isAllSelected
                    ? 'Selected: ALL (Combined Habits)'
                    : `Selected: ${activeOption.name} (${currency}${currentSpent.toFixed(2)}/mo)`}
                </span>
              </div>
            </div>

            {/* Switchable Highlightable Buttons */}
            <div
              className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin"
              role="tablist"
              aria-label="Substance selection options"
            >
              {substanceFilterOptions.map((opt, idx) => {
                const isSelected = activeIndex === idx;
                const isAll = opt.id === 'ALL';
                const sub = opt.substance;
                const optSpent = isAll
                  ? monthlyFinancials.totalSpent
                  : sub
                  ? monthlyFinancials.perSubstanceSpent[sub.id] || 0
                  : 0;

                return (
                  <button
                    key={String(opt.id)}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedOptionIndex(idx)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border select-none active:scale-95 ${
                      isSelected
                        ? isAll
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-md ring-2 ring-emerald-500/30'
                          : 'text-white shadow-md ring-2 ring-white/20'
                        : isDarkMode
                        ? 'bg-slate-900 border-slate-700/80 text-white hover:border-slate-500 hover:bg-slate-800/80'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
                    }`}
                    style={
                      isSelected && !isAll && sub
                        ? {
                            backgroundColor: sub.color_hex,
                            borderColor: sub.color_hex,
                          }
                        : {}
                    }
                  >
                    {isAll ? (
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          isSelected ? 'bg-white/20' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                    ) : sub ? (
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          isSelected ? 'bg-white/20' : ''
                        }`}
                      >
                        <MonochromeIcon
                          name={sub.icon_name}
                          colorHex={isSelected ? '#FFFFFF' : sub.color_hex}
                          size={15}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    ) : null}

                    <div className="flex flex-col text-left">
                      <span className="leading-tight font-extrabold">{opt.name}</span>
                      <span
                        className={`text-[10px] font-mono leading-tight ${
                          isSelected
                            ? 'text-white/90'
                            : isDarkMode
                            ? 'text-slate-300'
                            : 'text-slate-500'
                        }`}
                      >
                        {currency}
                        {optSpent.toFixed(0)}/mo
                      </span>
                    </div>

                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Metrics Strip (Reflects ALL or selected substance) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Monthly Net Income */}
            <div className={`p-3 rounded-xl border ${
              isDarkMode ? 'bg-[#14161A] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] uppercase tracking-wider block font-bold ${
                isDarkMode ? 'text-white' : 'text-slate-600'
              }`}>
                Monthly Income
              </span>
              <div className={`text-lg sm:text-xl font-bold font-mono tabular-nums mt-0.5 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {currency}{savedIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>

            {/* 30-Day Substance Spend */}
            <div className={`p-3 rounded-xl border ${
              isDarkMode ? 'bg-[#14161A] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] uppercase tracking-wider block font-bold ${
                isDarkMode ? 'text-white' : 'text-slate-600'
              }`}>
                {isAllSelected ? '30-Day Total Spend' : `${activeOption.name} Spend`}
              </span>
              <div
                className="text-lg sm:text-xl font-bold font-mono tabular-nums mt-0.5"
                style={{ color: currentSpent > 0 ? targetColorHex : '#10B981' }}
              >
                {currency}{currentSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Percentage of Income Drained */}
            <div className={`col-span-2 sm:col-span-1 p-3 rounded-xl border ${
              spentPercentage > 10
                ? isDarkMode ? 'bg-rose-950/20 border-rose-900/40 text-white' : 'bg-rose-50 border-rose-200'
                : isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-white' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <span className={`text-[10px] uppercase tracking-wider block font-bold ${
                spentPercentage > 10
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}>
                % of Monthly Income
              </span>
              <div className={`text-lg sm:text-xl font-bold font-mono tabular-nums mt-0.5 ${
                spentPercentage > 10
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}>
                {spentPercentage.toFixed(1)}% {spentPercentage > 0 ? 'Drained' : 'Protected'}
              </div>
            </div>
          </div>

          {/* Interactive Dual Progress Bar (Retained vs Drained) */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{retainedPercentage.toFixed(1)}% Retained For You</span>
              </span>

              <span
                className="font-mono font-bold"
                style={{ color: currentSpent > 0 ? targetColorHex : '#10B981' }}
              >
                {spentPercentage.toFixed(1)}% {isAllSelected ? 'Total Drain (ALL)' : `Spent on ${activeOption.name}`}
              </span>
            </div>

            {/* Dual Bar */}
            <div className="w-full h-3.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex shadow-inner">
              {/* Income Protected / Retained */}
              <div
                className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                style={{ width: `${retainedPercentage}%` }}
                title={`${retainedPercentage.toFixed(1)}% of your monthly income is kept`}
              />
              {/* Income Spent on Substance(s) */}
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{
                  width: `${spentPercentage}%`,
                  backgroundColor: currentSpent > 0 ? targetColorHex : '#10B981',
                }}
                title={`${spentPercentage.toFixed(1)}% spent`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] mt-1.5 font-bold">
              <span className={isDarkMode ? 'text-white' : 'text-slate-700'}>
                {currency}{(savedIncome - currentSpent).toLocaleString(undefined, { maximumFractionDigits: 0 })} safe
              </span>
              <span className={isDarkMode ? 'text-white' : 'text-slate-700'}>
                {currency}{currentSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}{' '}
                {isAllSelected ? 'all habits combined' : activeOption.name}
              </span>
            </div>
          </div>

          {/* Substance Contextual Insights */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
            {currentSaved > 0 ? (
              <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                Staying clean {isAllSelected ? 'across habits' : `from ${activeOption.name}`} has protected{' '}
                <strong className="text-emerald-400 font-mono font-bold">
                  {((currentSaved / savedIncome) * 100).toFixed(1)}%
                </strong>{' '}
                ({currency}{currentSaved.toFixed(0)}) of your income this month!
              </p>
            ) : (
              <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                {isAllSelected
                  ? 'Showing the aggregate monthly financial impact across all tracked substances.'
                  : `Tap any button above to inspect other substances or tap ALL for the combined impact.`}
              </p>
            )}

            <button
              onClick={handleClear}
              className={`text-[11px] font-bold hover:underline transition-colors shrink-0 ml-2 ${
                isDarkMode ? 'text-white hover:text-rose-400' : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              Clear Income
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
