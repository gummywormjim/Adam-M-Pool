import React, { useState } from 'react';
import { X, Sparkles, Plus, Calendar, Tag, Check, Palette } from 'lucide-react';
import { Substance, FrequencyType } from '../types';
import { AVAILABLE_ICONS, PRESET_COLORS, MonochromeIcon } from './icons/MonochromeIcon';
import { sqliteStorage } from '../db/sqliteStorage';
import { CostFrequencyInput } from './CostFrequencyInput';
import { UnitCostInput } from './UnitCostInput';

interface AddSubstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  isDarkMode: boolean;
  onSubstanceCreated: (substance: Substance) => void;
}

interface Preset {
  name: string;
  icon_name: string;
  color_hex: string;
  cost_per_day: number;
  cost_per_unit: number;
  unit_name: string;
}

const PRESETS: Preset[] = [
  {
    name: 'Cigarettes',
    icon_name: 'cigarette',
    color_hex: '#EF4444',
    cost_per_day: 12.50,
    cost_per_unit: 12.50,
    unit_name: 'pack',
  },
  {
    name: 'Vaping / Pods',
    icon_name: 'wind',
    color_hex: '#06B6D4',
    cost_per_day: 6.00,
    cost_per_unit: 6.00,
    unit_name: 'pod',
  },
  {
    name: 'Alcohol / Beer',
    icon_name: 'wine',
    color_hex: '#8B5CF6',
    cost_per_day: 16.00,
    cost_per_unit: 8.00,
    unit_name: 'drink',
  },
  {
    name: 'Energy Drinks',
    icon_name: 'zap',
    color_hex: '#F59E0B',
    cost_per_day: 7.50,
    cost_per_unit: 3.75,
    unit_name: 'can',
  },
  {
    name: 'Cannabis',
    icon_name: 'flame',
    color_hex: '#10B981',
    cost_per_day: 15.00,
    cost_per_unit: 15.00,
    unit_name: 'gram',
  },
  {
    name: 'Gambling / Lottery',
    icon_name: 'dice',
    color_hex: '#EC4899',
    cost_per_day: 20.00,
    cost_per_unit: 10.00,
    unit_name: 'ticket',
  },
];

export const AddSubstanceModal: React.FC<AddSubstanceModalProps> = ({
  isOpen,
  onClose,
  currency,
  isDarkMode,
  onSubstanceCreated,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('flame');
  const [colorHex, setColorHex] = useState('#EF4444');
  const [costAmount, setCostAmount] = useState('10.00');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [unitCost, setUnitCost] = useState('10.00');
  const [unitName, setUnitName] = useState('unit');
  const [quitDate, setQuitDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [isAbstinentMode, setIsAbstinentMode] = useState(true);

  const applyPreset = (preset: Preset) => {
    setName(preset.name);
    setIconName(preset.icon_name);
    setColorHex(preset.color_hex);
    setCostAmount(preset.cost_per_day.toFixed(2));
    setFrequency('daily');
    setUnitCost(preset.cost_per_unit.toFixed(2));
    setUnitName(preset.unit_name);
  };

  const num = parseFloat(costAmount) || 10;
  const currentDailyBaseline = frequency === 'daily' ? num : frequency === 'weekly' ? num / 7 : num / 30;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedUnitCost = parseFloat(unitCost) > 0 ? parseFloat(unitCost) : currentDailyBaseline;

    const newSubstance = await sqliteStorage.addSubstance({
      name: name.trim(),
      icon_name: iconName,
      color_hex: colorHex,
      cost_per_day: currentDailyBaseline,
      cost_per_unit: parsedUnitCost,
      unit_name: unitName.trim() || 'unit',
      frequency: frequency,
      quit_date: isAbstinentMode ? new Date(quitDate).toISOString() : null,
    });

    onSubstanceCreated(newSubstance);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg max-h-[92vh] sm:rounded-3xl rounded-t-3xl flex flex-col border shadow-2xl overflow-hidden transition-all ${
          isDarkMode
            ? 'bg-[#121417] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Add Tracked Substance</h2>
              <p className="text-xs text-slate-400">Personalize icon, color, and financial baseline</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close add modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Quick 1-Tap Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#181A1E] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color_hex }} />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Live Icon Preview */}
            <div className="flex items-center gap-3">
              <MonochromeIcon
                name={iconName}
                colorHex={colorHex}
                size={26}
                showContainer
                containerSize="lg"
                isDarkMode={isDarkMode}
              />
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Substance Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cigarettes, Vaping, Alcohol..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-sm font-semibold outline-hidden transition-colors ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Monochromatic SVG Icon Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Select Monochromatic Icon
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#181A1E]">
                {AVAILABLE_ICONS.map((ico) => {
                  const isSelected = iconName === ico.id;
                  return (
                    <button
                      key={ico.id}
                      type="button"
                      title={ico.label}
                      onClick={() => setIconName(ico.id)}
                      className={`min-h-[40px] flex items-center justify-center rounded-lg transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm scale-110'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <MonochromeIcon
                        name={ico.id}
                        colorHex={isSelected ? (isDarkMode ? '#0F172A' : '#FFFFFF') : colorHex}
                        size={18}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Palette */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Substance Accent Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    onClick={() => setColorHex(c.hex)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      colorHex === c.hex ? 'scale-115 border-white shadow-md' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <div className="flex items-center gap-1.5 ml-2 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-lg">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-16 text-xs font-mono bg-transparent outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 1. Cost Baseline representing height of spending */}
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

            {/* 2. Individual Unit Cost */}
            <UnitCostInput
              unitCost={unitCost}
              unitName={unitName}
              onChangeUnitCost={setUnitCost}
              onChangeUnitName={setUnitName}
              currency={currency}
              isDarkMode={isDarkMode}
              costBaselineDaily={currentDailyBaseline}
              label="Individual Unit Cost"
            />

            {/* Clean Streak / Quit Date */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#181A1E]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tracking Goal
                </span>
                <button
                  type="button"
                  onClick={() => setIsAbstinentMode(!isAbstinentMode)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline"
                >
                  {isAbstinentMode ? 'Switch to Harm Reduction' : 'Switch to Clean Streak'}
                </button>
              </div>

              {isAbstinentMode ? (
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Quit Date (used for streak &amp; money saved calculation)
                  </label>
                  <input
                    type="date"
                    value={quitDate}
                    onChange={(e) => setQuitDate(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs outline-hidden ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Tracking consumption reduction and expenses without a hard quit milestone.
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm transition-transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
              >
                <span>Save Tracked Substance</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
