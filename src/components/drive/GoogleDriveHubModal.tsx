import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Cloud,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  LogOut,
  ExternalLink,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';
import {
  googleSignIn,
  googleSignOut,
  getCurrentUser,
  initAuth,
  getAccessToken,
} from '../../services/googleAuth';
import {
  listHabitVaultDriveBackups,
  uploadBackupToGoogleDrive,
  downloadBackupFromGoogleDrive,
  deleteFileFromGoogleDrive,
  uploadReportToGoogleDrive,
  DriveBackupFile,
} from '../../services/driveService';
import { sqliteStorage } from '../../db/sqliteStorage';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ConfirmDestructiveDialog } from './ConfirmDestructiveDialog';
import { User } from 'firebase/auth';

interface GoogleDriveHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  currency: string;
  onDataRestored: () => void;
}

export const GoogleDriveHubModal: React.FC<GoogleDriveHubModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  currency,
  onDataRestored,
}) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [backups, setBackups] = useState<DriveBackupFile[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Destructive Confirmation States
  const [fileToDelete, setFileToDelete] = useState<DriveBackupFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fileToRestore, setFileToRestore] = useState<DriveBackupFile | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Auto-backup setting
  const [autoBackup, setAutoBackup] = useState(
    sqliteStorage.getSetting('drive_auto_backup', 'false') === 'true'
  );

  const loadBackups = useCallback(async () => {
    setIsLoadingBackups(true);
    setStatusMessage(null);
    try {
      const files = await listHabitVaultDriveBackups();
      setBackups(files);
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
      // If token expired, clear
      if (err.message?.includes('401') || err.message?.includes('Not authenticated')) {
        setToken(null);
      }
    } finally {
      setIsLoadingBackups(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Check token & user
    getAccessToken().then((t) => {
      setToken(t);
      const currentUser = getCurrentUser();
      setUser(currentUser);
      if (t) {
        loadBackups();
      }
    });

    const unsubscribe = initAuth(
      (authedUser, accessToken) => {
        setUser(authedUser);
        setToken(accessToken);
        loadBackups();
      },
      () => {
        setUser(null);
        setToken(null);
        setBackups([]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen, loadBackups]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({ type: 'success', text: `Connected as ${res.user.displayName || res.user.email}` });
        await loadBackups();
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setToken(null);
      setBackups([]);
      setStatusMessage({ type: 'success', text: 'Disconnected from Google Drive' });
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  const handleBackupNow = async () => {
    if (!token) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const backupJson = await sqliteStorage.exportBackup();
      const uploadedFile = await uploadBackupToGoogleDrive(backupJson);
      setStatusMessage({
        type: 'success',
        text: `Successfully uploaded ${uploadedFile.name} to Google Drive!`,
      });
      await loadBackups();
    } catch (err: any) {
      console.error('Upload backup error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to upload backup to Google Drive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!fileToRestore || !token) return;
    setIsRestoring(true);
    try {
      const content = await downloadBackupFromGoogleDrive(fileToRestore.id);
      const success = await sqliteStorage.importBackup(content);
      if (success) {
        setStatusMessage({
          type: 'success',
          text: `Vault restored from ${fileToRestore.name}!`,
        });
        setFileToRestore(null);
        onDataRestored();
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Invalid backup file format.',
        });
        setFileToRestore(null);
      }
    } catch (err: any) {
      console.error('Restore error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to download or restore backup.',
      });
      setFileToRestore(null);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete || !token) return;
    setIsDeleting(true);
    try {
      await deleteFileFromGoogleDrive(fileToDelete.id);
      setStatusMessage({
        type: 'success',
        text: `Deleted ${fileToDelete.name} from Google Drive.`,
      });
      setFileToDelete(null);
      await loadBackups();
    } catch (err: any) {
      console.error('Delete error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to delete backup from Google Drive.',
      });
      setFileToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportReport = async () => {
    if (!token) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const substances = sqliteStorage.getSubstances();
      const financials = sqliteStorage.calculateFinancials('all');
      const urgeLogs = sqliteStorage.getUrgeLogs();

      const reportText = [
        '=======================================================',
        'HABITVAULT FINANCIAL & RECOVERY PROGRESS REPORT',
        `Generated on: ${new Date().toLocaleString()}`,
        '=======================================================',
        '',
        `Total Estimated Savings: ${currency}${financials.totalSaved.toFixed(2)}`,
        `Total Logged Expenses:   ${currency}${financials.totalSpent.toFixed(2)}`,
        `Net Financial Win:       ${currency}${(financials.totalSaved - financials.totalSpent).toFixed(2)}`,
        `Urges Surfed & Overcome: ${urgeLogs.filter((u) => u.surfed_successfully).length}`,
        '',
        '--- TRACKED HABITS ---',
        ...substances.map(
          (s) =>
            `- ${s.name}: ${currency}${(s.cost_per_day ?? s.cost_per_unit ?? 10).toFixed(2)}/day ` +
            `| Quit Date: ${s.quit_date ? new Date(s.quit_date).toLocaleDateString() : 'Active tracking'}`
        ),
        '',
        'Archived securely in Google Drive via HabitVault.',
      ].join('\n');

      const uploaded = await uploadReportToGoogleDrive(reportText, 'Recovery_Summary');
      setStatusMessage({
        type: 'success',
        text: `Exported financial recovery summary to Google Drive as ${uploaded.name}!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to export report to Google Drive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleAutoBackup = async () => {
    const next = !autoBackup;
    setAutoBackup(next);
    await sqliteStorage.setSetting('drive_auto_backup', next ? 'true' : 'false');
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return 'N/A';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return 'N/A';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Unknown date';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drive-modal-title"
      >
        <div
          className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
            isDarkMode
              ? 'bg-[#141619] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Modal Header */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {/* Google Drive Brand SVG */}
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-xs">
                <svg className="w-5 h-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
                  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
                  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
                  <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
                </svg>
              </div>

              <div>
                <h2 id="drive-modal-title" className="text-base font-bold tracking-tight">
                  Google Drive Backup & Sync
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cloud vault archives with zero third-party servers
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Google Drive dialog"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Status alerts */}
            {statusMessage && (
              <div
                className={`p-3 rounded-2xl flex items-start gap-2.5 text-xs animate-fade-in ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span className="flex-1 font-medium">{statusMessage.text}</span>
                <button
                  onClick={() => setStatusMessage(null)}
                  className="opacity-70 hover:opacity-100 text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Authentication state */}
            {!token || !user ? (
              <div
                className={`p-5 rounded-2xl border text-center space-y-4 ${
                  isDarkMode
                    ? 'bg-slate-900/50 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Cloud className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Connect Your Google Drive
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Backup your encrypted recovery milestones and financial logs directly to your Google Drive with your permission.
                  </p>
                </div>

                {authError && (
                  <p className="text-xs text-rose-500 font-medium">{authError}</p>
                )}

                <div className="pt-2 flex justify-center">
                  <GoogleSignInButton
                    onClick={handleSignIn}
                    isLoading={isAuthenticating}
                    text="Sign in with Google to Connect Drive"
                  />
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Only accessible by you. Encrypted end-to-end.</span>
                </div>
              </div>
            ) : (
              <>
                {/* User Connection Banner */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDarkMode
                      ? 'bg-slate-900/60 border-slate-800'
                      : 'bg-emerald-50/60 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-10 h-10 rounded-full border border-emerald-500/30 object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Google Drive Connected
                        </span>
                      </div>
                      <h4 className="text-sm font-bold truncate text-slate-900 dark:text-white">
                        {user.displayName || 'Google Account'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    title="Disconnect Google Drive"
                    className="min-h-[40px] px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors text-slate-600 dark:text-slate-300 shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Sign Out</span>
                  </button>
                </div>

                {/* Primary Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Backup Vault Now Button */}
                  <button
                    onClick={handleBackupNow}
                    disabled={isUploading}
                    className="min-h-[48px] p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>Backup Vault to Drive</span>
                  </button>

                  {/* Export Financial Report Button */}
                  <button
                    onClick={handleExportReport}
                    disabled={isUploading}
                    className="min-h-[48px] p-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] font-bold text-xs flex items-center justify-center gap-2 transition-all text-slate-800 dark:text-slate-200 disabled:opacity-50 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-sky-500" />
                    <span>Export Summary Report</span>
                  </button>
                </div>

                {/* Cloud Backups In Google Drive List */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                      <span>Backups on your Google Drive</span>
                      <span className="text-[10px] py-0.5 px-1.5 rounded-full bg-slate-200 dark:bg-slate-800 font-mono">
                        {backups.length}
                      </span>
                    </span>

                    <button
                      onClick={loadBackups}
                      disabled={isLoadingBackups}
                      aria-label="Refresh backups list"
                      className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 p-1 rounded-md"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {isLoadingBackups && backups.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Querying Google Drive files...</span>
                    </div>
                  ) : backups.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-1 text-slate-400">
                      <p className="text-xs font-semibold">No backups saved on Google Drive yet.</p>
                      <p className="text-[11px]">
                        Tap "Backup Vault to Drive" above to create your first encrypted cloud snapshot.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {backups.map((file) => (
                        <div
                          key={file.id}
                          className={`p-3 rounded-2xl border transition-colors flex items-center justify-between gap-3 ${
                            isDarkMode
                              ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate text-slate-900 dark:text-white">
                                {file.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                              <span>{formatDate(file.modifiedTime || file.createdTime)}</span>
                              <span>•</span>
                              <span>{formatFileSize(file.size)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Restore Button */}
                            <button
                              onClick={() => setFileToRestore(file)}
                              title="Restore this backup into local vault"
                              className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Restore</span>
                            </button>

                            {/* Delete Button (triggers mandatory confirmation modal) */}
                            <button
                              onClick={() => setFileToDelete(file)}
                              title="Delete from Google Drive"
                              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Auto-sync configuration */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Auto-backup to Drive
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Prompt or auto-export whenever you log a major milestone
                    </p>
                  </div>

                  <button
                    onClick={handleToggleAutoBackup}
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      autoBackup ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>AES-256 SQLite Cipher data model</span>
            </span>

            <button
              onClick={onClose}
              className="font-semibold text-slate-700 dark:text-slate-200 hover:underline"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog for Deleting a Google Drive File */}
      <ConfirmDestructiveDialog
        isOpen={!!fileToDelete}
        title="Delete Google Drive Backup?"
        description={`Are you sure you want to delete "${fileToDelete?.name}" from your Google Drive? This action permanently removes this file from Google Drive and cannot be undone.`}
        confirmLabel="Delete from Drive"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFileToDelete(null)}
        isDarkMode={isDarkMode}
      />

      {/* Mandatory User Confirmation Dialog for Restoring & Overwriting Local Vault */}
      <ConfirmDestructiveDialog
        isOpen={!!fileToRestore}
        title="Restore Vault from Google Drive?"
        description={`Restoring "${fileToRestore?.name}" will overwrite your current local habit trackers, milestone timers, and expense ledger with the data from this backup. Do you want to proceed?`}
        confirmLabel="Overwrite & Restore"
        cancelLabel="Cancel"
        variant="warning"
        isLoading={isRestoring}
        onConfirm={handleConfirmRestore}
        onCancel={() => setFileToRestore(null)}
        isDarkMode={isDarkMode}
      />
    </>
  );
};
