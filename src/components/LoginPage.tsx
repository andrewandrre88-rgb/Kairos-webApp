import React, { useState } from 'react';
import { Clock, Heart, Calendar, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

interface LoginPageProps {
  onGuestContinue?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onGuestContinue }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Unable to complete Google Sign-In. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-amber-400/20 selection:text-amber-200">
      {/* Top minimal brand */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-amber-400" />
          <span className="text-xl font-bold tracking-tight text-stone-100">Kairos</span>
          <span className="text-xs text-stone-500 border-l border-stone-800 pl-2.5 hidden sm:inline">
            Time, Goals & The Tail End
          </span>
        </div>
        {onGuestContinue && (
          <button
            onClick={onGuestContinue}
            className="text-xs text-stone-400 hover:text-stone-200 underline cursor-pointer"
          >
            Continue as Guest
          </button>
        )}
      </header>

      {/* Main hero & auth center */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Atmospheric storytelling */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conscious Living & Finite Time</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight text-balance">
              Measure the moments that cannot be repeated.
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Keep live countdown clocks on your highest life goals, visualize your 4,420 finite weeks on Earth, and calculate the precious remaining in-person visits with your parents.
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-stone-900/80 border border-stone-800 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Live Deadlines</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Precision countdowns for goals & milestones.
                </p>
              </div>

              <div className="p-3.5 bg-stone-900/80 border border-stone-800 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                  <Heart className="w-3.5 h-3.5" />
                  <span>The Tail End</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Estimated visits & in-person days left with parents.
                </p>
              </div>

              <div className="p-3.5 bg-stone-900/80 border border-stone-800 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Life in Weeks</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Memento Mori calendar with overlap horizon.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Authentication Card */}
          <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-stone-100">Welcome to Kairos</h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                Sign in with your Google account to sync and protect your personal horizons, goals, and family memories in Firebase Firestore.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Google Sign-in button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-stone-100 text-stone-900 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition-all duration-150 disabled:opacity-60 cursor-pointer"
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25A11.95 11.95 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            {/* Privacy note */}
            <div className="pt-4 border-t border-stone-800 flex items-start gap-2.5 text-stone-500 text-[11px] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Encrypted in private Cloud Firestore. Only your authenticated Google account has read or write access to your timeline data.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs text-stone-600 border-t border-stone-900">
        Kairos · Built with Firebase Firestore & Authentication · {new Date().getFullYear()}
      </footer>
    </div>
  );
};
