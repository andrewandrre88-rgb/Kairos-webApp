import React from 'react';
import { Plus, SlidersHorizontal, Clock, LogOut, LogIn } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'overview' | 'goals' | 'parents' | 'calendar';
  setActiveTab: (tab: 'overview' | 'goals' | 'parents' | 'calendar') => void;
  onOpenNewGoal: () => void;
  onOpenSettings: () => void;
  currentDateFormatted: string;
  currentUser: FirebaseUser | null;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewGoal,
  onOpenSettings,
  currentDateFormatted,
  currentUser,
  onLogout,
  onOpenLogin,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
                <span className="text-xl font-bold tracking-tight text-stone-100 whitespace-nowrap">
                  Kairos
                </span>
              </div>
            </button>
            <span className="hidden lg:inline text-xs text-stone-500 font-mono-numbers pl-2 border-l border-stone-800 whitespace-nowrap">
              {currentDateFormatted}
            </span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="flex items-center gap-1 sm:gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'goals'
                  ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Goals & Deadlines
            </button>
            <button
              onClick={() => setActiveTab('parents')}
              className={`px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'parents'
                  ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Parents & Time Left
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Life Calendar
            </button>
          </nav>

          {/* Zone 3: Primary action + user account */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenSettings}
              title="Personal Horizon & Backup Settings"
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-900 rounded-lg transition-colors cursor-pointer"
              aria-label="Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewGoal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-stone-700 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold flex items-center justify-center border border-amber-400/30">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={onLogout}
                  title={`Sign out (${currentUser.email})`}
                  className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-900 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
