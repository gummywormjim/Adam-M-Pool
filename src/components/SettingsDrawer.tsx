import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Lock,
  CloudOff,
  Cloud,
  Database,
  Download,
  Upload,
  Trash2,
  PhoneCall,
  Sun,
  Moon,
  Key,
  Check,
  RefreshCw,
  Code2,
  Heart,
  User,
  Sparkles,
} from 'lucide-react';
import { sqliteStorage, SQLITE_DDL_SCHEMA } from '../db/sqliteStorage';
import { LikedAffirmationsView } from './LikedAffirmationsView';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currency: string;
  onCurrencyChange: (c: string) => void;
  isBiometricsEnabled: boolean;
  onToggleBiometrics: (enabled: boolean) => void;
  currentPin: string;
  onPinChange: (newPin: string) => void;
  isDarkMode: boolean;
  onDataReset: () => void;
  initialTab?: 'profile' | 'settings' | 'schema' | 'helpline';
  onOpenDrive: () => void;
  onOpenTutorial?: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  currency,
  onCurrencyChange,
  isBiometricsEnabled,
  onToggleBiometrics,
  currentPin,
  onPinChange,
  isDarkMode,
  onDataReset,
  initialTab = 'profile',
  onOpenDrive,
  onOpenTutorial,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'schema' | 'helpline'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const [userName, setUserName] = useState(sqliteStorage.getSetting('user_name', 'Recovery Warrior'));
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [cloudSync, setCloudSync] = useState(
    sqliteStorage.getSetting('cloud_sync_enabled', 'false') === 'true'
  );
  const [pinInput, setPinInput] = useState(currentPin);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const handleCloudSyncToggle = async () => {
    const next = !cloudSync;
    setCloudSync(next);
    await sqliteStorage.setSetting('cloud_sync_enabled', next ? 'true' : 'false');
  };

  const handleSavePin = async () => {
    if (pinInput.length === 4) {
      onPinChange(pinInput);
      await sqliteStorage.setSetting('biometrics_pin', pinInput);
      setIsEditingPin(false);
    }
  };

  const handleExportBackup = async () => {
    const backupJson = await sqliteStorage.exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitvault-sqlite-cipher-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await sqliteStorage.importBackup(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
        onDataReset();
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Invalid backup file format.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleWipeDatabase = async () => {
    await sqliteStorage.wipeAllData();
    onDataReset();
    setConfirmWipe(false);
    onClose();
  };

  const handleResetToDemo = async () => {
    await sqliteStorage.resetToDefaults();
    onDataReset();
    onClose();
  };

  const handleSaveName = async () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      await sqliteStorage.setSetting('user_name', nameInput.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className={`w-full max-w-md h-full flex flex-col border-l shadow-2xl transition-all ${
          isDarkMode
            ? 'bg-[#121417] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h2 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Profile &amp; Settings
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Settings Drawer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Vault
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'schema'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Schema
          </button>
          <button
            onClick={() => setActiveTab('helpline')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'helpline'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Helpline
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-[#181A1E] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {userName.slice(0, 1).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider block">
                      Local Recovery Profile
                    </span>

                    {isEditingName ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className={`p-1 px-2 text-xs font-bold rounded border ${
                            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                        <button
                          onClick={handleSaveName}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className={`text-base font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {userName}
                        </h3>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className={`text-xs ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          (Edit)
                        </button>
                      </div>
                    )}

                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                      Zero-cloud. All personal milestones reside exclusively on this device.
                    </p>
                  </div>
                </div>
              </div>

              {/* Liked Affirmations Section */}
              <LikedAffirmationsView
                isDarkMode={isDarkMode}
                onAffirmationToggled={onDataReset}
              />
            </div>
          )}
          {activeTab === 'settings' && (
            <>
              {/* Storage & Privacy Status Card */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDarkMode
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-emerald-50/60 border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    100% Local Encrypted SQLite
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your addiction metrics, trigger tags, and financial slip logs are stored locally and encrypted using Web Crypto AES-256 (SQLCipher specification). Zero external servers, no ads, zero telemetry.
                </p>
              </div>

              {/* App Tutorial Walkthrough Button */}
              {onOpenTutorial && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold">App Tutorial Walkthrough</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Review how to add spending, track baselines, and surf urges
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTutorial();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors cursor-pointer"
                  >
                    View Tutorial
                  </button>
                </div>
              )}

              {/* Google Drive Cloud Sync */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-sky-500" />
                      <span className="text-sm font-semibold">Google Drive Cloud Sync</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Encrypted cloud snapshots directly in your Google Drive
                    </p>
                  </div>

                  <button
                    onClick={onOpenDrive}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold transition-colors"
                  >
                    Manage
                  </button>
                </div>

                <button
                  onClick={onOpenDrive}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-medium flex items-center justify-between transition-colors text-slate-600 dark:text-slate-300"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Backup, restore, and view Drive files</span>
                  </span>
                  <span className="text-sky-500 font-semibold text-[11px]">Open Hub →</span>
                </button>
              </div>

              {/* Biometrics & PIN Settings */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold">Biometrics / PIN Lock</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Secure app with Face ID, Touch ID, or 4-digit PIN
                    </p>
                  </div>

                  <button
                    onClick={() => onToggleBiometrics(!isBiometricsEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      isBiometricsEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {isBiometricsEnabled && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Passcode PIN</span>
                    {isEditingPin ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="password"
                          maxLength={4}
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value)}
                          className="w-16 p-1 rounded border text-center font-mono text-xs bg-slate-900 border-slate-700 text-white"
                        />
                        <button
                          onClick={handleSavePin}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-xs"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingPin(true)}
                        className="text-xs font-mono text-slate-300 hover:underline flex items-center gap-1"
                      >
                        <span>PIN: {currentPin}</span>
                        <span className="text-[10px] text-slate-500">(Edit)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Currency Selector */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold">Currency Symbol</span>
                  <p className="text-xs text-slate-400 mt-0.5">Used for financial saved/spent metrics</p>
                </div>

                <div className="flex gap-1">
                  {['$', '€', '£', '¥', 'C$'].map((sym) => (
                    <button
                      key={sym}
                      onClick={() => onCurrencyChange(sym)}
                      className={`min-h-[36px] min-w-[36px] rounded-lg font-mono text-xs font-bold transition-colors ${
                        currency === sym
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold">Display Theme</span>
                  <p className="text-xs text-slate-400 mt-0.5">High-contrast Slate `#1E1E1E` or Pure White</p>
                </div>

                <button
                  onClick={onToggleTheme}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>

              {/* Backup & Restore */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Backup &amp; Migration
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExportBackup}
                    className="min-h-[44px] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    <span>Export Vault JSON</span>
                  </button>

                  <label className="min-h-[44px] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>Restore Backup</span>
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>
                {importStatus && (
                  <p className="text-xs text-emerald-500 font-medium text-center">{importStatus}</p>
                )}
              </div>

              {/* Reset to Seed / Wipe */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  onClick={handleResetToDemo}
                  className="w-full min-h-[40px] text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore Sample Starter Substances</span>
                </button>

                {!confirmWipe ? (
                  <button
                    onClick={() => setConfirmWipe(true)}
                    className="w-full min-h-[40px] text-xs font-medium text-rose-500 hover:text-rose-400 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Wipe Encrypted Local Vault</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
                    <p className="text-xs text-rose-400 font-medium">
                      Permanently wipe all records? This cannot be undone.
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={handleWipeDatabase}
                        className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-bold"
                      >
                        Confirm Wipe
                      </button>
                      <button
                        onClick={() => setConfirmWipe(false)}
                        className="px-3 py-1 border border-slate-700 text-slate-300 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>SQLite DDL Schema (SQLCipher Compatible)</span>
              </div>
              <p className="text-xs text-slate-400">
                The exact table definitions used for local-first storage:
              </p>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {SQLITE_DDL_SCHEMA}
              </pre>
            </div>
          )}

          {activeTab === 'helpline' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                24/7 Immediate Recovery &amp; Crisis Support
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Confidential, free, and available around the clock:
              </p>

              <div className="space-y-2.5">
                <a
                  href="tel:988"
                  className="block p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#181A1E] hover:border-slate-400 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-rose-500">
                    <span>988 Suicide &amp; Crisis Lifeline</span>
                    <span>Call or Text 988</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Free, confidential emotional support and substance crisis care.
                  </p>
                </a>

                <a
                  href="tel:18006624357"
                  className="block p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#181A1E] hover:border-slate-400 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-500">
                    <span>SAMHSA National Helpline</span>
                    <span>1-800-662-4357</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Substance abuse and mental health services administration.
                  </p>
                </a>

                <a
                  href="sms:741741?body=HOME"
                  className="block p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#181A1E] hover:border-slate-400 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-500">
                    <span>Crisis Text Line</span>
                    <span>Text HOME to 741741</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Connect with a volunteer crisis counselor 24/7.
                  </p>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
