import React from 'react';
import { FrequencyType } from '../types';
import { Clock, Calendar, ChevronDown, Sparkles } from 'lucide-react';

interface CostFrequencyInputProps {
  amount: string;
  frequency: FrequencyType;
  onChangeAmount: (newAmount: string) => void;
  onChangeFrequency: (newFrequency: FrequencyType) => void;
  currency: string;
  isDarkMode: boolean;
  label?: string;
  showPresets?: boolean;
}

export const CostFrequencyInput: React.FC<CostFrequencyInputProps> = ({
  amount,
  frequency,
  onChangeAmount,
  onChangeFrequency,
  currency,
  isDarkMode,
  label = 'Habit Financial Parameter',
  showPresets = true,
}) => {
  const numericAmount = parseFloat(amount) || 0;

  // Derive all timeframes based on active frequency
  const dailyRate =
    frequency === 'daily'
      ? numericAmount
      : frequency === 'weekly'
      ? numericAmount / 7
      : numericAmount / 30;

  const weeklyRate = dailyRate * 7;
  const monthlyRate = dailyRate * 30;
  const annualRate = dailyRate * 365;

  // Handle switching frequency with automatic value adjustment
  const handleFrequencyChange = (newFreq: FrequencyType) => {
    if (newFreq === frequency) return;
    if (numericAmount <= 0) {
      onChangeFrequency(newFreq);
      return;
    }

    // Convert existing amount to new timeframe representation
    let converted = numericAmount;
    if (frequency === 'daily') {
      if (newFreq === 'weekly') converted = numericAmount * 7;
      else if (newFreq === 'monthly') converted = numericAmount * 30;
    } else if (frequency === 'weekly') {
      if (newFreq === 'daily') converted = numericAmount / 7;
      else if (newFreq === 'monthly') converted = (numericAmount / 7) * 30;
    } else if (frequency === 'monthly') {
      if (newFreq === 'daily') converted = numericAmount / 30;
      else if (newFreq === 'weekly') converted = (numericAmount / 30) * 7;
    }

    onChangeAmount(converted.toFixed(2));
    onChangeFrequency(newFreq);
  };

  // Preset options tailored for each timeframe
  const presetsByFrequency: Record<FrequencyType, number[]> = {
    daily: [5, 7.5, 10, 15, 20, 25],
    weekly: [35, 50, 70, 100, 140, 175],
    monthly: [150, 225, 300, 450, 600, 750],
  };

  const activePresets = presetsByFrequency[frequency] || presetsByFrequency.daily;

  return (
    <div
      className={`p-4 rounded-2xl border space-y-3 transition-colors ${
        isDarkMode ? 'bg-[#181A1E] border-slate-700' : 'bg-slate-50 border-slate-200'
      }`}
    >
      {/* Header with Title and Frequency Horizon Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label
          className={`block text-xs font-bold uppercase tracking-wider ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}
        >
          {label} *
        </label>

        {/* 1-Tap Frequency Switchers */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 self-start sm:self-auto">
          {(['daily', 'weekly', 'monthly'] as FrequencyType[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => handleFrequencyChange(f)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                frequency === f
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Unified Input Bar with Integrated Frequency Dropdown */}
      <div
        className={`relative flex items-center rounded-xl border transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 focus-within:border-emerald-500'
            : 'bg-white border-slate-300 focus-within:border-emerald-600 shadow-xs'
        }`}
      >
        {/* Currency Symbol Prefix */}
        <span
          className={`pl-3.5 pr-1 font-bold font-mono text-base select-none ${
            isDarkMode ? 'text-white' : 'text-slate-700'
          }`}
        >
          {currency}
        </span>

        {/* Amount Input */}
        <input
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="10.00"
          value={amount}
          onChange={(e) => onChangeAmount(e.target.value)}
          className={`w-full py-2.5 px-1 text-base font-mono font-bold outline-hidden bg-transparent ${
            isDarkMode
              ? 'text-white placeholder-slate-500'
              : 'text-slate-900 placeholder-slate-400'
          }`}
        />

        {/* Integrated Dropdown Menu on the Input Bar */}
        <div className="relative shrink-0 pr-2">
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
            <select
              value={frequency}
              onChange={(e) => handleFrequencyChange(e.target.value as FrequencyType)}
              aria-label="Select spending frequency timeframe"
              className={`py-1 pl-2 pr-6 text-xs font-bold rounded-lg bg-transparent cursor-pointer outline-hidden appearance-none ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
              }`}
            >
              <option value="daily" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                per day
              </option>
              <option value="weekly" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                per week
              </option>
              <option value="monthly" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                per month
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 pointer-events-none text-slate-400" />
          </div>
        </div>
      </div>

      {/* Real-Time Converted Multi-Horizon Breakdown */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
        <div
          className={`p-2 rounded-xl border text-xs ${
            frequency === 'daily'
              ? 'bg-emerald-500/10 border-emerald-500/30 font-bold text-emerald-500'
              : isDarkMode
              ? 'bg-slate-900/60 border-slate-800 text-slate-300'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-75 font-sans font-semibold">
            Daily
          </div>
          <div className="mt-0.5 font-bold">
            {currency}
            {dailyRate.toFixed(2)}
          </div>
        </div>

        <div
          className={`p-2 rounded-xl border text-xs ${
            frequency === 'weekly'
              ? 'bg-emerald-500/10 border-emerald-500/30 font-bold text-emerald-500'
              : isDarkMode
              ? 'bg-slate-900/60 border-slate-800 text-slate-300'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-75 font-sans font-semibold">
            Weekly
          </div>
          <div className="mt-0.5 font-bold">
            {currency}
            {weeklyRate.toFixed(2)}
          </div>
        </div>

        <div
          className={`p-2 rounded-xl border text-xs ${
            frequency === 'monthly'
              ? 'bg-emerald-500/10 border-emerald-500/30 font-bold text-emerald-500'
              : isDarkMode
              ? 'bg-slate-900/60 border-slate-800 text-slate-300'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-75 font-sans font-semibold">
            Monthly
          </div>
          <div className="mt-0.5 font-bold">
            {currency}
            {monthlyRate.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Dynamic Presets depending on chosen frequency */}
      {showPresets && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className={`text-[11px] font-bold mr-1 ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
            Quick {frequency} presets:
          </span>
          {activePresets.map((preset) => {
            const isMatch = Math.abs(numericAmount - preset) < 0.05;
            const suffix = frequency === 'daily' ? '/d' : frequency === 'weekly' ? '/w' : '/mo';
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeAmount(preset.toFixed(2))}
                className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  isMatch
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-white hover:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {currency}
                {preset}
                {suffix}
              </button>
            );
          })}
        </div>
      )}

      {/* Helper text explaining the conversion */}
      <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        Refine your input across daily, weekly, or monthly periods. This cost baseline represents how much you spent at the height of spending and is used to calculate your money saved (~{currency}
        {annualRate.toFixed(0)}/year).
      </p>
    </div>
  );
};
