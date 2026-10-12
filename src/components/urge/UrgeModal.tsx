import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Clock,
  Flame,
  ShieldCheck,
  PhoneCall,
  Activity,
  HeartHandshake,
  Check,
  ChevronRight,
  BookOpen,
  Footprints,
  Wind,
} from 'lucide-react';
import { Substance, UrgeActivity } from '../../types';
import { URGE_ACTIVITIES } from '../../data/urgeActivities';
import { BreathingPacer } from './BreathingPacer';
import { SensoryGrounding } from './SensoryGrounding';
import { CravingDelayTimer } from './CravingDelayTimer';
import { CrisisSupportBar } from '../CrisisSupportBar';
import { sqliteStorage } from '../../db/sqliteStorage';

interface UrgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  substances: Substance[];
  isDarkMode: boolean;
  onUrgeSurfed: () => void;
}

export const UrgeModal: React.FC<UrgeModalProps> = ({
  isOpen,
  onClose,
  substances,
  isDarkMode,
  onUrgeSurfed,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<'<2min' | '5-15min' | '15+min'>('<2min');
  const [selectedSubstanceId, setSelectedSubstanceId] = useState<number>(
    substances[0]?.id || 1
  );
  const [activeActivity, setActiveActivity] = useState<UrgeActivity | null>(URGE_ACTIVITIES[0]);
  const [intensity, setIntensity] = useState<number>(7);
  const [journalNote, setJournalNote] = useState<string>('');
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredActivities = URGE_ACTIVITIES.filter(
    (a) => a.duration_category === selectedDuration
  );

  const handleSurfedVictory = async () => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899'],
      });
    } catch {
      // ignore
    }

    // Record into SQLite
    await sqliteStorage.addUrgeLog({
      substance_id: selectedSubstanceId,
      intensity,
      activity_chosen: activeActivity?.title || 'Urge Surfing',
      surfed_successfully: true,
      notes: journalNote || 'Overcame craving through alternative behavioral activity.',
    });

    setHasCelebrated(true);
    onUrgeSurfed();
  };

  const handleFinish = () => {
    setHasCelebrated(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl flex flex-col border shadow-2xl overflow-hidden transition-all ${
          isDarkMode
            ? 'bg-[#121417] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Urge Relief Center</h2>
              <p className="text-xs text-slate-400">Immediate behavioral distraction &amp; grounding</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Urge Modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 24/7 Crisis Hotline & Chat links at top of Urge Relief screen */}
        <div className="px-4 pt-3.5 pb-0 sm:px-5">
          <CrisisSupportBar isDarkMode={isDarkMode} variant="modal" />
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {hasCelebrated ? (
            /* Celebration State */
            <div className="py-8 px-4 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Urge Successfully Surfed!
              </h3>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                You observed the craving, allowed your nervous system to cool down, and protected both your freedom and your wallet. That is a massive neural rewiring victory.
              </p>
              <div className="pt-4 flex gap-3 w-full max-w-xs">
                <button
                  onClick={handleFinish}
                  className="w-full min-h-[48px] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-transform active:scale-95 shadow-lg shadow-emerald-600/20"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Substance Context Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  What are you feeling an urge for?
                </label>
                <div className="flex flex-wrap gap-2">
                  {substances.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubstanceId(s.id)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        selectedSubstanceId === s.id
                          ? 'bg-slate-900 text-white border-slate-700 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs'
                          : isDarkMode
                          ? 'bg-[#181A1E] text-slate-300 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: s.color_hex }}
                      />
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Urge Intensity Slider */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">
                    Craving Intensity
                  </span>
                  <span className="font-mono font-bold text-amber-500 text-sm">
                    {intensity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Mild itch</span>
                  <span>Moderate pull</span>
                  <span>Intense surge</span>
                </div>
              </div>

              {/* Time Window Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    How much time do you have?
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {(['<2min', '5-15min', '15+min'] as const).map((dur) => (
                    <button
                      key={dur}
                      onClick={() => {
                        setSelectedDuration(dur);
                        const match = URGE_ACTIVITIES.find((a) => a.duration_category === dur);
                        if (match) setActiveActivity(match);
                      }}
                      className={`min-h-[40px] py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
                        selectedDuration === dur
                          ? 'bg-white dark:bg-[#1E2024] text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {dur === '<2min' ? '< 2 Mins' : dur === '5-15min' ? '5–15 Mins' : '15+ Mins'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Selection Carousel / Pills */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-400">Available Exercises</span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {filteredActivities.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => setActiveActivity(act)}
                      className={`min-h-[44px] whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-medium border shrink-0 transition-all ${
                        activeActivity?.id === act.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-semibold'
                          : isDarkMode
                          ? 'bg-[#181A1E] border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {act.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Interactive Exercise Tool */}
              {activeActivity && (
                <div className="space-y-3">
                  {activeActivity.type === 'breathing' && (
                    <BreathingPacer isDarkMode={isDarkMode} />
                  )}

                  {activeActivity.type === 'grounding' && (
                    <SensoryGrounding isDarkMode={isDarkMode} />
                  )}

                  {activeActivity.type === 'timer' && (
                    <CravingDelayTimer isDarkMode={isDarkMode} />
                  )}

                  {(activeActivity.type === 'cold_shock' ||
                    activeActivity.type === 'physical' ||
                    activeActivity.type === 'environment') && (
                    <div
                      className={`rounded-xl border p-4 sm:p-5 ${
                        isDarkMode ? 'bg-[#14161A] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {activeActivity.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-4">{activeActivity.description}</p>
                      <div className="space-y-2.5">
                        {activeActivity.instructions.map((ins, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">{ins}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeActivity.type === 'journal' && (
                    <div
                      className={`rounded-xl border p-4 sm:p-5 ${
                        isDarkMode ? 'bg-[#14161A] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        Craving Reflection Journal
                      </h4>
                      <p className="text-xs text-slate-400 mb-3">
                        Write what sparked this craving and how resisting it protects your goals:
                      </p>
                      <textarea
                        value={journalNote}
                        onChange={(e) => setJournalNote(e.target.value)}
                        placeholder="e.g. Felt stressed from work message. If I stay clean, I keep my $35 and wake up clear-headed..."
                        rows={3}
                        className={`w-full p-3 rounded-lg text-xs sm:text-sm border transition-colors outline-hidden ${
                          isDarkMode
                            ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Crisis helpline quick affordance */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                  <span>Need live human crisis support?</span>
                </div>
                <a
                  href="tel:988"
                  className="font-semibold text-rose-500 hover:underline min-h-[36px] flex items-center"
                >
                  Call or Text 988
                </a>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer / Primary Victory Button */}
        {!hasCelebrated && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#121417] flex items-center gap-3">
            <button
              onClick={handleSurfedVictory}
              className="flex-1 min-h-[48px] py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>I Surfed The Urge!</span>
            </button>
            <button
              onClick={onClose}
              className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
