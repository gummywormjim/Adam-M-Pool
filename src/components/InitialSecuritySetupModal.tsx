import React, { useState } from 'react';
import {
  Shield,
  Lock,
  ScanFace,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Delete,
  Sparkles,
} from 'lucide-react';

interface InitialSecuritySetupModalProps {
  onComplete: (pin: string, biometricsEnabled: boolean) => void;
  isDarkMode: boolean;
}

export const InitialSecuritySetupModal: React.FC<InitialSecuritySetupModalProps> = ({
  onComplete,
  isDarkMode,
}) => {
  const [step, setStep] = useState<'create_pin' | 'confirm_pin'>('create_pin');
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [biometricsLinked, setBiometricsLinked] = useState<boolean>(true);
  const [isScanningBiometrics, setIsScanningBiometrics] = useState<boolean>(false);
  const [biometricSuccess, setBiometricSuccess] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    setErrorMessage('');
    if (step === 'create_pin') {
      if (pin.length >= 4) return;
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        // Advance to confirmation step smoothly
        setTimeout(() => {
          setStep('confirm_pin');
        }, 200);
      }
    } else {
      if (confirmPin.length >= 4) return;
      const next = confirmPin + digit;
      setConfirmPin(next);
      if (next.length === 4) {
        if (next === pin) {
          // Passcode confirmed!
          onComplete(pin, biometricsLinked);
        } else {
          setErrorMessage('Passcodes did not match. Please re-enter.');
          setTimeout(() => {
            setConfirmPin('');
          }, 300);
        }
      }
    }
  };

  const handleDelete = () => {
    setErrorMessage('');
    if (step === 'create_pin') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      if (confirmPin.length === 0) {
        // Go back to create pin
        setStep('create_pin');
        setPin('');
      } else {
        setConfirmPin((prev) => prev.slice(0, -1));
      }
    }
  };

  const handleLinkBiometrics = () => {
    setIsScanningBiometrics(true);
    setTimeout(() => {
      setIsScanningBiometrics(false);
      setBiometricSuccess(true);
      setBiometricsLinked(true);
    }, 700);
  };

  const activeInput = step === 'create_pin' ? pin : confirmPin;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-8 animate-fade-in transition-colors ${
        isDarkMode ? 'bg-[#121417] text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Welcome Lockup */}
      <div className="pt-4 flex flex-col items-center text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 shadow-sm">
          <Shield className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 mb-1">
          First-Time Security Setup
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Protect Your HabitVault
        </h1>
        <p className={`text-xs mt-1.5 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          HabitVault is 100% offline and encrypted with SQLCipher (AES-256). Set your master 4-digit passcode or link Face ID to ensure total privacy.
        </p>
      </div>

      {/* Middle: Step Indicator & PIN Display */}
      <div className="flex flex-col items-center my-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold">
          <span className={step === 'create_pin' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
            1. Enter 4 Digits
          </span>
          <span className="text-slate-400">→</span>
          <span className={step === 'confirm_pin' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
            2. Confirm Passcode
          </span>
        </div>

        {/* 4-Dot Display */}
        <div className="flex items-center gap-4 my-3">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = activeInput.length > idx;
            return (
              <div
                key={idx}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  isFilled
                    ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-sm shadow-emerald-500/30'
                    : isDarkMode
                    ? 'border-slate-600 bg-transparent'
                    : 'border-slate-300 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {errorMessage ? (
          <span className="text-xs font-semibold text-rose-500 animate-shake flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMessage}
          </span>
        ) : (
          <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
            {step === 'create_pin'
              ? 'Choose a memorable 4-digit number'
              : 'Re-enter your 4 digits to confirm'}
          </span>
        )}
      </div>

      {/* Keypad & Biometrics link */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-3">
        {/* Biometrics Link Toggle / Quick Action */}
        <button
          onClick={handleLinkBiometrics}
          className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
            biometricSuccess
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
              : isDarkMode
              ? 'bg-slate-900 border-slate-800 text-white hover:border-slate-700'
              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {isScanningBiometrics ? (
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : biometricSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <ScanFace className="w-4 h-4 text-emerald-400" />
            )}
            <span>
              {biometricSuccess
                ? 'Biometrics Linked (Face ID / Touch ID)'
                : 'Link Face ID / Fingerprint'}
            </span>
          </div>

          <span className="text-[10px] text-emerald-400 font-bold uppercase">
            {biometricSuccess ? 'Active' : 'Enable'}
          </span>
        </button>

        {/* 3x4 Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className={`min-h-[58px] rounded-2xl font-mono text-2xl font-bold transition-all active:scale-95 flex items-center justify-center ${
                isDarkMode
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-800'
                  : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 shadow-xs'
              }`}
            >
              {num}
            </button>
          ))}

          {/* Biometrics Icon / Quick shortcut */}
          <button
            onClick={handleLinkBiometrics}
            aria-label="Link Biometrics"
            className={`min-h-[58px] rounded-2xl transition-all active:scale-95 flex items-center justify-center text-emerald-400 ${
              isDarkMode
                ? 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
                : 'bg-white hover:bg-slate-100 border border-slate-200 shadow-xs'
            }`}
          >
            <Fingerprint className="w-6 h-6" />
          </button>

          {/* 0 */}
          <button
            onClick={() => handleDigit('0')}
            className={`min-h-[58px] rounded-2xl font-mono text-2xl font-bold transition-all active:scale-95 flex items-center justify-center ${
              isDarkMode
                ? 'bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-800'
                : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            0
          </button>

          {/* Backspace */}
          <button
            onClick={handleDelete}
            aria-label="Delete last digit"
            className={`min-h-[58px] rounded-2xl transition-all active:scale-95 flex items-center justify-center ${
              isDarkMode
                ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                : 'bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pb-safe text-[11px] text-slate-400 text-center max-w-xs">
        Your security credentials never leave this device. Zero cloud sync by default.
      </div>
    </div>
  );
};
