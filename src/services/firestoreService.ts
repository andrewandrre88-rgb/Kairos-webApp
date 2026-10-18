import {
  doc,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Goal, ParentProfile, UserProfile } from '../types';

export const firestoreService = {
  // Subscribe to user profile
  subscribeUserProfile(
    userId: string,
    onData: (data: UserProfile | null) => void
  ): () => void {
    const path = `users/${userId}`;
    return onSnapshot(
      doc(db, 'users', userId),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          onData({
            name: d.name || 'Alex',
            birthDate: d.birthDate || '1997-03-22',
            targetLifespanYears: d.targetLifespanYears || 85,
          });
        } else {
          onData(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  // Save/Update user profile
  async saveUserProfile(userId: string, profile: UserProfile, email?: string | null): Promise<void> {
    const path = `users/${userId}`;
    try {
      await setDoc(
        doc(db, 'users', userId),
        {
          userId,
          name: profile.name,
          birthDate: profile.birthDate,
          targetLifespanYears: profile.targetLifespanYears,
          email: email || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Subscribe to user goals
  subscribeGoals(
    userId: string,
    onData: (goals: Goal[]) => void
  ): () => void {
    const path = `users/${userId}/goals`;
    return onSnapshot(
      collection(db, 'users', userId, 'goals'),
      (snap) => {
        const list: Goal[] = [];
        snap.forEach((d) => {
          const item = d.data();
          list.push({
            id: d.id,
            title: item.title,
            description: item.description || '',
            category: item.category || 'Career',
            priority: item.priority || 'medium',
            startDate: item.startDate || new Date().toISOString(),
            targetDate: item.targetDate || new Date().toISOString(),
            isCompleted: item.isCompleted || false,
            completedAt: item.completedAt || null,
            isPinned: item.isPinned || false,
            milestones: item.milestones || [],
            notes: item.notes || '',
          });
        });
        // Sort by pinned then targetDate
        list.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        });
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // Add / set goal
  async saveGoal(userId: string, goal: Goal): Promise<void> {
    const path = `users/${userId}/goals/${goal.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'goals', goal.id), {
        ...goal,
        userId,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Delete goal
  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const path = `users/${userId}/goals/${goalId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'goals', goalId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Subscribe to user parents
  subscribeParents(
    userId: string,
    onData: (parents: ParentProfile[]) => void
  ): () => void {
    const path = `users/${userId}/parents`;
    return onSnapshot(
      collection(db, 'users', userId, 'parents'),
      (snap) => {
        const list: ParentProfile[] = [];
        snap.forEach((d) => {
          const item = d.data();
          list.push({
            id: d.id,
            name: item.name,
            relationship: item.relationship || 'mother',
            birthDate: item.birthDate,
            lifeExpectancyYears: item.lifeExpectancyYears || 82,
            visitsPerYear: item.visitsPerYear || 3,
            avgDaysPerVisit: item.avgDaysPerVisit || 4,
            callsPerMonth: item.callsPerMonth || 4,
            nextScheduledVisit: item.nextScheduledVisit || null,
            nextScheduledCall: item.nextScheduledCall || null,
            location: item.location || '',
            cherishMoments: item.cherishMoments || [],
            visitLogs: item.visitLogs || [],
          });
        });
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // Add / set parent
  async saveParent(userId: string, parent: ParentProfile): Promise<void> {
    const path = `users/${userId}/parents/${parent.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'parents', parent.id), {
        ...parent,
        userId,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Delete parent
  async deleteParent(userId: string, parentId: string): Promise<void> {
    const path = `users/${userId}/parents/${parentId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'parents', parentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Seed default data for new user if collections are empty
  async seedInitialUserDataIfEmpty(
    userId: string,
    defaultUser: UserProfile,
    defaultParents: ParentProfile[],
    defaultGoals: Goal[],
    email?: string | null
  ): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      // First time user, save user profile
      await this.saveUserProfile(userId, defaultUser, email);

      // Seed parents
      for (const p of defaultParents) {
        await this.saveParent(userId, p);
      }

      // Seed goals
      for (const g of defaultGoals) {
        await this.saveGoal(userId, g);
      }
    }
  },

  // Full synchronization: push all local goals, parents, and profile into user's Firestore
  async syncAllDataToFirestore(
    userId: string,
    userProfile: UserProfile,
    parentsList: ParentProfile[],
    goalsList: Goal[],
    email?: string | null
  ): Promise<{ goalsCount: number; parentsCount: number }> {
    // 1. Sync User Profile
    await this.saveUserProfile(userId, userProfile, email);

    // 2. Sync Parents
    for (const parent of parentsList) {
      await this.saveParent(userId, parent);
    }

    // 3. Sync Goals
    for (const goal of goalsList) {
      await this.saveGoal(userId, goal);
    }

    return {
      goalsCount: goalsList.length,
      parentsCount: parentsList.length,
    };
  },
};
