/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { GoalsTab } from './components/GoalsTab';
import { ParentsTab } from './components/ParentsTab';
import { LifeCalendarTab } from './components/LifeCalendarTab';
import { LoginPage } from './components/LoginPage';
import { GoalModal } from './components/GoalModal';
import { ParentModal } from './components/ParentModal';
import { ScheduleVisitModal } from './components/ScheduleVisitModal';
import { LogVisitModal } from './components/LogVisitModal';
import { SettingsModal } from './components/SettingsModal';
import { DateDetailsModal } from './components/DateDetailsModal';
import { Goal, ParentProfile, UserProfile, VisitLog } from './types';
import { INITIAL_GOALS, INITIAL_PARENTS, INITIAL_USER } from './utils/initialData';
import { getYearProgress } from './utils/timeCalculations';
import { auth, onAuthStateChanged, logOut, testConnection, User } from './firebase';
import { firestoreService } from './services/firestoreService';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Persistence state
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [parents, setParents] = useState<ParentProfile[]>(INITIAL_PARENTS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'parents' | 'calendar'>('overview');

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentProfile | null>(null);

  const [isScheduleVisitModalOpen, setIsScheduleVisitModalOpen] = useState(false);
  const [scheduleVisitParentId, setScheduleVisitParentId] = useState<string | null>(null);

  const [isLogVisitModalOpen, setIsLogVisitModalOpen] = useState(false);
  const [logVisitParentId, setLogVisitParentId] = useState<string | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [isDateDetailsModalOpen, setIsDateDetailsModalOpen] = useState(false);

  // Time progress
  const yearProgress = getYearProgress();

  // Test connection on startup
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fireUser) => {
      setCurrentUser(fireUser);
      setAuthLoading(false);

      if (fireUser) {
        setIsGuestMode(false);
        // Seamlessly migrate any existing local goals, parents, and horizon settings
        let currentLocalGoals = INITIAL_GOALS;
        let currentLocalParents = INITIAL_PARENTS;
        let currentLocalUser = INITIAL_USER;
        try {
          const savedGoals = localStorage.getItem('kairos_goals');
          if (savedGoals) {
            const parsed = JSON.parse(savedGoals);
            if (Array.isArray(parsed) && parsed.length > 0) currentLocalGoals = parsed;
          }
          const savedParents = localStorage.getItem('kairos_parents');
          if (savedParents) {
            const parsed = JSON.parse(savedParents);
            if (Array.isArray(parsed) && parsed.length > 0) currentLocalParents = parsed;
          }
          const savedUser = localStorage.getItem('kairos_user');
          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            if (parsed && parsed.birthDate) currentLocalUser = parsed;
          }
        } catch {}

        const seedUser: UserProfile = {
          ...currentLocalUser,
          name: fireUser.displayName || currentLocalUser.name || fireUser.email?.split('@')[0] || 'Alex',
        };

        await firestoreService.seedInitialUserDataIfEmpty(
          fireUser.uid,
          seedUser,
          currentLocalParents,
          currentLocalGoals,
          fireUser.email
        );
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore subscriptions when authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubProfile = firestoreService.subscribeUserProfile(currentUser.uid, (profile) => {
      if (profile) setUser(profile);
    });

    const unsubGoals = firestoreService.subscribeGoals(currentUser.uid, (fetchedGoals) => {
      setGoals(fetchedGoals);
    });

    const unsubParents = firestoreService.subscribeParents(currentUser.uid, (fetchedParents) => {
      setParents(fetchedParents);
    });

    return () => {
      unsubProfile();
      unsubGoals();
      unsubParents();
    };
  }, [currentUser]);

  // Fallback to localStorage if guest
  useEffect(() => {
    if (!currentUser && isGuestMode) {
      try {
        const savedUser = localStorage.getItem('kairos_user');
        if (savedUser) setUser(JSON.parse(savedUser));
        const savedGoals = localStorage.getItem('kairos_goals');
        if (savedGoals) setGoals(JSON.parse(savedGoals));
        const savedParents = localStorage.getItem('kairos_parents');
        if (savedParents) setParents(JSON.parse(savedParents));
      } catch (e) {
        console.error('Error loading guest data:', e);
      }
    }
  }, [currentUser, isGuestMode]);

  // Goal actions
  const handleSaveGoal = async (goalData: Partial<Goal>) => {
    if (editingGoal) {
      const updated: Goal = { ...editingGoal, ...goalData } as Goal;
      if (currentUser) {
        await firestoreService.saveGoal(currentUser.uid, updated);
      } else {
        setGoals((prev) => prev.map((g) => (g.id === editingGoal.id ? updated : g)));
      }
    } else {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        title: goalData.title || 'New Goal',
        description: goalData.description || '',
        category: goalData.category || 'Career',
        priority: goalData.priority || 'medium',
        startDate: new Date().toISOString(),
        targetDate: goalData.targetDate || new Date(Date.now() + 90 * 86400000).toISOString(),
        isCompleted: false,
        completedAt: null,
        isPinned: goalData.isPinned ?? false,
        milestones: goalData.milestones || [],
        notes: goalData.notes || '',
      };
      if (currentUser) {
        await firestoreService.saveGoal(currentUser.uid, newGoal);
      } else {
        setGoals((prev) => [newGoal, ...prev]);
      }
    }
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Delete this goal and its countdown?')) {
      if (currentUser) {
        await firestoreService.deleteGoal(currentUser.uid, goalId);
      } else {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
      }
    }
  };

  const handleToggleGoalComplete = async (goalId: string) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;
    const nextCompleted = !target.isCompleted;
    const updated: Goal = {
      ...target,
      isCompleted: nextCompleted,
      completedAt: nextCompleted ? new Date().toISOString() : null,
    };
    if (currentUser) {
      await firestoreService.saveGoal(currentUser.uid, updated);
    } else {
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;
    const updatedMilestones = target.milestones.map((m) =>
      m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
    );
    const updated: Goal = { ...target, milestones: updatedMilestones };
    if (currentUser) {
      await firestoreService.saveGoal(currentUser.uid, updated);
    } else {
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    }
  };

  const handleTogglePin = async (goalId: string) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;
    const updated: Goal = { ...target, isPinned: !target.isPinned };
    if (currentUser) {
      await firestoreService.saveGoal(currentUser.uid, updated);
    } else {
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    }
  };

  // Parent actions
  const handleSaveParent = async (parentData: Partial<ParentProfile>) => {
    if (editingParent) {
      const updated: ParentProfile = { ...editingParent, ...parentData } as ParentProfile;
      if (currentUser) {
        await firestoreService.saveParent(currentUser.uid, updated);
      } else {
        setParents((prev) => prev.map((p) => (p.id === editingParent.id ? updated : p)));
      }
    } else {
      const newParent: ParentProfile = {
        id: `parent-${Date.now()}`,
        name: parentData.name || 'Parent',
        relationship: parentData.relationship || 'mother',
        birthDate: parentData.birthDate || '1965-01-01',
        lifeExpectancyYears: parentData.lifeExpectancyYears || 82,
        visitsPerYear: parentData.visitsPerYear || 3,
        avgDaysPerVisit: parentData.avgDaysPerVisit || 4,
        callsPerMonth: parentData.callsPerMonth || 4,
        nextScheduledVisit: null,
        nextScheduledCall: null,
        location: parentData.location || '',
        cherishMoments: [
          {
            id: `cm-${Date.now()}-1`,
            title: 'Record audio interview of their childhood story',
            category: 'conversation',
            completed: false,
          },
          {
            id: `cm-${Date.now()}-2`,
            title: 'Cook a traditional family meal together',
            category: 'activity',
            completed: false,
          },
        ],
        visitLogs: [],
      };
      if (currentUser) {
        await firestoreService.saveParent(currentUser.uid, newParent);
      } else {
        setParents((prev) => [...prev, newParent]);
      }
    }
    setEditingParent(null);
  };

  const handleSaveSchedule = async (
    parentId: string,
    visitIso: string | null,
    callIso: string | null
  ) => {
    const target = parents.find((p) => p.id === parentId);
    if (!target) return;
    const updated: ParentProfile = {
      ...target,
      nextScheduledVisit: visitIso,
      nextScheduledCall: callIso,
    };
    if (currentUser) {
      await firestoreService.saveParent(currentUser.uid, updated);
    } else {
      setParents((prev) => prev.map((p) => (p.id === parentId ? updated : p)));
    }
  };

  const handleSaveLog = async (parentId: string, log: Omit<VisitLog, 'id'>) => {
    const target = parents.find((p) => p.id === parentId);
    if (!target) return;
    const newLog: VisitLog = { ...log, id: `vl-${Date.now()}` };
    const updated: ParentProfile = {
      ...target,
      visitLogs: [newLog, ...target.visitLogs],
    };
    if (currentUser) {
      await firestoreService.saveParent(currentUser.uid, updated);
    } else {
      setParents((prev) => prev.map((p) => (p.id === parentId ? updated : p)));
    }
  };

  const handleToggleCherishMoment = async (parentId: string, momentId: string) => {
    const target = parents.find((p) => p.id === parentId);
    if (!target) return;
    const updatedMoments = target.cherishMoments.map((cm) => {
      if (cm.id === momentId) {
        const nextState = !cm.completed;
        return {
          ...cm,
          completed: nextState,
          completedDate: nextState ? new Date().toISOString() : undefined,
        };
      }
      return cm;
    });
    const updated: ParentProfile = { ...target, cherishMoments: updatedMoments };
    if (currentUser) {
      await firestoreService.saveParent(currentUser.uid, updated);
    } else {
      setParents((prev) => prev.map((p) => (p.id === parentId ? updated : p)));
    }
  };

  const handleAddCherishMoment = async (
    parentId: string,
    title: string,
    category: 'conversation' | 'activity' | 'memory' | 'milestone'
  ) => {
    const target = parents.find((p) => p.id === parentId);
    if (!target) return;
    const updated: ParentProfile = {
      ...target,
      cherishMoments: [
        ...target.cherishMoments,
        {
          id: `cm-${Date.now()}`,
          title,
          category,
          completed: false,
        },
      ],
    };
    if (currentUser) {
      await firestoreService.saveParent(currentUser.uid, updated);
    } else {
      setParents((prev) => prev.map((p) => (p.id === parentId ? updated : p)));
    }
  };

  const handleSaveUser = async (updatedUser: UserProfile) => {
    setUser(updatedUser);
    if (currentUser) {
      await firestoreService.saveUserProfile(currentUser.uid, updatedUser, currentUser.email);
    } else {
      localStorage.setItem('kairos_user', JSON.stringify(updatedUser));
    }
  };

  // Export & Import backup
  const handleExportData = () => {
    const backup = {
      user,
      parents,
      goals,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kairos-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.user) {
        setUser(parsed.user);
        if (currentUser) firestoreService.saveUserProfile(currentUser.uid, parsed.user, currentUser.email);
      }
      if (parsed.parents && Array.isArray(parsed.parents)) {
        setParents(parsed.parents);
        if (currentUser) {
          for (const p of parsed.parents) {
            firestoreService.saveParent(currentUser.uid, p);
          }
        }
      }
      if (parsed.goals && Array.isArray(parsed.goals)) {
        setGoals(parsed.goals);
        if (currentUser) {
          for (const g of parsed.goals) {
            firestoreService.saveGoal(currentUser.uid, g);
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleResetData = () => {
    setUser(INITIAL_USER);
    setParents(INITIAL_PARENTS);
    setGoals(INITIAL_GOALS);
    if (currentUser) {
      firestoreService.seedInitialUserDataIfEmpty(
        currentUser.uid,
        INITIAL_USER,
        INITIAL_PARENTS,
        INITIAL_GOALS,
        currentUser.email
      );
    }
  };

  const handleLogout = async () => {
    await logOut();
    setIsGuestMode(false);
  };

  const handleSyncAllToCloud = async () => {
    if (!currentUser) return;
    await firestoreService.syncAllDataToFirestore(
      currentUser.uid,
      user,
      parents,
      goals,
      currentUser.email
    );
  };

  // If loading auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs text-stone-400 font-mono-numbers">Connecting to Kairos...</div>
        </div>
      </div>
    );
  }

  // Show login page if not signed in and not guest
  if (!currentUser && !isGuestMode) {
    return <LoginPage onGuestContinue={() => setIsGuestMode(true)} />;
  }

  // Target parent for visit/log modal
  const scheduleParent = parents.find((p) => p.id === scheduleVisitParentId) || parents[0] || null;
  const logParent = parents.find((p) => p.id === logVisitParentId) || parents[0] || null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-400/20 selection:text-amber-200">
      {/* 3-Zone Navbar with Auth state */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewGoal={() => {
          setEditingGoal(null);
          setIsGoalModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        currentDateFormatted={yearProgress.currentDateFormatted}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setIsGuestMode(false)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <OverviewTab
            goals={goals}
            parents={parents}
            user={user}
            onNavigateTab={setActiveTab}
            onToggleMilestone={handleToggleMilestone}
            onOpenNewGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onSelectParentForVisit={(parentId) => {
              setScheduleVisitParentId(parentId);
              setIsScheduleVisitModalOpen(true);
            }}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsTab
            goals={goals}
            onOpenNewGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onEditGoal={(goal) => {
              setEditingGoal(goal);
              setIsGoalModalOpen(true);
            }}
            onDeleteGoal={handleDeleteGoal}
            onToggleGoalComplete={handleToggleGoalComplete}
            onToggleMilestone={handleToggleMilestone}
            onTogglePin={handleTogglePin}
          />
        )}

        {activeTab === 'parents' && (
          <ParentsTab
            parents={parents}
            user={user}
            onEditParent={(parent) => {
              setEditingParent(parent);
              setIsParentModalOpen(true);
            }}
            onAddParent={() => {
              setEditingParent(null);
              setIsParentModalOpen(true);
            }}
            onScheduleVisit={(parentId) => {
              setScheduleVisitParentId(parentId);
              setIsScheduleVisitModalOpen(true);
            }}
            onLogVisit={(parentId) => {
              setLogVisitParentId(parentId);
              setIsLogVisitModalOpen(true);
            }}
            onToggleCherishMoment={handleToggleCherishMoment}
            onAddCherishMoment={handleAddCherishMoment}
          />
        )}

        {activeTab === 'calendar' && (
          <LifeCalendarTab
            goals={goals}
            parents={parents}
            user={user}
            onSelectDate={(dateStr) => {
              setSelectedCalendarDate(dateStr);
              setIsDateDetailsModalOpen(true);
            }}
            onOpenNewGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-400">Kairos</span>
            <span aria-hidden="true">·</span>
            <span>Awareness of finite time brings depth to every hour.</span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <span className="text-emerald-400 font-mono-numbers text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                <span>Firestore Synced ({currentUser.email})</span>
              </span>
            ) : (
              <button
                onClick={() => setIsGuestMode(false)}
                className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                Sign in with Google to sync
              </button>
            )}
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-stone-300 transition-colors cursor-pointer"
            >
              Adjust Horizon & Backup
            </button>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">Year 2026</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
      />

      <ParentModal
        isOpen={isParentModalOpen}
        onClose={() => {
          setIsParentModalOpen(false);
          setEditingParent(null);
        }}
        onSave={handleSaveParent}
        initialParent={editingParent}
      />

      <ScheduleVisitModal
        isOpen={isScheduleVisitModalOpen}
        onClose={() => {
          setIsScheduleVisitModalOpen(false);
          setScheduleVisitParentId(null);
        }}
        parent={scheduleParent}
        onSaveSchedule={handleSaveSchedule}
      />

      <LogVisitModal
        isOpen={isLogVisitModalOpen}
        onClose={() => {
          setIsLogVisitModalOpen(false);
          setLogVisitParentId(null);
        }}
        parent={logParent}
        onSaveLog={handleSaveLog}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        currentUser={currentUser}
        onSaveUser={handleSaveUser}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
        onSyncAllToCloud={handleSyncAllToCloud}
      />

      <DateDetailsModal
        isOpen={isDateDetailsModalOpen}
        onClose={() => {
          setIsDateDetailsModalOpen(false);
          setSelectedCalendarDate(null);
        }}
        selectedDate={selectedCalendarDate}
        goals={goals}
        parents={parents}
        onAddGoalForDate={(dateStr) => {
          setEditingGoal({
            id: `temp-${Date.now()}`,
            title: '',
            description: '',
            category: 'Career',
            priority: 'medium',
            startDate: new Date().toISOString(),
            targetDate: `${dateStr}T23:59:00.000Z`,
            isCompleted: false,
            completedAt: null,
            isPinned: false,
            milestones: [],
          });
          setIsGoalModalOpen(true);
        }}
        onScheduleVisitForDate={(parentId, dateStr) => {
          setScheduleVisitParentId(parentId);
          handleSaveSchedule(parentId, `${dateStr}T14:00:00.000Z`, null);
          setIsScheduleVisitModalOpen(true);
        }}
      />
    </div>
  );
}
