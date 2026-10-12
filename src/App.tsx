/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DailyAffirmationBanner } from './components/DailyAffirmationBanner';
import { UrgeBannerButton } from './components/urge/UrgeBannerButton';
import { UrgeModal } from './components/urge/UrgeModal';
import { FinancialSummaryCard } from './components/FinancialSummaryCard';
import { SubstanceList } from './components/SubstanceList';
import { ExpenseLogModal } from './components/ExpenseLogModal';
import { AddSubstanceModal } from './components/AddSubstanceModal';
import { SubstanceDetailModal } from './components/SubstanceDetailModal';
import { FinancialReportsView } from './components/FinancialReportsView';
import { SecurityLockScreen } from './components/SecurityLockScreen';
import { SettingsDrawer } from './components/SettingsDrawer';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';
import { MonthlyIncomeImpactCard } from './components/MonthlyIncomeImpactCard';
import { InitialSecuritySetupModal } from './components/InitialSecuritySetupModal';
import { PWAInstallBanner, OfflineIndicator } from './components/pwa/PWAInstallBanner';
import { EditSubstanceModal } from './components/EditSubstanceModal';
import { GoogleDriveHubModal } from './components/drive/GoogleDriveHubModal';
import { CrisisSupportBar } from './components/CrisisSupportBar';
import { QuickUnitSlipModal } from './components/QuickUnitSlipModal';
import { OnboardingTutorialModal } from './components/OnboardingTutorialModal';
import { CheckCircle2 } from 'lucide-react';
import { sqliteStorage } from './db/sqliteStorage';
import { Substance } from './types';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isLocked, setIsLocked] = useState(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(true);
  const [pin, setPin] = useState('1234');
  const [currency, setCurrency] = useState('$');
  const [isFrameMode, setIsFrameMode] = useState(false);
  const [quickToast, setQuickToast] = useState<{ message: string } | null>(null);

  // Modals & Navigation state
  const [isUrgeModalOpen, setIsUrgeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAddSubstanceOpen, setIsAddSubstanceOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingSubstance, setEditingSubstance] = useState<Substance | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState<'profile' | 'settings' | 'schema' | 'helpline'>('profile');
  const [activeView, setActiveView] = useState<'dashboard' | 'reports'>('dashboard');

  const [activeSubstanceForLog, setActiveSubstanceForLog] = useState<Substance | null>(null);
  const [activeSubstanceForDetail, setActiveSubstanceForDetail] = useState<Substance | null>(null);
  const [slipModalSubstance, setSlipModalSubstance] = useState<Substance | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Financial timeframe for summary card
  const [summaryTimeframe, setSummaryTimeframe] = useState<'week' | 'month' | 'all'>('all');

  // Trigger re-render on database changes
  const [dbRevision, setDbRevision] = useState(0);

  useEffect(() => {
    sqliteStorage.init().then(() => {
      const storedTheme = sqliteStorage.getSetting('theme', 'dark') as 'dark' | 'light';
      const biometrics = sqliteStorage.getSetting('biometrics_enabled', 'true') === 'true';
      const storedPin = sqliteStorage.getSetting('biometrics_pin', '1234');
      const storedCurrency = sqliteStorage.getSetting('currency', '$');
      const frameMode = sqliteStorage.getSetting('device_frame_mode', 'false') === 'true';
      const securitySetupDone = sqliteStorage.getSetting('security_setup_completed', 'false') === 'true';

      setTheme(storedTheme);
      setIsBiometricsEnabled(biometrics);
      setPin(storedPin);
      setCurrency(storedCurrency);
      setIsFrameMode(frameMode);

      // First time launch: prompt to set 4-digit PIN or link biometrics
      const tutorialDone = sqliteStorage.getSetting('tutorial_completed', 'false') === 'true';

      if (!securitySetupDone) {
        setIsFirstTimeSetup(true);
        setIsLocked(false);
      } else if (!tutorialDone) {
        setIsTutorialOpen(true);
      } else if (biometrics) {
        // Subsequent launches: lock with biometrics/PIN
        setIsLocked(true);
      }

      setIsInitialized(true);
    });

    const unsubscribe = sqliteStorage.subscribe(() => {
      setDbRevision((r) => r + 1);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    await sqliteStorage.setSetting('theme', nextTheme);
  };

  const handleToggleFrameMode = async () => {
    const nextMode = !isFrameMode;
    setIsFrameMode(nextMode);
    await sqliteStorage.setSetting('device_frame_mode', nextMode ? 'true' : 'false');
  };

  const handleToggleBiometrics = async (enabled: boolean) => {
    setIsBiometricsEnabled(enabled);
    await sqliteStorage.setSetting('biometrics_enabled', enabled ? 'true' : 'false');
  };

  const handlePinChange = async (newPin: string) => {
    setPin(newPin);
    await sqliteStorage.setSetting('biometrics_pin', newPin);
  };

  const handleCurrencyChange = async (newCurr: string) => {
    setCurrency(newCurr);
    await sqliteStorage.setSetting('currency', newCurr);
  };

  // Substances and financial calculations from encrypted SQLite
  const substances = sqliteStorage.getSubstances();
  const financials = sqliteStorage.calculateFinancials(summaryTimeframe);
  const urgesOvercomeCount = sqliteStorage.getUrgeLogs().filter((u) => u.surfed_successfully).length;

  const handleQuickLog = (substance: Substance) => {
    setActiveSubstanceForLog(substance);
    setIsExpenseModalOpen(true);
  };

  const handleQuickAddUnit = (substance: Substance) => {
    setSlipModalSubstance(substance);
  };

  const handleConfirmUnitSlip = async (resetSoberDate: boolean) => {
    if (!slipModalSubstance) return;
    const substance = slipModalSubstance;
    const cost =
      substance.cost_per_unit != null && substance.cost_per_unit > 0
        ? substance.cost_per_unit
        : substance.cost_per_day || 10;
    const unitLabel = substance.unit_name || 'unit';

    if (resetSoberDate) {
      const nowIso = new Date().toISOString();
      await sqliteStorage.updateSubstance(substance.id, {
        quit_date: nowIso,
      });
    }

    await sqliteStorage.addExpenseLog({
      substance_id: substance.id,
      amount_spent: cost,
      units_count: 1,
      trigger_tag: resetSoberDate ? 'Reset Streak' : 'Slip',
      note: resetSoberDate
        ? `+1 ${unitLabel} logged (${currency}${cost.toFixed(2)}) - Sober date reset to today`
        : `+1 ${unitLabel} logged (${currency}${cost.toFixed(2)}) - "It was just a slip, keep my sober date."`,
    });

    setQuickToast({
      message: resetSoberDate
        ? `+1 ${unitLabel} logged. Sober date reset to today.`
        : `+1 ${unitLabel} logged. Kept sober date ("It was just a slip").`,
    });
    setDbRevision((r) => r + 1);
    setSlipModalSubstance(null);

    setTimeout(() => {
      setQuickToast(null);
    }, 3200);
  };

  const handleOpenDetails = (substance: Substance) => {
    setActiveSubstanceForDetail(substance);
    setIsDetailModalOpen(true);
  };

  const isDarkMode = theme === 'dark';

  const handleCompleteInitialSecurity = async (newPin: string, biometricsEnabled: boolean) => {
    setPin(newPin);
    setIsBiometricsEnabled(biometricsEnabled);
    await sqliteStorage.setSetting('biometrics_pin', newPin);
    await sqliteStorage.setSetting('biometrics_enabled', biometricsEnabled ? 'true' : 'false');
    await sqliteStorage.setSetting('security_setup_completed', 'true');
    setIsFirstTimeSetup(false);
    setIsLocked(false);

    // After security setup, offer skippable tutorial if not already completed
    const tutorialDone = sqliteStorage.getSetting('tutorial_completed', 'false') === 'true';
    if (!tutorialDone) {
      setIsTutorialOpen(true);
    }
  };

  const handleCompleteTutorial = async () => {
    await sqliteStorage.setSetting('tutorial_completed', 'true');
    setIsTutorialOpen(false);
    setDbRevision((r) => r + 1);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#121417] flex items-center justify-center text-white font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Decrypting SQLite Vault...</span>
        </div>
      </div>
    );
  }

  // 1. First-Time Security Passcode or Biometrics Prompt
  if (isFirstTimeSetup) {
    return (
      <InitialSecuritySetupModal
        isDarkMode={isDarkMode}
        onComplete={handleCompleteInitialSecurity}
      />
    );
  }

  // 2. Security Lockout Screen (Subsequent launches or manual lock)
  if (isLocked) {
    return (
      <SecurityLockScreen
        correctPin={pin}
        isDarkMode={isDarkMode}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  return (
    <MobileDeviceFrame isFrameMode={isFrameMode} isDarkMode={isDarkMode}>
      <div
        className={`min-h-screen transition-colors flex flex-col ${
          isDarkMode
            ? 'bg-[#121417] text-slate-100 selection:bg-slate-800'
            : 'bg-[#F8FAFC] text-slate-900 selection:bg-slate-200'
        }`}
      >
        {/* PWA Install Alert */}
        <PWAInstallBanner isDarkMode={isDarkMode} />

        {/* 1. HEADER (Menu, Drive status, Biometrics, Dynamic Theme toggle) */}
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isBiometricsEnabled={isBiometricsEnabled}
          onLockApp={() => setIsLocked(true)}
          onOpenMenu={() => setIsSettingsOpen(true)}
          isFrameMode={isFrameMode}
          onToggleFrameMode={handleToggleFrameMode}
          onOpenDrive={() => setIsDriveModalOpen(true)}
        />

        {/* Main View Router */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6">
          {activeView === 'reports' ? (
            <FinancialReportsView
              onBack={() => setActiveView('dashboard')}
              currency={currency}
              isDarkMode={isDarkMode}
              onOpenDrive={() => setIsDriveModalOpen(true)}
              onDataUpdated={() => setDbRevision((r) => r + 1)}
            />
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {/* Discreet, visible 24/7 Crisis Hotline & chat.988lifeline.org links at top of home screen */}
              <CrisisSupportBar isDarkMode={isDarkMode} />

              {/* 2. DAILY AFFIRMATION BANNER (365 Days, 24-hr cycling, Liked Affirmations) */}
              <DailyAffirmationBanner
                isDarkMode={isDarkMode}
                onOpenLikedVault={() => {
                  setDrawerInitialTab('profile');
                  setIsSettingsOpen(true);
                }}
              />

              {/* 3. "FEELING AN URGE?" HIGH-VISIBILITY BUTTON */}
              <UrgeBannerButton
                onClick={() => setIsUrgeModalOpen(true)}
                urgesOvercomeCount={urgesOvercomeCount}
                isDarkMode={isDarkMode}
              />

              {/* 4. LIST OF TRACKED SUBSTANCE CARDS WITH QUICK + LOG BUTTONS */}
              <SubstanceList
                substances={substances}
                perSubstanceSaved={financials.perSubstanceSaved}
                perSubstanceSpent={financials.perSubstanceSpent}
                currency={currency}
                onQuickLog={handleQuickLog}
                onQuickAddUnit={handleQuickAddUnit}
                onOpenDetails={handleOpenDetails}
                onEdit={(sub) => setEditingSubstance(sub)}
                onAddNew={() => setIsAddSubstanceOpen(true)}
                isDarkMode={isDarkMode}
              />

              {/* 5. FINANCIAL IMPACT OVERVIEW (Saved vs. Spent) */}
              <FinancialSummaryCard
                totalSaved={financials.totalSaved}
                totalSpent={financials.totalSpent}
                currency={currency}
                timeframe={summaryTimeframe}
                onTimeframeChange={setSummaryTimeframe}
                onOpenDetailedReports={() => setActiveView('reports')}
                onResetTotalSpent={() => setDbRevision((r) => r + 1)}
                isDarkMode={isDarkMode}
              />

              {/* 6. OPTIONAL MONTHLY INCOME SUBSTANCE IMPACT CALCULATOR */}
              <MonthlyIncomeImpactCard
                currency={currency}
                isDarkMode={isDarkMode}
                onIncomeUpdated={() => setDbRevision((r) => r + 1)}
              />
            </div>
          )}
        </main>

        {/* Offline Vault Presence */}
        <OfflineIndicator />

        {/* --- MODALS & DRAWERS --- */}

        {/* Urge Relief & Alternative Activities Engine Modal */}
        <UrgeModal
          isOpen={isUrgeModalOpen}
          onClose={() => setIsUrgeModalOpen(false)}
          substances={substances}
          isDarkMode={isDarkMode}
          onUrgeSurfed={() => setDbRevision((r) => r + 1)}
        />

        {/* Expense Logging Modal with Pre-filled Amount & Trigger Tagging */}
        <ExpenseLogModal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setActiveSubstanceForLog(null);
          }}
          substance={activeSubstanceForLog}
          currency={currency}
          isDarkMode={isDarkMode}
          onLogSaved={() => setDbRevision((r) => r + 1)}
        />

        {/* Onboarding & Add Substance Modal */}
        <AddSubstanceModal
          isOpen={isAddSubstanceOpen}
          onClose={() => setIsAddSubstanceOpen(false)}
          currency={currency}
          isDarkMode={isDarkMode}
          onSubstanceCreated={() => setDbRevision((r) => r + 1)}
        />

        {/* Substance Detail & Ledger Modal */}
        <SubstanceDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setActiveSubstanceForDetail(null);
          }}
          substance={activeSubstanceForDetail}
          currency={currency}
          isDarkMode={isDarkMode}
          onEdit={(sub) => setEditingSubstance(sub)}
          onUpdated={() => setDbRevision((r) => r + 1)}
        />

        {/* Real-Time Substance Editor Modal */}
        <EditSubstanceModal
          isOpen={!!editingSubstance}
          onClose={() => setEditingSubstance(null)}
          substance={editingSubstance}
          currency={currency}
          isDarkMode={isDarkMode}
          onSubstanceUpdated={() => {
            setEditingSubstance(null);
            setDbRevision((r) => r + 1);
          }}
          onSubstanceDeleted={() => {
            setEditingSubstance(null);
            setDbRevision((r) => r + 1);
          }}
        />

        {/* Settings, SQL Schema Viewer & Crisis Helpline Drawer */}
        <SettingsDrawer
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          isBiometricsEnabled={isBiometricsEnabled}
          onToggleBiometrics={handleToggleBiometrics}
          currentPin={pin}
          onPinChange={handlePinChange}
          isDarkMode={isDarkMode}
          onDataReset={() => setDbRevision((r) => r + 1)}
          initialTab={drawerInitialTab}
          onOpenDrive={() => {
            setIsSettingsOpen(false);
            setIsDriveModalOpen(true);
          }}
          onOpenTutorial={() => {
            setIsSettingsOpen(false);
            setIsTutorialOpen(true);
          }}
        />

        {/* Google Drive Cloud Vault Backup & Sync Modal */}
        <GoogleDriveHubModal
          isOpen={isDriveModalOpen}
          onClose={() => setIsDriveModalOpen(false)}
          isDarkMode={isDarkMode}
          currency={currency}
          onDataRestored={() => setDbRevision((r) => r + 1)}
        />

        {/* Quick Unit Slip Check-in Modal */}
        <QuickUnitSlipModal
          isOpen={!!slipModalSubstance}
          onClose={() => setSlipModalSubstance(null)}
          substance={slipModalSubstance}
          currency={currency}
          isDarkMode={isDarkMode}
          onConfirm={handleConfirmUnitSlip}
        />

        {/* Skippable Onboarding Tutorial Modal */}
        <OnboardingTutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          currency={currency}
          isDarkMode={isDarkMode}
          onComplete={handleCompleteTutorial}
        />

        {/* Quick Log Floating Toast Notification */}
        {quickToast && (
          <aside
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white shadow-xl text-xs font-bold animate-fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />
            <span>{quickToast.message}</span>
          </aside>
        )}
      </div>
    </MobileDeviceFrame>
  );
}
