import React from 'react';
import { Plus, Sparkles, AlertCircle } from 'lucide-react';
import { Substance } from '../types';
import { SubstanceCard } from './SubstanceCard';

interface SubstanceListProps {
  substances: Substance[];
  perSubstanceSaved: Record<number, number>;
  perSubstanceSpent: Record<number, number>;
  currency: string;
  onQuickLog: (substance: Substance) => void;
  onQuickAddUnit?: (substance: Substance) => void;
  onOpenDetails: (substance: Substance) => void;
  onEdit?: (substance: Substance) => void;
  onAddNew: () => void;
  isDarkMode: boolean;
}

export const SubstanceList: React.FC<SubstanceListProps> = ({
  substances,
  perSubstanceSaved,
  perSubstanceSpent,
  currency,
  onQuickLog,
  onQuickAddUnit,
  onOpenDetails,
  onEdit,
  onAddNew,
  isDarkMode,
}) => {
  return (
    <section aria-label="Tracked Substances List" className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Tracked Substances
          </h3>
          <span className={`text-xs font-mono font-semibold ${isDarkMode ? 'text-white/80' : 'text-slate-500'}`}>
            ({substances.length} Active)
          </span>
        </div>

        <button
          onClick={onAddNew}
          aria-label="Track new spending"
          className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Track new spending</span>
        </button>
      </div>

      {substances.length === 0 ? (
        /* Empty State */
        <div
          className={`rounded-2xl border p-8 text-center transition-colors ${
            isDarkMode ? 'bg-[#181A1E] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            No substances tracked yet
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Add a substance you want to quit or reduce (cigarettes, energy drinks, alcohol, etc.) to start calculating your financial freedom.
          </p>
          <button
            onClick={onAddNew}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
          >
            Create First Track
          </button>
        </div>
      ) : (
        /* List of Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {substances.map((substance) => (
            <SubstanceCard
              key={substance.id}
              substance={substance}
              savedAmount={perSubstanceSaved[substance.id] || 0}
              spentAmount={perSubstanceSpent[substance.id] || 0}
              currency={currency}
              onQuickLog={onQuickLog}
              onQuickAddUnit={onQuickAddUnit}
              onOpenDetails={onOpenDetails}
              onEdit={onEdit}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}
    </section>
  );
};
