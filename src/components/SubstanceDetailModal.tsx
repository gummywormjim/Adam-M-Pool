import React, { useState } from 'react';
import {
  X,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Clock,
  History,
  AlertTriangle,
  ChevronDown,
  Plus,
  Package,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Substance, ExpenseLog, FrequencyType } from '../types';
import { MonochromeIcon } from './icons/MonochromeIcon';
import { sqliteStorage } from '../db/sqliteStorage';
import { ConfirmDestructiveDialog } from './drive/ConfirmDestructiveDialog';
import { QuickUnitSlipModal } from './QuickUnitSlipModal';

interface SubstanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  substance: Substance | null;
  currency: string;
  isDarkMode: boolean;
  onUpdated: () => void;
  onEdit?: (substance: Substance) => void;
}

export const SubstanceDetailModal: React.FC<SubstanceDetailModalProps> = ({
  isOpen,
  onClose,
  substance,
  currency,
  isDarkMode,
  onUpdated,
  onEdit,
}) => {
  if (!isOpen || !substance) return null;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [frequency, setFrequency] = useState<FrequencyType>(substance.frequency || 'daily');
  const [costInput, setCostInput] = useState(() => {
    const daily = substance.cost_per_day ?? 10;
    const freq = substance.frequency || 'daily';
    const initial = freq === 'weekly' ? daily * 7 : freq === 'monthly' ? daily * 30 : daily;
    return initial.toFixed(2);
  });
  const [unitCostInput, setUnitCostInput] = useState(() => {
    const u = substance.cost_per_unit != null && substance.cost_per_unit > 0
      ? substance.cost_per_unit
      : substance.cost_per_day ?? 10;
    return u.toFixed(2);
  });
  const [unitNameInput, setUnitNameInput] = useState<string>(substance.unit_name || 'unit');
  const [quitDateInput, setQuitDateInput] = useState(
    substance.quit_date ? substance.quit_date.slice(0, 10) : ''
  );
  const [showEraseHistoryConfirm, setShowEraseHistoryConfirm] = useState(false);
  const [isErasingHistory, setIsErasingHistory] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const logs = sqliteStorage.getExpenseLogs(substance.id);

  const numInput = parseFloat(costInput) || 0;
  const effectiveDaily =
    frequency === 'daily' ? numInput : frequency === 'weekly' ? numInput / 7 : numInput / 30;
  const parsedUnitCost = parseFloat(unitCostInput) > 0 ? parseFloat(unitCostInput) : effectiveDaily;

  const handleFrequencyChange = (newFreq: FrequencyType) => {
    if (newFreq === frequency) return;
    let converted = numInput;
    if (frequency === 'daily') {
      if (newFreq === 'weekly') converted = numInput * 7;
      else if (newFreq === 'monthly') converted = numInput * 30;
    } else if (frequency === 'weekly') {
      if (newFreq === 'daily') converted = numInput / 7;
      else if (newFreq === 'monthly') converted = (numInput / 7) * 30;
    } else if (frequency === 'monthly') {
      if (newFreq === 'daily') converted = numInput / 30;
      else if (newFreq === 'weekly') converted = (numInput / 30) * 7;
    }
    setCostInput(converted.toFixed(2));
    setFrequency(newFreq);
  };

  const handleSaveSettings = async () => {
    const num = parseFloat(costInput) || 10;
    const dailyCost =
      frequency === 'daily' ? num : frequency === 'weekly' ? num / 7 : num / 30;
    const validUnitCost = parseFloat(unitCostInput) > 0 ? parseFloat(unitCostInput) : dailyCost;

    await sqliteStorage.updateSubstance(substance.id, {
      cost_per_day: Math.max(0.01, dailyCost),
      cost_per_unit: Math.max(0.01, validUnitCost),
      unit_name: unitNameInput.trim() || 'unit',
      frequency: frequency,
      quit_date: quitDateInput ? new Date(quitDateInput).toISOString() : null,
    });
    onUpdated();
    onClose();
  };

  const handleConfirmEraseHistory = async () => {
    setIsErasingHistory(true);
    await sqliteStorage.clearAllExpenseLogs(substance.id);
    setIsErasingHistory(false);
    setShowEraseHistoryConfirm(false);
    onUpdated();
  };

  const handleResetStreak = async () => {
    const todayIso = new Date().toISOString();
    await sqliteStorage.updateSubstance(substance.id, {
      quit_date: todayIso,
    });
    setQuitDateInput(todayIso.slice(0, 10));
    onUpdated();
  };

  const handleQuickAddOneUnit = () => {
    setShowSlipModal(true);
  };

  const handleConfirmSlip = async (resetSoberDate: boolean) => {
    const cost = parsedUnitCost > 0 ? parsedUnitCost : (effectiveDaily || 10);
    const unitLabel = unitNameInput.trim() || substance.unit_name || 'unit';

    if (resetSoberDate) {
      const nowIso = new Date().toISOString();
      await sqliteStorage.updateSubstance(substance.id, {
        quit_date: nowIso,
      });
      setQuitDateInput(nowIso.slice(0, 10));
    }

    await sqliteStorage.addExpenseLog({
      substance_id: substance.id,
      amount_spent: cost,
      units_count: 1,
      trigger_tag: resetSoberDate ? 'Reset Streak' : 'Slip',
      note: resetSoberDate
        ? `+1 ${unitLabel} logged (${currency}${cost.toFixed(2)}) - Sober date reset to today`
        : `+1 ${unitLabel} logged (${currency}${cost.toFixed(2)}) - "It was just a slip, keep my sober date."`,
    });

    setShowSlipModal(false);
    onUpdated();
  };

  const handleDeleteSubstance = async () => {
    await sqliteStorage.deleteSubstance(substance.id);
    onUpdated();
    onClose();
  };

  const handleDeleteLog = async (logId: number) => {
    await sqliteStorage.deleteExpenseLog(logId);
    onUpdated();
  };

  const totalSpent = logs.reduce((sum, item) => sum + item.amount_spent, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg max-h-[92vh] sm:rounded-3xl rounded-t-3xl flex flex-col border shadow-2xl overflow-hidden transition-all ${
          isDarkMode
            ? 'bg-[#121417] border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Drag handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MonochromeIcon
              name={substance.icon_name}
              colorHex={substance.color_hex}
              size={20}
              showContainer
              containerSize="sm"
              isDarkMode={isDarkMode}
            />
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {substance.name}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>
                Settings &amp; Spending Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(substance);
                }}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                  isDarkMode
                    ? 'border-slate-700 bg-slate-900 text-white hover:bg-slate-800'
                    : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Full Edit
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors ${
                isDarkMode
                  ? 'text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Top Comparison: Peak Spending Baseline & Individual Unit Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Cost Baseline (Height of Spending) */}
            <div
              className={`p-3.5 rounded-xl border ${
                isDarkMode ? 'bg-[#181A1E] border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                  Height of Spending Baseline
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                  Peak Burn
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {currency}{effectiveDaily.toFixed(2)}
                <span className="text-xs font-sans font-medium text-slate-400 ml-1">/ day</span>
              </div>
              <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                ~{currency}{(effectiveDaily * 7).toFixed(2)}/wk · ~{currency}{(effectiveDaily * 30).toFixed(0)}/mo at peak habit. Used to calculate your financial recovery savings.
              </p>
            </div>

            {/* Individual Unit Cost */}
            <div
              className={`p-3.5 rounded-xl border ${
                isDarkMode ? 'bg-[#181A1E] border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Individual Unit Cost
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  Log Price
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {currency}{parsedUnitCost.toFixed(2)}
                <span className="text-xs font-sans font-medium text-slate-400 ml-1">
                  / {unitNameInput || 'unit'}
                </span>
              </div>
              <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Cost of a single {unitNameInput || 'unit'}. Used for the fast +1 quick-log and recording slip expenses.
              </p>
            </div>
          </div>

          {/* Settings Section */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isDarkMode ? 'bg-[#181A1E] border-slate-700' : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                Edit Parameters &amp; Milestones
              </h3>
              {effectiveDaily > 0 && parsedUnitCost > 0 && (
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  ~{(effectiveDaily / parsedUnitCost).toFixed(1)} {unitNameInput || 'units'}/day peak
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cost Baseline */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                  Cost Baseline ({frequency})
                </label>
                <div
                  className={`flex items-center rounded-xl border transition-all ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 focus-within:border-emerald-500'
                      : 'bg-white border-slate-300 focus-within:border-emerald-600'
                  }`}
                >
                  <span className="pl-2.5 pr-1 font-mono text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    className="w-full p-2.5 text-xs font-mono font-bold outline-hidden bg-transparent text-slate-900 dark:text-white"
                  />
                  <div className="relative pr-2 shrink-0">
                    <select
                      value={frequency}
                      onChange={(e) => handleFrequencyChange(e.target.value as FrequencyType)}
                      className={`text-[11px] font-bold bg-transparent pl-1 pr-5 py-1 appearance-none cursor-pointer outline-hidden ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
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
                    <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Individual Unit Cost */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                  Unit Cost ({unitNameInput || 'unit'})
                </label>
                <div
                  className={`flex items-center rounded-xl border transition-all ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 focus-within:border-emerald-500'
                      : 'bg-white border-slate-300 focus-within:border-emerald-600'
                  }`}
                >
                  <span className="pl-2.5 pr-1 font-mono text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={unitCostInput}
                    onChange={(e) => setUnitCostInput(e.target.value)}
                    placeholder="12.50"
                    className="w-full p-2.5 text-xs font-mono font-bold outline-hidden bg-transparent text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={unitNameInput}
                    onChange={(e) => setUnitNameInput(e.target.value.toLowerCase())}
                    placeholder="pack"
                    className="w-16 pr-2 text-right text-[11px] font-semibold text-slate-400 bg-transparent outline-hidden"
                    title="Unit name (pack, can, bottle, etc.)"
                  />
                </div>
              </div>

              {/* Clean Date */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                  Clean / Baseline Date
                </label>
                <input
                  type="date"
                  value={quitDateInput}
                  onChange={(e) => setQuitDateInput(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-hidden ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResetStreak}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Clean Streak to Today</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Expense History Ledger */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <History className="w-3.5 h-3.5" />
                <span>Expense History ({logs.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  Total: {currency}{totalSpent.toFixed(2)}
                </span>
                {parsedUnitCost > 0 && (
                  <button
                    type="button"
                    onClick={handleQuickAddOneUnit}
                    className="px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    title={`Quick log 1 ${unitNameInput || 'unit'} at ${currency}${parsedUnitCost.toFixed(2)}`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>+1 {unitNameInput ? unitNameInput.charAt(0).toUpperCase() + unitNameInput.slice(1) : 'Unit'}</span>
                  </button>
                )}
                {totalSpent > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowEraseHistoryConfirm(true)}
                    className="px-2 py-0.5 rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    title={`Erase expense slips for ${substance.name} and reset to 0.00`}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Erase</span>
                  </button>
                )}
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                No expense slips logged for {substance.name}. Clean streak intact!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      isDarkMode
                        ? 'bg-slate-900/60 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-rose-500">
                          {currency}{log.amount_spent.toFixed(2)}
                        </span>
                        {log.trigger_tag && (
                          <span className="text-slate-400">
                            · {log.trigger_tag}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(log.logged_at).toLocaleDateString()} {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {log.note && ` — "${log.note}"`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      title="Delete log entry"
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-md hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Substance Section */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1.5 font-medium min-h-[36px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove this tracked substance</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-xs">
                <p className="text-rose-400 font-medium">
                  Are you sure you want to remove {substance.name}? Past logs will be archived.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteSubstance}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                  >
                    Yes, Remove
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Window for Erasing Substance Spent History */}
      <ConfirmDestructiveDialog
        isOpen={showEraseHistoryConfirm}
        title={`Erase ${substance.name} Expenses?`}
        description={`This will erase all logged expense slips for ${substance.name}, resetting the total spent on this substance to ${currency}0.00. Your clean streak and savings milestones will remain preserved.`}
        confirmLabel="Erase & Reset to 0.00"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isErasingHistory}
        onConfirm={handleConfirmEraseHistory}
        onCancel={() => setShowEraseHistoryConfirm(false)}
        isDarkMode={isDarkMode}
      />

      {/* Quick Unit Slip Modal */}
      <QuickUnitSlipModal
        isOpen={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        substance={substance}
        currency={currency}
        isDarkMode={isDarkMode}
        onConfirm={handleConfirmSlip}
      />
    </div>
  );
};
