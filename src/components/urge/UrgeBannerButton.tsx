import React from 'react';
import { Flame, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface UrgeBannerButtonProps {
  onClick: () => void;
  urgesOvercomeCount: number;
  isDarkMode: boolean;
}

export const UrgeBannerButton: React.FC<UrgeBannerButtonProps> = ({
  onClick,
  urgesOvercomeCount,
  isDarkMode,
}) => {
  return (
    <section aria-label="Urge Relief Action" className="w-full">
      <button
        onClick={onClick}
        className={`w-full min-h-[58px] p-4 rounded-2xl border text-left transition-all transform active:scale-[0.99] flex items-center justify-between gap-3 shadow-md group ${
          isDarkMode
            ? 'bg-gradient-to-r from-amber-950/40 via-[#1E1E1E] to-slate-900 border-amber-500/30 hover:border-amber-500/60 shadow-amber-950/20'
            : 'bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50/60 border-amber-300 hover:border-amber-400 shadow-amber-500/10'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 fill-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Feeling an Urge?
              </span>
              {urgesOvercomeCount > 0 && (
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{urgesOvercomeCount} surfed</span>
                </span>
              )}
            </div>
            <p className={`text-xs line-clamp-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
              Tap for immediate 2-min calming tools, distraction &amp; grounding
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <span className="hidden sm:inline text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:underline">
            Relief Engine
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </button>
    </section>
  );
};
