import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Flame,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Clock,
  Heart,
  Phone,
  Layers,
} from 'lucide-react';

interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  isDarkMode: boolean;
  onComplete: () => void;
}

export const OnboardingTutorialModal: React.FC<OnboardingTutorialModalProps> = ({
  isOpen,
  onClose,
  currency,
  isDarkMode,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSkip();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden transition-all flex flex-col max-h-[92vh] ${
          isDarkMode
            ? 'bg-[#16181D] border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header with Step indicator and Skip button */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Tutorial • Step {currentStep + 1} of {totalSteps}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            aria-label="Skip tutorial"
            className="text-xs font-bold text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="bg-emerald-500 h-1 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* STEP 0: Welcome & Cigarettes Tracker */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1">
                <h2 id="tutorial-modal-title" className="text-xl font-bold tracking-tight">
                  Welcome to HabitVault
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                  Your private, offline-first companion for tracking sobriety and building financial freedom.
                </p>
              </div>

              {/* Initial Tracked Substance Card Preview */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Cigarettes</h4>
                      <p className="text-[11px] text-slate-400">1st Tracked Substance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {currency}12.50 / pack
                    </span>
                    <span className="block text-[10px] text-slate-400">Height: $12.50/day</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs font-bold text-amber-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Sober Streak:</span>
                  </div>
                  <span className="font-mono">0 days (Day 1 Started)</span>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-emerald-50/60 border-emerald-100 text-slate-700'
                }`}
              >
                <p className="font-semibold text-emerald-500 mb-0.5">Ready to begin?</p>
                We&apos;ve set up <strong>Cigarettes</strong> with your clean streak initialized to <strong>0 days</strong>. Would you like a brief explanation of how to add spending to the tracker?
              </div>
            </div>
          )}

          {/* STEP 1: How to Add Spending (The Core User Request) */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1">
                <h2 id="tutorial-modal-title" className="text-lg sm:text-xl font-bold tracking-tight">
                  How to Add Spending to the Tracker
                </h2>
                <p className="text-xs text-slate-400">
                  Whenever you purchase or consume a unit, use the two dedicated buttons at the top of your card.
                </p>
              </div>

              {/* Action Buttons Breakdown */}
              <div className="space-y-3 pt-1">
                {/* 1. Quick Tap +1 Pack Button */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+1 Pack</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-500">
                      Quick Tap (Set Unit Cost)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instantly records 1 pack at your configured unit cost ({currency}12.50).
                  </p>
                  <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
                    <strong>Slip Check-In:</strong> Tapping +1 Unit pops up a choice: reset your sober date or choose <em>&ldquo;It was just a slip, keep my sober date.&rdquo;</em>
                  </div>
                </div>

                {/* 2. Full +Log Button */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm">
                      <Plus className="w-3.5 h-3.5" />
                      <span>+Log</span>
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      Full Expense Slip
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Allows you to specify multiple units, custom dollar overrides, emotional triggers (e.g. stress, fatigue, routine), and reflective notes.
                  </p>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs text-slate-400 flex items-start gap-2 ${
                  isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  All logs are saved in an encrypted local database on this device with zero external telemetry.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Cost Baseline & Savings */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1">
                <h2 id="tutorial-modal-title" className="text-lg sm:text-xl font-bold tracking-tight">
                  Cost Baseline vs. Unit Cost
                </h2>
                <p className="text-xs text-slate-400">
                  How HabitVault calculates your real financial savings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div
                  className={`p-3.5 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 block mb-1">
                    Peak Spend Baseline
                  </span>
                  <p className="text-xs text-slate-300 font-semibold mb-1">
                    What you spent at the height of your habit
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Set daily, weekly, or monthly. HabitVault calculates how much money you keep as your sober streak increases from 0 days.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">
                    Individual Unit Cost
                  </span>
                  <p className="text-xs text-slate-300 font-semibold mb-1">
                    Price of 1 pack, can, or bottle
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Used for accurate logging when slips happen and for the +1 Unit quick tap button.
                  </p>
                </div>
              </div>

              {/* Financial impact preview */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDarkMode ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold">Saved So Far Formula</span>
                </div>
                <span className="text-xs font-mono font-bold">
                  (Baseline × Days Clean) − Spent
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Support Tools, Lifeline & Ready */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1">
                <h2 id="tutorial-modal-title" className="text-lg sm:text-xl font-bold tracking-tight">
                  Lifeline Support &amp; Urge Surfing
                </h2>
                <p className="text-xs text-slate-400">
                  Compassionate tools whenever cravings feel overwhelming.
                </p>
              </div>

              <div className="space-y-2.5">
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Phone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-200 mb-0.5">988 Suicide &amp; Crisis Lifeline</p>
                    <p className="text-slate-400">
                      Discreet direct links to call 988 or chat at <em>chat.988lifeline.org</em> are always available at the top of your screen.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Heart className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-200 mb-0.5">Urge Surfing &amp; Parasympathetic Reset</p>
                    <p className="text-slate-400">
                      When experiencing cravings, tap the Urge banner for guided breathwork and delay protocols to ride the wave without buying.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <p className="text-xs font-bold text-emerald-400 mb-1">
                  You are all set to begin your journey.
                </p>
                <p className="text-[11px] text-slate-400">
                  Track your Cigarettes habit, celebrate clean milestones, and build financial freedom one day at a time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-400 hover:text-slate-200 cursor-pointer`}
            >
              Skip
            </button>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-emerald-500'
                    : isDarkMode
                    ? 'bg-slate-700'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {currentStep === 0 ? (
              <>
                <span>Explain How to Add Spending</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : currentStep === totalSteps - 1 ? (
              <>
                <span>Start Tracking</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
