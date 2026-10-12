import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Calendar,
  DollarSign,
  Palette,
  RotateCcw,
  Trash2,
  TrendingDown,
  Sparkles,
  Calculator,
  AlertCircle,
} from 'lucide-react';
import { Substance, FrequencyType } from '../types';
import { AVAILABLE_ICONS, PRESET_COLORS, MonochromeIcon } from './icons/MonochromeIcon';
import { sqliteStorage } from '../db/sqliteStorage';
import { CostFrequencyInput } from './CostFrequencyInput';
import { UnitCostInput } from './UnitCostInput';

interface EditSubstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  substance: Substance | null;
  currency: string;
  isDarkMode: boolean;
  onSubstanceUpdated: (updatedSubstance: Substance) => void;
  onSubstanceDeleted?: (id: number) => void;
}

export const EditSubstanceModal: React.FC<EditSubstanceModalProps> = ({
  isOpen,
  onClose,
  substance,
  currency,
  isDarkMode,
  onSubstanceUpdated,
  onSubstanceDeleted,
}) => {
  if (!isOpen || !substance) return null;

  const [name, setName] = useState(substance.name);
  const [iconName, setIconName] = useState(substance.icon_name);
  const [colorHex, setColorHex] = useState(substance.color_hex);
  const [frequency, setFrequency] = useState<FrequencyType>(substance.frequency || 'daily');
  const [costAmount, setCostAmount] = useState(() => {
    const daily = substance.cost_per_day ?? substance.cost_per_unit ?? 10;
    const freq = substance.frequency || 'daily';
    const initialVal = freq === 'weekly' ? daily * 7 : freq === 'monthly' ? daily * 30 : daily;
    return initialVal.toFixed(2);
  });
  const [unitCost, setUnitCost] = useState<string>(() => {
    const val = substance.cost_per_unit != null && substance.cost_per_unit > 0
      ? substance.cost_per_unit
      : substance.cost_per_day ?? 10;
    return val.toFixed(2);
  });
  const [unitName, setUnitName] = useState<string>(substance.unit_name || 'unit');
  const [quitDate, setQuitDate] = useState<string>(
    substance.quit_date ? substance.quit_date.slice(0, 10) : ''
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    if (substance) {
      setName(substance.name);
      setIconName(substance.icon_name);
      setColorHex(substance.color_hex);
      const daily = substance.cost_per_day ?? substance.cost_per_unit ?? 10;
      const freq = substance.frequency || 'daily';
      setFrequency(freq);
      const initialVal = freq === 'weekly' ? daily * 7 : freq === 'monthly' ? daily * 30 : daily;
      setCostAmount(initialVal.toFixed(2));
      const uCost = substance.cost_per_unit != null && substance.cost_per_unit > 0
        ? substance.cost_per_unit
        : daily;
      setUnitCost(uCost.toFixed(2));
      setUnitName(substance.unit_name || 'unit');
      setQuitDate(substance.quit_date ? substance.quit_date.slice(0, 10) : '');
      setConfirmDelete(false);
    }
  }, [substance]);

  const numAmount = parseFloat(costAmount) || 0;
  const liveDaily = frequency === 'daily' ? numAmount : frequency === 'weekly' ? numAmount / 7 : numAmount / 30;
  const monthlyProjected = liveDaily * 30;
  const annualProjected = liveDaily * 365;

  const handleResetStreakToToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setQuitDate(today);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    const num = parseFloat(costAmount) || 10;
    const validatedDailyCost = Math.max(
      0.01,
      frequency === 'daily' ? num : frequency === 'weekly' ? num / 7 : num / 30
    );
    const parsedUnitCost = parseFloat(unitCost) > 0 ? parseFloat(unitCost) : validatedDailyCost;

    const updates: Partial<Substance> = {
      name: name.trim(),
      icon_name: iconName,
      color_hex: colorHex,
      cost_per_day: validatedDailyCost,
      cost_per_unit: parsedUnitCost,
      unit_name: unitName.trim() || 'unit',
      frequency: frequency,
      quit_date: quitDate ? new Date(quitDate).toISOString() : null,
    };

    const updated = await sqliteStorage.updateSubstance(substance.id, updates);
    if (updated) {
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 1200);
      onSubstanceUpdated(updated);
      onClose();
    }
  };

  const handleDelete = async () => {
    await sqliteStorage.deleteSubstance(substance.id);
    if (onSubstanceDeleted) {
      onSubstanceDeleted(substance.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg max-h-[92vh] sm:rounded-3xl rounded-t-3xl flex flex-col border shadow-2xl overflow-hidden transition-all ${
          isDarkMode
            ? 'bg-[#121417] border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MonochromeIcon
              name={iconName}
              colorHex={colorHex}
              size={20}
              showContainer
              containerSize="sm"
              isDarkMode={isDarkMode}
            />
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Edit Tracked Substance
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>
                Updates cost per day and baseline metrics in real time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close edit modal"
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors ${
              isDarkMode
                ? 'text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-Time Live Preview Banner */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#16181D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
              style={{ backgroundColor: colorHex }}
            />
            <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {name || 'Unnamed'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400">
              {currency}{liveDaily.toFixed(2)} / day
            </span>
            <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              (~{currency}{monthlyProjected.toFixed(0)}/mo)
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. Substance Name */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
              Substance Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cigarettes, Vaping, Energy Drinks"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-hidden transition-colors ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
              }`}
            />
          </div>

          {/* 2. Cost Baseline (Height of Spending) */}
          <CostFrequencyInput
            amount={costAmount}
            frequency={frequency}
            onChangeAmount={setCostAmount}
            onChangeFrequency={setFrequency}
            currency={currency}
            isDarkMode={isDarkMode}
            label="Cost Baseline (Height of Spending)"
            showPresets={true}
          />

          {/* 3. Individual Unit Cost */}
          <UnitCostInput
            unitCost={unitCost}
            unitName={unitName}
            onChangeUnitCost={setUnitCost}
            onChangeUnitName={setUnitName}
            currency={currency}
            isDarkMode={isDarkMode}
            costBaselineDaily={liveDaily}
            label="Individual Unit Cost"
          />

          {/* 3. Monochromatic Vector Icon Selector */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
              Monochromatic Vector Icon
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {AVAILABLE_ICONS.map((icon) => {
                const isSelected = iconName === icon.id;
                return (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => setIconName(icon.id)}
                    title={icon.label}
                    className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-all ${
                      isSelected
                        ? 'border-2 scale-105 shadow-sm'
                        : isDarkMode
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:bg-slate-100'
                    }`}
                    style={{
                      borderColor: isSelected ? colorHex : undefined,
                      backgroundColor: isSelected ? `${colorHex}15` : undefined,
                    }}
                  >
                    <MonochromeIcon
                      name={icon.id}
                      colorHex={isSelected ? colorHex : isDarkMode ? '#FFFFFF' : '#475569'}
                      size={20}
                      isDarkMode={isDarkMode}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Accent Color Token Swatches */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                Custom Accent Color
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  title="Pick custom hex color"
                />
                <span className="font-mono text-xs font-bold">{colorHex}</span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {PRESET_COLORS.map((preset) => {
                const isSelected = colorHex.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setColorHex(preset.hex)}
                    title={preset.label}
                    className={`h-9 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected ? 'border-2 border-white scale-110 shadow-sm' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Clean Streak / Quit Date */}
          <div className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-[#181A1E] border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Clean Streak / Baseline Start Date
              </label>

              <button
                type="button"
                onClick={handleResetStreakToToday}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Today</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="date"
                value={quitDate}
                onChange={(e) => setQuitDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-hidden ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                }`}
              />
            </div>
            <p className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>
              Savings are calculated from this date forward based on your cost per day.
            </p>
          </div>

          {/* 6. Delete Option */}
          <div className="pt-2">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1.5 min-h-[40px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove this tracked substance</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Are you sure you want to delete {substance.name}?</span>
                </div>
                <p className={isDarkMode ? 'text-slate-200' : 'text-slate-600'}>
                  This substance will be removed from your active tracks and slider. Past logged expenses are safely archived.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm"
                  >
                    Yes, Delete Substance
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Modal Action Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#16181D] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs font-semibold transition-colors ${
              isDarkMode
                ? 'border-slate-700 text-white hover:bg-slate-800'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            {isSavedRecently ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Changes in Real Time</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
