import React from 'react';
import { ArrowRight, Calendar, Heart, Sparkles, CheckCircle2, Circle, AlertCircle, Compass } from 'lucide-react';
import { Goal, ParentProfile, UserProfile } from '../types';
import { CountdownDisplay } from './CountdownDisplay';
import { calculateParentTimeInsights, getLifeWeeks, getYearProgress } from '../utils/timeCalculations';

interface OverviewTabProps {
  goals: Goal[];
  parents: ParentProfile[];
  user: UserProfile;
  onNavigateTab: (tab: 'overview' | 'goals' | 'parents' | 'calendar') => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onOpenNewGoal: () => void;
  onSelectParentForVisit: (parentId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  goals,
  parents,
  user,
  onNavigateTab,
  onToggleMilestone,
  onOpenNewGoal,
  onSelectParentForVisit,
}) => {
  const now = new Date();
  const yearProgress = getYearProgress(now);
  const lifeWeeks = getLifeWeeks(user, now);

  // Find nearest parent visit
  const upcomingVisits = parents
    .filter(p => p.nextScheduledVisit && new Date(p.nextScheduledVisit) > now)
    .sort((a, b) => new Date(a.nextScheduledVisit!).getTime() - new Date(b.nextScheduledVisit!).getTime());
  
  const nextVisitParent = upcomingVisits[0];

  // Active pinned goals
  const activePinnedGoals = goals
    .filter(g => !g.isCompleted && g.isPinned)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

  // Parent insights summary
  const parentInsights = parents.map(p => ({
    parent: p,
    insights: calculateParentTimeInsights(p, user, now),
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Visual Section */}
      <section className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-xl">
        <div className="relative aspect-21/9 min-h-[300px] sm:min-h-[340px] w-full">
          <img
            src="/src/assets/images/hero_time_perspective_1792331746480.jpg"
            alt="Warm golden light casting over an heirloom clock and life journal"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.45] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
          
          <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-end h-full max-w-4xl">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-medium mb-3">
              <span>{yearProgress.currentDateFormatted}</span>
              <span aria-hidden="true">·</span>
              <span>Day {yearProgress.dayOfYear} of {yearProgress.totalDaysInYear}</span>
              <span aria-hidden="true">·</span>
              <span>{yearProgress.daysRemaining} days remaining in {yearProgress.year}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3 text-balance">
              Awareness turns fleeting time into intentional life.
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Track your commitments against honest deadlines, visualize your finite weeks, and stay conscious of every remaining moment with those who gave you life.
            </p>
          </div>
        </div>

        {/* 3-Part Metric Horizon Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-800 bg-stone-900/90 border-t border-stone-800">
          {/* Year 2026 Elapsed */}
          <div className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Year {yearProgress.year} Elapsed</span>
              <span className="font-mono-numbers text-stone-200">{yearProgress.percentElapsed}%</span>
            </div>
            <div className="text-2xl font-bold text-stone-100 font-mono-numbers">
              {yearProgress.daysRemaining} <span className="text-xs font-normal text-stone-400">days left in {yearProgress.year}</span>
            </div>
            <div className="w-full bg-stone-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${yearProgress.percentElapsed}%` }}
              />
            </div>
          </div>

          {/* Life Weeks Lived */}
          <div className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Life Horizon (target {user.targetLifespanYears}y)</span>
              <span className="font-mono-numbers text-stone-200">{lifeWeeks.percentLived}% lived</span>
            </div>
            <div className="text-2xl font-bold text-stone-100 font-mono-numbers">
              {lifeWeeks.weeksRemaining.toLocaleString()} <span className="text-xs font-normal text-stone-400">weeks ahead</span>
            </div>
            <div className="w-full bg-stone-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${lifeWeeks.percentLived}%` }}
              />
            </div>
          </div>

          {/* Parents Presence Metric */}
          <div className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Parents Lifetime In-Person Time</span>
              <span className="font-mono-numbers text-stone-200">
                ~{parentInsights[0]?.insights.percentInPersonSpent ?? 91}% lived
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-300 font-mono-numbers">
              {parentInsights[0]?.insights.remainingVisits ?? 42} <span className="text-xs font-normal text-stone-400">estimated visits left</span>
            </div>
            <div className="w-full bg-stone-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-rose-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${parentInsights[0]?.insights.percentInPersonSpent ?? 91}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Parents Time Feature Card */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold tracking-wide uppercase">
              <Heart className="w-4 h-4 fill-rose-500/20 text-rose-400" />
              <span>The Tail End · Parents In-Person Time</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-100">
              {nextVisitParent?.nextScheduledVisit ? (
                <>Next In-Person Visit with {nextVisitParent.name}</>
              ) : (
                <>Preserve Every Opportunity With Your Parents</>
              )}
            </h2>
            <p className="text-sm text-stone-400 leading-relaxed">
              By age 18, most people have already spent 90% of all in-person time they will ever share with their parents. The remaining visits are rare and priceless.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {parents.map((p) => {
                const insight = calculateParentTimeInsights(p, user, now);
                return (
                  <div key={p.id} className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-lg">
                    <div className="text-xs text-stone-400 truncate">{p.name}</div>
                    <div className="text-lg font-bold text-stone-200 font-mono-numbers mt-0.5">
                      {insight.remainingVisits}{' '}
                      <span className="text-xs font-normal text-stone-500">visits</span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono-numbers">
                      ~{insight.remainingInPersonDays} in-person days
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Visit Countdown or Schedule Button */}
          <div className="lg:border-l lg:border-stone-800 lg:pl-8 flex flex-col justify-center min-w-[320px]">
            {nextVisitParent?.nextScheduledVisit ? (
              <div className="space-y-4">
                <div className="text-xs text-stone-400">
                  Countdown to <span className="text-stone-200 font-medium">{nextVisitParent.name}</span> arrival:
                </div>
                <CountdownDisplay
                  targetDateIso={nextVisitParent.nextScheduledVisit}
                  variant="hero"
                />
                <button
                  onClick={() => onNavigateTab('parents')}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                >
                  <span>Open Parents & Memories Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center lg:text-left">
                <div className="text-xs text-stone-400">No scheduled upcoming visit set yet</div>
                <button
                  onClick={() => onSelectParentForVisit(parents[0]?.id || '')}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Next Visit Countdown</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pinned Priority Goals Countdown Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-100">Top Priority Goals</h2>
            <p className="text-xs text-stone-400">Active commitments with live deadline clocks</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('goals')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View all {goals.length} goals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {activePinnedGoals.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-stone-800 rounded-xl bg-stone-900/40">
            <Compass className="w-8 h-8 text-stone-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-stone-300">No pinned goals</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Pin your most crucial aspirations to keep their countdown front and center every day.
            </p>
            <button
              onClick={onOpenNewGoal}
              className="mt-4 px-3.5 py-1.5 text-xs font-medium bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 cursor-pointer"
            >
              Create Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activePinnedGoals.map((goal) => {
              const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
              const totalMilestones = goal.milestones.length;
              const progressPercent = totalMilestones > 0
                ? Math.round((completedMilestones / totalMilestones) * 100)
                : 0;

              return (
                <div
                  key={goal.id}
                  className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col justify-between hover:border-stone-700 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span>{goal.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-numbers text-amber-300 font-medium uppercase tracking-wider text-[11px]">
                        {goal.priority} Priority
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-stone-100 line-clamp-2">
                      {goal.title}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>

                    {/* Countdown */}
                    <div className="pt-2 pb-1 border-t border-stone-800/80">
                      <div className="text-[11px] text-stone-500 uppercase tracking-wider mb-1">
                        Time Remaining
                      </div>
                      <CountdownDisplay targetDateIso={goal.targetDate} variant="card" />
                    </div>

                    {/* Milestones list preview */}
                    {totalMilestones > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-[11px] text-stone-400">
                          <span>Milestones ({completedMilestones}/{totalMilestones})</span>
                          <span className="font-mono-numbers">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden mb-2">
                          <div
                            className="bg-amber-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {goal.milestones.map((milestone) => (
                            <button
                              key={milestone.id}
                              onClick={() => onToggleMilestone(goal.id, milestone.id)}
                              className="w-full flex items-center gap-2 text-left text-xs py-1 px-1.5 rounded hover:bg-stone-800/60 transition-colors cursor-pointer group"
                            >
                              {milestone.isCompleted ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-stone-600 group-hover:text-stone-400 shrink-0" />
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
                  </div>

                  <div className="pt-4 mt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
                    <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    <button
                      onClick={() => onNavigateTab('goals')}
                      className="text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      Manage →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Perspective / Stoic Reflection Card */}
      <section className="bg-stone-900/60 border border-stone-800 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <blockquote className="text-sm font-medium text-stone-200 italic">
            "It is not that we have a short time to live, but that we waste a lot of it. Life is long enough, and a sufficiently generous estimate has been given to us for the highest achievements, if it were all well invested."
          </blockquote>
          <div className="text-xs text-stone-500 font-mono-numbers">
            — Seneca, On the Shortness of Life (c. 49 AD)
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('calendar')}
          className="shrink-0 px-4 py-2 text-xs font-semibold text-stone-300 hover:text-stone-100 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          Explore Life Grid
        </button>
      </section>
    </div>
  );
};
