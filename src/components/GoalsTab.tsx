import React, { useState } from 'react';
import { Plus, Pin, CheckCircle2, Circle, Clock, Trash2, Edit3, Filter, CheckCircle, AlertTriangle } from 'lucide-react';
import { Goal, GoalCategory } from '../types';
import { CountdownDisplay } from './CountdownDisplay';

interface GoalsTabProps {
  goals: Goal[];
  onOpenNewGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onToggleGoalComplete: (goalId: string) => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onTogglePin: (goalId: string) => void;
}

const CATEGORIES: (GoalCategory | 'All')[] = [
  'All',
  'Career',
  'Health & Vitality',
  'Family & Roots',
  'Creative & Craft',
  'Financial Freedom',
  'Adventure & Travel',
  'Mind & Spirit',
];

export const GoalsTab: React.FC<GoalsTabProps> = ({
  goals,
  onOpenNewGoal,
  onEditGoal,
  onDeleteGoal,
  onToggleGoalComplete,
  onToggleMilestone,
  onTogglePin,
}) => {
  const [statusFilter, setStatusFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [categoryFilter, setCategoryFilter] = useState<GoalCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date();

  // Filtered goals
  const filteredGoals = goals.filter((goal) => {
    // Status filter
    if (statusFilter === 'active' && goal.isCompleted) return false;
    if (statusFilter === 'completed' && !goal.isCompleted) return false;

    // Category filter
    if (categoryFilter !== 'All' && goal.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = goal.title.toLowerCase().includes(q);
      const matchDesc = goal.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  }).sort((a, b) => {
    // Pinned first
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    // Target date closest first
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Goals & Deadlines</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Finite time allocations with high-precision countdown clocks.
          </p>
        </div>

        <button
          onClick={onOpenNewGoal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all duration-150 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal Deadline</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-lg border border-stone-800">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Active ({goals.filter((g) => !g.isCompleted).length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Completed ({goals.filter((g) => g.isCompleted).length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              All ({goals.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search goals or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-400/70"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-stone-400">
          <span className="shrink-0 flex items-center gap-1 text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer text-xs ${
                categoryFilter === cat
                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30 font-medium'
                  : 'hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-800 rounded-xl bg-stone-900/30">
          <Clock className="w-10 h-10 text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-stone-200">No goals found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search criteria or filters.'
              : 'Add your first deadline to begin tracking your finite time allocation.'}
          </p>
          <button
            onClick={onOpenNewGoal}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 cursor-pointer"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGoals.map((goal) => {
            const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;
            const totalMilestones = goal.milestones.length;
            const progressPercent = totalMilestones > 0
              ? Math.round((completedMilestones / totalMilestones) * 100)
              : goal.isCompleted ? 100 : 0;

            const targetDate = new Date(goal.targetDate);
            const isOverdue = !goal.isCompleted && targetDate < now;
            const daysLeft = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const isApproaching = !goal.isCompleted && daysLeft > 0 && daysLeft <= 14;

            // Total planned duration in days
            const startDate = new Date(goal.startDate);
            const totalDurationDays = Math.max(1, Math.round((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
            const daysElapsed = Math.max(0, Math.round((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
            const timeElapsedPercent = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDurationDays) * 100)));

            return (
              <div
                key={goal.id}
                className={`bg-stone-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                  goal.isCompleted
                    ? 'border-stone-800/60 opacity-80'
                    : goal.isPinned
                    ? 'border-amber-500/40 shadow-sm'
                    : 'border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="space-y-4">
                  {/* Top metadata row */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="font-medium text-stone-300">{goal.category}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-mono-numbers uppercase text-[11px] font-medium ${
                          goal.priority === 'high'
                            ? 'text-rose-400'
                            : goal.priority === 'medium'
                            ? 'text-amber-400'
                            : 'text-stone-400'
                        }`}
                      >
                        {goal.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onTogglePin(goal.id)}
                        title={goal.isPinned ? 'Unpin goal' : 'Pin to top'}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          goal.isPinned
                            ? 'text-amber-400 bg-amber-400/10'
                            : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditGoal(goal)}
                        title="Edit goal"
                        className="p-1.5 text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        title="Delete goal"
                        className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      className={`text-lg font-semibold tracking-tight ${
                        goal.isCompleted ? 'text-stone-400 line-through' : 'text-stone-100'
                      }`}
                    >
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Countdown Block */}
                  <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-lg">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5">
                      <span className="uppercase tracking-wider">Countdown to Deadline</span>
                      {isOverdue ? (
                        <span className="flex items-center gap-1 text-rose-400 font-medium">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      ) : isApproaching ? (
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <Clock className="w-3 h-3" /> Less than 14 days
                        </span>
                      ) : (
                        <span className="text-stone-500">
                          Due: {targetDate.toLocaleDateString()} {targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {goal.isCompleted ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        <span>Completed on {goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : 'Target accomplished'}</span>
                      </div>
                    ) : (
                      <CountdownDisplay targetDateIso={goal.targetDate} variant="card" />
                    )}
                  </div>

                  {/* Velocity: Time vs Milestone Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono-numbers">
                      <span>Milestones: {progressPercent}% done</span>
                      <span>Time elapsed: {timeElapsedPercent}% ({daysElapsed}/{totalDurationDays}d)</span>
                    </div>
                    <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden flex border border-stone-800">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  {totalMilestones > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] uppercase tracking-wide text-stone-500 font-medium">
                        Milestones ({completedMilestones}/{totalMilestones})
                      </div>
                      <div className="space-y-1">
                        {goal.milestones.map((milestone) => (
                          <button
                            key={milestone.id}
                            onClick={() => onToggleMilestone(goal.id, milestone.id)}
                            className="w-full flex items-center gap-2 text-left text-xs py-1.5 px-2 rounded hover:bg-stone-800/70 transition-colors cursor-pointer group"
                          >
                            {milestone.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-stone-600 group-hover:text-stone-400 shrink-0" />
                            )}
                            <span
                              className={`truncate ${
                                milestone.isCompleted ? 'line-through text-stone-500' : 'text-stone-300'
                              }`}
                            >
                              {milestone.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personal notes if available */}
                  {goal.notes && (
                    <div className="text-xs text-stone-500 italic bg-stone-950/40 p-2 rounded border border-stone-800/40">
                      "{goal.notes}"
                    </div>
                  )}
                </div>

                {/* Bottom action row */}
                <div className="pt-4 mt-4 border-t border-stone-800 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    Started {new Date(goal.startDate).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => onToggleGoalComplete(goal.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      goal.isCompleted
                        ? 'text-stone-400 bg-stone-800 hover:bg-stone-700'
                        : 'text-stone-100 bg-stone-800 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{goal.isCompleted ? 'Mark Active' : 'Mark Completed'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
