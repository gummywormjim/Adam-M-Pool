import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

interface BreathingPacerProps {
  onCompleteCycle?: () => void;
  isDarkMode: boolean;
}

type Phase = 'inhale' | 'hold' | 'exhale';

export const BreathingPacer: React.FC<BreathingPacerProps> = ({ onCompleteCycle, isDarkMode }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phases: Inhale (4s) -> Hold (7s) -> Exhale (8s)
        if (phase === 'inhale') {
          setPhase('hold');
          return 7;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 8;
        } else {
          // completed 1 cycle
          setCycleCount((c) => {
            const next = c + 1;
            if (next >= 4 && onCompleteCycle) {
              onCompleteCycle();
            }
            return next;
          });
          setPhase('inhale');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, onCompleteCycle]);

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setSecondsLeft(4);
    setCycleCount(0);
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Inhale deeply through your nose...';
      case 'hold':
        return 'Hold gently. Still the mind...';
      case 'exhale':
        return 'Exhale slowly through mouth with whoosh...';
    }
  };

  const getScaleClass = () => {
    if (!isActive) return 'scale-100';
    if (phase === 'inhale') return 'scale-125 transition-transform duration-4000 ease-in-out';
    if (phase === 'hold') return 'scale-125';
    return 'scale-90 transition-transform duration-8000 ease-out';
  };

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col items-center text-center transition-all ${
        isDarkMode ? 'bg-[#14161A] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-4">
        <span>4-7-8 Neuro-Calm Pacer</span>
        <span className="font-mono">Cycle {cycleCount} / 4</span>
      </div>

      {/* Visual Expanding Circle */}
      <div className="relative w-44 h-44 my-4 flex items-center justify-center">
        {/* Outer ambient glow */}
        <div
          className={`absolute inset-0 rounded-full blur-xl opacity-30 transition-all ${
            phase === 'inhale'
              ? 'bg-cyan-500 scale-110'
              : phase === 'hold'
              ? 'bg-amber-500 scale-120'
              : 'bg-emerald-500 scale-95'
          }`}
        />

        {/* Pulsing ring */}
        <div
          className={`w-36 h-36 rounded-full border-2 flex flex-col items-center justify-center transition-all transform ${getScaleClass()} ${
            phase === 'inhale'
              ? 'border-cyan-400 bg-cyan-500/10'
              : phase === 'hold'
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-emerald-400 bg-emerald-500/10'
          }`}
        >
          <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {secondsLeft}s
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider mt-1 text-slate-500 dark:text-slate-300">
            {phase}
          </span>
        </div>
      </div>

      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 min-h-[24px] mb-4">
        {isActive ? getPhaseInstruction() : 'Ready to reset your nervous system. Press Start.'}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`min-h-[44px] px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-transform active:scale-95 ${
            isActive
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20'
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          {isActive ? 'Pause' : 'Start 4-7-8'}
        </button>

        <button
          onClick={handleReset}
          aria-label="Reset Breathing Pacer"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {cycleCount >= 4 && (
        <div className="mt-3 text-xs text-emerald-500 flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>4 full cycles completed. Heart rate normalized.</span>
        </div>
      )}
    </div>
  );
};
