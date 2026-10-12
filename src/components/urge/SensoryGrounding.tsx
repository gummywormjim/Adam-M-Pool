import React, { useState } from 'react';
import { Eye, Hand, Volume2, Sparkles, Coffee, Check, RotateCcw } from 'lucide-react';

interface SensoryGroundingProps {
  isDarkMode: boolean;
  onAllCompleted?: () => void;
}

interface Step {
  id: number;
  count: number;
  icon: React.ReactNode;
  label: string;
  placeholder: string;
}

export const SensoryGrounding: React.FC<SensoryGroundingProps> = ({ isDarkMode, onAllCompleted }) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const steps: Step[] = [
    {
      id: 5,
      count: 5,
      icon: <Eye className="w-4 h-4 text-sky-400" />,
      label: '5 Things you can SEE',
      placeholder: 'Spot 5 distinct objects, shadows, or textures in your room.',
    },
    {
      id: 4,
      count: 4,
      icon: <Hand className="w-4 h-4 text-emerald-400" />,
      label: '4 Things you can FEEL',
      placeholder: 'Feet on floor, fabric of your shirt, breeze, cool phone surface.',
    },
    {
      id: 3,
      count: 3,
      icon: <Volume2 className="w-4 h-4 text-violet-400" />,
      label: '3 Things you can HEAR',
      placeholder: 'Hum of appliances, distant traffic, your own steady breathing.',
    },
    {
      id: 2,
      count: 2,
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      label: '2 Things you can SMELL',
      placeholder: 'Fresh air, coffee grounds, soap, or imagine your favorite scent.',
    },
    {
      id: 1,
      count: 1,
      icon: <Coffee className="w-4 h-4 text-rose-400" />,
      label: '1 Thing you can TASTE',
      placeholder: 'A sip of cold water, mint, or the clean taste of your mouth.',
    },
  ];

  const toggleStep = (id: number) => {
    const updated = { ...checkedSteps, [id]: !checkedSteps[id] };
    setCheckedSteps(updated);
    if (Object.values(updated).filter(Boolean).length === 5 && onAllCompleted) {
      onAllCompleted();
    }
  };

  const handleReset = () => {
    setCheckedSteps({});
  };

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all ${
        isDarkMode ? 'bg-[#14161A] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <span className="font-semibold text-slate-300 dark:text-slate-200">5-4-3-2-1 Sensory Grounding</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-emerald-400">{completedCount} of 5 completed</span>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-400 mb-4">
        Shift focus from internal craving obsession back to your physical sensory environment. Tap each item as you notice it:
      </p>

      <div className="space-y-2.5">
        {steps.map((s) => {
          const isDone = !!checkedSteps[s.id];
          return (
            <button
              key={s.id}
              onClick={() => toggleStep(s.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                isDone
                  ? isDarkMode
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300'
                    : 'bg-emerald-50 border-emerald-200 text-slate-800'
                  : isDarkMode
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : isDarkMode
                    ? 'border-slate-700 bg-slate-800 text-transparent'
                    : 'border-slate-300 bg-slate-100 text-transparent'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${isDone ? 'block' : 'hidden'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-medium text-xs sm:text-sm">
                  {s.icon}
                  <span className={isDone ? 'line-through text-slate-400' : ''}>{s.label}</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">{s.placeholder}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
