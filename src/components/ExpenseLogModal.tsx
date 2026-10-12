import React, { useState } from 'react';
import { X, DollarSign, Tag, Heart, CheckCircle2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Substance, TriggerTag } from '../types';
import { NON_JUDGMENTAL_REFLECTIONS } from '../data/affirmations';
import { sqliteStorage } from '../db/sqliteStorage';
import { MonochromeIcon } from './icons/MonochromeIcon';

interface ExpenseLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  substance: Substance | null;
  currency: string;
  isDarkMode: boolean;
  onLogSaved: () => void;
}

const TRIGGER_TAGS: TriggerTag[] = [
  'Stress',
  'Boredom',
  'Social Pressure',
  'Anxiety',
  'Fatigue',
  'Habit / Routine',
  'Celebration',
  'Late Night',
  'Loneliness',
  'Craving Rush',
];

export const ExpenseLogModal: React.FC<ExpenseLogModalProps> = ({
  isOpen,
  onClose,
  substance,
  currency,
  isDarkMode,
  onLogSaved,
}) => {
  if (!isOpen || !substance) return null;

  const unitCost =
    substance.cost_per_unit != null && substance.cost_per_unit > 0
      ? substance.cost_per_unit
      : substance.cost_per_day || 10;
  const unitName = substance.unit_name || 'unit';
  const peakDailyBaseline = substance.cost_per_day || 10;

  const [units, setUnits] = useState<number>(1);
  const [customAmount, setCustomAmount] = useState<string>(
    unitCost.toFixed(2)
  );
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<TriggerTag | null>(null);
  const [note, setNote] = useState<string>('');
  const [savedReflection, setSavedReflection] = useState<string | null>(null);

  const calculatedAmount = isCustomMode
    ? parseFloat(customAmount) || 0
    : units * unitCost;

  const handleUnitChange = (delta: number) => {
    const next = Math.max(1, units + delta);
    setUnits(next);
    setCustomAmount((next * unitCost).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = calculatedAmount > 0 ? calculatedAmount : unitCost;

    await sqliteStorage.addExpenseLog({
      substance_id: substance.id,
      amount_spent: amount,
      units_count: units,
      trigger_tag: selectedTag,
      note: note.trim() || undefined,
    });

    // Pick random non-judgmental reflection
    const randomReflection =
      NON_JUDGMENTAL_REFLECTIONS[
        Math.floor(Math.random() * NON_JUDGMENTAL_REFLECTIONS.length)
      ];
    setSavedReflection(randomReflection);
    onLogSaved();
  };

  const handleFinish = () => {
    setSavedReflection(null);
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

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MonochromeIcon
              name={substance.icon_name}
              colorHex={substance.color_hex}
              size={18}
              showContainer
              containerSize="sm"
              isDarkMode={isDarkMode}
            />
            <div>
              <h2 className="text-base font-bold tracking-tight">Log Expense</h2>
              <p className="text-xs text-slate-400">{substance.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close expense modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {savedReflection ? (
            /* Non-Judgmental Supportive Feedback Screen */
            <div className="py-6 px-3 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Heart className="w-7 h-7 fill-emerald-500/30" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Log Recorded with Honesty
              </h3>

              <div
                className={`p-4 rounded-xl border text-sm italic leading-relaxed max-w-md ${
                  isDarkMode
                    ? 'bg-slate-900/60 border-slate-800 text-slate-200'
                    : 'bg-emerald-50/60 border-emerald-100 text-slate-800'
                }`}
              >
                &ldquo;{savedReflection}&rdquo;
              </div>

              <p className="text-xs text-slate-400 max-w-sm">
                Tracking without shame is how sustainable recovery happens. Take a deep, gentle breath and keep going.
              </p>

              <div className="pt-3 w-full max-w-xs">
                <button
                  onClick={handleFinish}
                  className="w-full min-h-[48px] py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm transition-transform active:scale-95 shadow-md"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount & Unit Stepper */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#181A1E]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Quantity &amp; Cost
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(!isCustomMode)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline"
                  >
                    {isCustomMode ? 'Use usual units' : 'Enter custom total'}
                  </button>
                </div>

                {!isCustomMode ? (
                  <div className="flex items-center justify-between gap-4">
                    {/* Stepper */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUnitChange(-1)}
                        className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-12 text-center font-bold text-lg font-mono tabular-nums text-slate-900 dark:text-white">
                        {units}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleUnitChange(1)}
                        className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Pre-filled calculated total */}
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
                        {currency}
                        {calculatedAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {units} {units > 1 ? `${unitName}s` : unitName} @ {currency}{unitCost.toFixed(2)}/{unitName}
                      </div>
                      <div className="text-[10px] text-amber-500 dark:text-amber-400 font-mono mt-0.5">
                        Peak Baseline: {currency}{peakDailyBaseline.toFixed(2)}/day
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-500">{currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xl font-bold outline-hidden"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* 1-Tap Trigger Tagging */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  What triggered this slip? (Optional 1-tap tag)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TRIGGER_TAGS.map((tag) => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(isSelected ? null : tag)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-rose-500 border-rose-500 text-white font-semibold shadow-xs'
                            : isDarkMode
                            ? 'bg-[#181A1E] border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Context / Thoughts (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Tough meeting, offered by coworker, etc."
                  className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm outline-hidden transition-colors ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Log {currency}{calculatedAmount.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
