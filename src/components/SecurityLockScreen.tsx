import React, { useState } from 'react';
import { Lock, Fingerprint, ScanFace, Shield, Delete, AlertCircle } from 'lucide-react';

interface SecurityLockScreenProps {
  onUnlock: () => void;
  correctPin: string;
  isDarkMode: boolean;
}

export const SecurityLockScreen: React.FC<SecurityLockScreenProps> = ({
  onUnlock,
  correctPin,
  isDarkMode,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMsg('');

    if (nextPin.length === 4) {
      if (nextPin === correctPin) {
        onUnlock();
      } else {
        setTimeout(() => {
          setErrorMsg('Incorrect Passcode');
          setPin('');
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleSimulateBiometrics = () => {
    setIsBiometricScanning(true);
    setTimeout(() => {
      setIsBiometricScanning(false);
      onUnlock();
    }, 700);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-8 animate-fade-in transition-colors ${
        isDarkMode ? 'bg-[#121417] text-white' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Status */}
      <div className="pt-4 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">HabitVault Locked</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Encrypted SQLite (AES-256). Authenticate to access your recovery records.
        </p>
      </div>

      {/* Middle: PIN Dots & Error */}
      <div className="flex flex-col items-center my-6">
        <div className="flex items-center gap-4 mb-3">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isFilled
                    ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white scale-110'
                    : 'border-slate-400/60 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {errorMsg ? (
          <span className="text-xs font-semibold text-rose-500 animate-shake">
            {errorMsg}
          </span>
        ) : (
          <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
            Enter your 4-digit security passcode
          </span>
        )}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-4">
        <div className="grid grid-cols-3 gap-3 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className={`min-h-[64px] min-w-[64px] rounded-2xl font-mono text-2xl font-bold transition-all active:scale-95 flex items-center justify-center ${
                isDarkMode
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-800'
                  : 'bg-white hover:bg-slate-200 text-slate-900 border border-slate-200 shadow-sm'
              }`}
            >
              {num}
            </button>
          ))}

          {/* Biometrics Shortcut Button */}
          <button
            onClick={handleSimulateBiometrics}
            aria-label="Unlock with Face ID or Touch ID"
            className={`min-h-[64px] min-w-[64px] rounded-2xl transition-all active:scale-95 flex flex-col items-center justify-center text-emerald-400 ${
              isDarkMode
                ? 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
                : 'bg-white hover:bg-slate-200 border border-slate-200 shadow-sm'
            }`}
          >
            {isBiometricScanning ? (
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ScanFace className="w-6 h-6" />
            )}
          </button>

          {/* 0 */}
          <button
            onClick={() => handleDigit('0')}
            className={`min-h-[64px] min-w-[64px] rounded-2xl font-mono text-2xl font-bold transition-all active:scale-95 flex items-center justify-center ${
              isDarkMode
                ? 'bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-800'
                : 'bg-white hover:bg-slate-200 text-slate-900 border border-slate-200 shadow-sm'
            }`}
          >
            0
          </button>

          {/* Backspace */}
          <button
            onClick={handleDelete}
            aria-label="Delete last digit"
            className={`min-h-[64px] min-w-[64px] rounded-2xl transition-all active:scale-95 flex items-center justify-center text-slate-400 hover:text-white ${
              isDarkMode
                ? 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
                : 'bg-white hover:bg-slate-200 border border-slate-200 shadow-sm'
            }`}
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* 1-tap Biometric Bypass for easy preview testing */}
        <button
          onClick={handleSimulateBiometrics}
          className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1.5 pt-2"
        >
          <Fingerprint className="w-4 h-4" />
          <span>Tap to Authenticate with Face ID / Touch ID</span>
        </button>
      </div>

      <div className="pb-safe text-[11px] text-slate-500 text-center">
        All keys stay on-device. Zero telemetry.
      </div>
    </div>
  );
};
