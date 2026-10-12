import React from 'react';
import { Menu, Sun, Moon, Lock, ShieldCheck, Smartphone, Monitor, Cloud } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isBiometricsEnabled: boolean;
  onLockApp: () => void;
  onOpenMenu: () => void;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
  onOpenDrive: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  isBiometricsEnabled,
  onLockApp,
  onOpenMenu,
  isFrameMode,
  onToggleFrameMode,
  onOpenDrive,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-30 transition-colors border-b ${
        isDark
          ? 'bg-[#121417]/95 border-slate-800/80 text-slate-100 backdrop-blur-md'
          : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Menu trigger & App Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            aria-label="Open Navigation Menu"
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              HabitVault
            </span>
            <span className={`hidden sm:inline-block text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              · Local Vault
            </span>
          </div>
        </div>

        {/* Right Action Cluster: Drive, Biometrics, Frame Mode, and Dark/Light toggle */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Google Drive Cloud Backup Button */}
          <button
            onClick={onOpenDrive}
            title="Google Drive Vault Sync & Backup"
            aria-label="Open Google Drive Backup & Sync"
            className={`min-h-[44px] px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 hover:border-slate-700'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-500" />
            <span className="hidden xs:inline">Drive</span>
          </button>
          {/* Biometrics Protection Status Button */}
          <button
            onClick={onLockApp}
            title={isBiometricsEnabled ? 'Encrypted with Biometrics / PIN. Tap to lock.' : 'Biometrics disabled in settings'}
            className={`min-h-[44px] px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            {isBiometricsEnabled ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="hidden xs:inline">Vault Secured</span>
                <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xs:inline">Lock</span>
              </>
            )}
          </button>

          {/* Device Frame Viewport Switcher */}
          <button
            onClick={onToggleFrameMode}
            title={isFrameMode ? 'Switch to Full Screen Viewport' : 'Switch to Mobile Frame Preview'}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Toggle mobile device frame"
          >
            {isFrameMode ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Dynamic Light/Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
              isDark
                ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/70'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
