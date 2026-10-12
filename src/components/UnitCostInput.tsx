import React from 'react';
import { Package, Tag, Sparkles } from 'lucide-react';

interface UnitCostInputProps {
  unitCost: string;
  unitName: string;
  onChangeUnitCost: (newCost: string) => void;
  onChangeUnitName: (newName: string) => void;
  currency: string;
  isDarkMode: boolean;
  costBaselineDaily?: number;
  label?: string;
}

const COMMON_UNITS = [
  { id: 'pack', label: 'Pack' },
  { id: 'can', label: 'Can' },
  { id: 'bottle', label: 'Bottle' },
  { id: 'drink', label: 'Drink' },
  { id: 'pod', label: 'Pod / Vape' },
  { id: 'gram', label: 'Gram' },
  { id: 'ticket', label: 'Ticket' },
  { id: 'unit', label: 'Unit' },
];

export const UnitCostInput: React.FC<UnitCostInputProps> = ({
  unitCost,
  unitName,
  onChangeUnitCost,
  onChangeUnitName,
  currency,
  isDarkMode,
  costBaselineDaily = 0,
  label = 'Individual Unit Cost',
}) => {
  const numericUnitCost = parseFloat(unitCost) || 0;
  const unitsPerDayAtPeak =
    costBaselineDaily > 0 && numericUnitCost > 0
      ? (costBaselineDaily / numericUnitCost).toFixed(1)
      : null;

  return (
    <div
      className={`p-4 rounded-2xl border space-y-3 transition-colors ${
        isDarkMode ? 'bg-[#181A1E] border-slate-700' : 'bg-slate-50 border-slate-200'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
          </div>
          <div>
            <label
              className={`block text-xs font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}
            >
              {label} *
            </label>
            <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Cost of an individual unit (pack, can, bottle, etc.) for quick +1 logging
            </p>
          </div>
        </div>
      </div>

      {/* Input Row: Unit Price + Unit Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Unit Cost Amount */}
        <div>
          <span className={`block text-[11px] font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Price Per Unit
          </span>
          <div
            className={`relative flex items-center rounded-xl border transition-all ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700 focus-within:border-emerald-500'
                : 'bg-white border-slate-300 focus-within:border-emerald-600 shadow-xs'
            }`}
          >
            <span
              className={`pl-3 pr-1 font-bold font-mono text-sm select-none ${
                isDarkMode ? 'text-white' : 'text-slate-700'
              }`}
            >
              {currency}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 12.50"
              value={unitCost}
              onChange={(e) => onChangeUnitCost(e.target.value)}
              className={`w-full py-2 px-1 text-sm font-mono font-bold outline-hidden bg-transparent ${
                isDarkMode
                  ? 'text-white placeholder-slate-500'
                  : 'text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Unit Label/Name */}
        <div>
          <span className={`block text-[11px] font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Unit Type (e.g. pack, can, bottle)
          </span>
          <div
            className={`relative flex items-center rounded-xl border transition-all ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700 focus-within:border-emerald-500'
                : 'bg-white border-slate-300 focus-within:border-emerald-600 shadow-xs'
            }`}
          >
            <span className="pl-3 pr-1 text-slate-400">
              <Tag className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              required
              placeholder="pack, can, bottle..."
              value={unitName}
              onChange={(e) => onChangeUnitName(e.target.value.toLowerCase())}
              className={`w-full py-2 px-2 text-sm font-semibold outline-hidden bg-transparent ${
                isDarkMode
                  ? 'text-white placeholder-slate-500'
                  : 'text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Quick Unit Type Chips */}
      <div>
        <span className={`text-[10px] uppercase font-bold tracking-wider block mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Quick Unit Suggestions:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_UNITS.map((u) => {
            const isSelected = unitName.toLowerCase() === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onChangeUnitName(u.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {u.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual relationship between Unit Cost & Cost Baseline at peak */}
      {unitsPerDayAtPeak && (
        <div
          className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium ${
            isDarkMode
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>
            At <strong>{currency}{numericUnitCost.toFixed(2)}</strong> per {unitName || 'unit'}, your height-of-spending baseline (<strong>{currency}{costBaselineDaily.toFixed(2)}/day</strong>) equals ~<strong>{unitsPerDayAtPeak} {unitName || 'units'}/day</strong>.
          </span>
        </div>
      )}
    </div>
  );
};
