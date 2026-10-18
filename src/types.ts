export type GoalCategory = 
  | 'Career'
  | 'Health & Vitality'
  | 'Family & Roots'
  | 'Creative & Craft'
  | 'Financial Freedom'
  | 'Adventure & Travel'
  | 'Mind & Spirit';

export type GoalPriority = 'high' | 'medium' | 'low';

export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  startDate: string; // ISO
  targetDate: string; // ISO with time
  isCompleted: boolean;
  completedAt: string | null;
  isPinned: boolean;
  milestones: Milestone[];
  notes?: string;
}

export interface CherishMoment {
  id: string;
  title: string;
  category: 'conversation' | 'activity' | 'memory' | 'milestone';
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

export interface VisitLog {
  id: string;
  date: string;
  durationDays: number;
  notes: string;
  type: 'visit' | 'call';
}

export interface ParentProfile {
  id: string;
  name: string;
  relationship: 'mother' | 'father' | 'guardian' | 'grandparent' | 'other';
  birthDate: string; // YYYY-MM-DD
  lifeExpectancyYears: number; // e.g. 84
  visitsPerYear: number; // e.g. 3
  avgDaysPerVisit: number; // e.g. 4
  callsPerMonth: number; // e.g. 4
  nextScheduledVisit: string | null; // ISO datetime
  nextScheduledCall: string | null; // ISO datetime
  location: string;
  cherishMoments: CherishMoment[];
  visitLogs: VisitLog[];
}

export interface UserProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  targetLifespanYears: number; // e.g. 85
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'goal_deadline' | 'parent_visit' | 'parent_call' | 'birthday' | 'custom_milestone';
  color?: string;
  description?: string;
}
