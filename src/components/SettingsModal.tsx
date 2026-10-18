import React, { useState, useRef } from 'react';
import { X, User, Download, Upload, RotateCcw, ShieldCheck, Check, Cloud, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  currentUser: FirebaseUser | null;
  onSaveUser: (updatedUser: UserProfile) => void;
  onExportData: () => void;
  onImportData: (importedJson: string) => boolean;
  onResetData: () => void;
  onSyncAllToCloud: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUser,
  onSaveUser,
  onExportData,
  onImportData,
  onResetData,
  onSyncAllToCloud,
}) => {
  const [name, setName] = useState(user.name);
  const [birthDate, setBirthDate] = useState(user.birthDate);
  const [targetLifespanYears, setTargetLifespanYears] = useState(user.targetLifespanYears);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUser({
      name: name.trim() || 'Alex',
      birthDate,
      targetLifespanYears: Number(targetLifespanYears) || 85,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = onImportData(content);
      if (ok) {
        setImportStatus('Data successfully imported!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>Personal Horizon & Data Settings</span>
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {/* User profile parameters */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Your Life Parameters
            </div>

            <div className="space-y-1">
              <label className="text-stone-400">Your Preferred Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-stone-300">Your Date of Birth</label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono-numbers focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Target Lifespan Horizon (Years)</label>
                <input
                  type="number"
                  min="50"
                  max="120"
                  required
                  value={targetLifespanYears}
                  onChange={(e) => setTargetLifespanYears(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono-numbers focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 font-semibold bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Update Profile Horizon</span>
                )}
              </button>
            </div>
          </form>

          {/* Cloud Account Synchronization */}
          <div className="pt-4 border-t border-stone-800 space-y-3">
            <div className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-amber-400" />
                <span>Google Account & Firestore Sync</span>
              </div>
              {currentUser && (
                <span className="text-[11px] font-mono-numbers text-emerald-400 flex items-center gap-1 normal-case">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-stone-300">
                  <div>
                    <div className="font-semibold">{currentUser.displayName || 'Google Account'}</div>
                    <div className="text-[11px] text-stone-400 font-mono-numbers">{currentUser.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setImportStatus('Syncing all data with your Google Firestore database...');
                      await onSyncAllToCloud();
                      setImportStatus('✅ All data is synced to your Google account in Firestore!');
                      setTimeout(() => setImportStatus(null), 4000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync All Data Now</span>
                  </button>
                </div>
                <div className="text-[11px] text-stone-500">
                  Every goal, parent visit countdown, and life milestone is automatically backed up to your dedicated Firestore database.
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-400">
                You are currently in guest mode. Sign in with your Google account to sync your data across devices.
              </div>
            )}
          </div>

          {/* Backup & Data Privacy */}
          <div className="pt-4 border-t border-stone-800 space-y-3">
            <div className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Data Persistence & Backup</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Your deeply personal goals, family reflections, and timelines are saved locally on your device. You can download an encrypted backup anytime or restore on another machine.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onExportData}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Data (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-stone-400" />
                <span>Import Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all goals and parent data to initial sample? This will replace current items.')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1 px-3 py-2 text-stone-500 hover:text-stone-300 hover:bg-stone-950 rounded-lg transition-colors cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Seed Data</span>
              </button>
            </div>

            {importStatus && (
              <div className="p-2 rounded bg-stone-950 border border-amber-400/30 text-amber-300 text-[11px]">
                {importStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
