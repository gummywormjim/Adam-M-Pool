import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  isFrameMode: boolean;
  isDarkMode: boolean;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  children,
  isFrameMode,
  isDarkMode,
}) => {
  if (!isFrameMode) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return (
    <div className="min-h-screen w-full bg-slate-900/90 py-6 sm:py-10 flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Mobile Device Frame Container (iPhone 16 Pro styling) */}
      <div
        className={`w-full max-w-[420px] h-[870px] rounded-[50px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden relative transition-all ${
          isDarkMode ? 'bg-[#121417] text-white' : 'bg-white text-slate-900'
        }`}
      >
        {/* Dynamic Island / Top Notch */}
        <div className="absolute top-0 left-0 right-0 h-11 z-40 flex items-center justify-between px-7 text-[12px] font-semibold select-none pointer-events-none">
          <span className="tracking-tight font-mono">9:41</span>
          {/* Dynamic Island pill */}
          <div className="w-24 h-5 bg-black rounded-full mx-auto" />
          <div className="flex items-center gap-1.5 text-xs">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Device screen viewport */}
        <div className="pt-10 flex-1 overflow-y-auto flex flex-col relative">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="h-5 flex items-center justify-center shrink-0 pb-1 pointer-events-none">
          <div className="w-32 h-1 bg-slate-400/50 dark:bg-slate-600 rounded-full" />
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-400 font-mono text-center">
        Mobile Device Simulation Mode · Click screen icon in header to expand
      </div>
    </div>
  );
};
