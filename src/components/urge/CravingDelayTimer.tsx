import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

interface CravingDelayTimerProps {
  isDarkMode: boolean;
  onTimerComplete?: () => void;
}

const TOTAL_SECONDS = 10 * 60; // 10 minutes

export const CravingDelayTimer: React.FC<CravingDelayTimerProps> = ({ isDarkMode, onTimerComplete }) => {
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (onTimerComplete) onTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onTimerComplete]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TOTAL_SECONDS);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100;

  const getCheckpointMessage = () => {
    if (timeLeft > 8 * 60) {
      return 'The initial craving impulse is loud, but it only has adrenaline for 3–5 minutes. Stay still.';
    } else if (timeLeft > 5 * 60) {
      return 'You are in the thick of the wave. The peak is plateauing. Deep breaths in through the nose.';
    } else if (timeLeft > 2 * 60) {
      return 'The physical craving is dissipating now. Your prefrontal cortex is taking back the steering wheel.';
    } else if (timeLeft > 0) {
      return 'Almost there. Notice how your body is relaxing. You are in control.';
    }
    return '10 minutes surfed! The acute urge has officially dissolved.';
  };

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col items-center text-center transition-all ${
        isDarkMode ? 'bg-[#14161A] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3">
        <span>Urge Surfing Protocol</span>
        <span className="font-mono">10 Min Delay</span>
      </div>

      {/* Circular Progress Display */}
      <div className="relative w-40 h-40 my-3 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            className={`stroke-current ${isDarkMode ? 'text-slate-800' : 'text-slate-200'}`}
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-amber-500 transition-all duration-1000 ease-linear"
            strokeWidth="6"
            strokeDasharray={276.46}
            strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {isRunning ? 'Surfing...' : 'Paused'}
          </span>
        </div>
      </div>

      <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 min-h-[36px] max-w-xs mb-4">
        {getCheckpointMessage()}
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`min-h-[44px] px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-transform active:scale-95 ${
            isRunning
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          {isRunning ? 'Pause' : 'Start 10m Clock'}
        </button>

        <button
          onClick={handleReset}
          aria-label="Reset Timer"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {timeLeft === 0 && (
        <div className="mt-4 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          <span>Timer complete! Claim your victory below.</span>
        </div>
      )}
    </div>
  );
};
