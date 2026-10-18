import React, { useState } from 'react';
import { Heart, Calendar, Phone, Plus, CheckCircle2, Circle, Clock, Edit2, MapPin, Sparkles, MessageCircle, BookOpen, UserPlus } from 'lucide-react';
import { ParentProfile, UserProfile } from '../types';
import { CountdownDisplay } from './CountdownDisplay';
import { calculateParentTimeInsights } from '../utils/timeCalculations';

interface ParentsTabProps {
  parents: ParentProfile[];
  user: UserProfile;
  onEditParent: (parent: ParentProfile) => void;
  onAddParent: () => void;
  onScheduleVisit: (parentId: string) => void;
  onLogVisit: (parentId: string) => void;
  onToggleCherishMoment: (parentId: string, momentId: string) => void;
  onAddCherishMoment: (parentId: string, title: string, category: 'conversation' | 'activity' | 'memory' | 'milestone') => void;
}

export const ParentsTab: React.FC<ParentsTabProps> = ({
  parents,
  user,
  onEditParent,
  onAddParent,
  onScheduleVisit,
  onLogVisit,
  onToggleCherishMoment,
  onAddCherishMoment,
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string>(parents[0]?.id || '');
  const [newMomentTitle, setNewMomentTitle] = useState('');
  const [newMomentCategory, setNewMomentCategory] = useState<'conversation' | 'activity' | 'memory' | 'milestone'>('conversation');
  const [showAddMoment, setShowAddMoment] = useState(false);

  const now = new Date();
  const currentParent = parents.find((p) => p.id === selectedParentId) || parents[0];

  if (!currentParent) {
    return (
      <div className="text-center py-16 border border-dashed border-stone-800 rounded-xl bg-stone-900/40">
        <Heart className="w-10 h-10 text-stone-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-stone-200">No parent profiles configured</h3>
        <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
          Add your mother, father, or beloved guardian to begin tracking remaining time, visits, and memories.
        </p>
        <button
          onClick={onAddParent}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 cursor-pointer"
        >
          Add Parent Profile
        </button>
      </div>
    );
  }

  const insight = calculateParentTimeInsights(currentParent, user, now);

  const handleAddMomentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMomentTitle.trim()) return;
    onAddCherishMoment(currentParent.id, newMomentTitle.trim(), newMomentCategory);
    setNewMomentTitle('');
    setShowAddMoment(false);
  };

  // Next birthday calculation
  const parentBirth = new Date(currentParent.birthDate);
  let nextBirthday = new Date(now.getFullYear(), parentBirth.getMonth(), parentBirth.getDate());
  if (nextBirthday < now) {
    nextBirthday = new Date(now.getFullYear() + 1, parentBirth.getMonth(), parentBirth.getDate());
  }
  const nextBirthdayIso = nextBirthday.toISOString();

  return (
    <div className="space-y-8 pb-16">
      {/* Editorial Header with Tender Photo */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-xl">
        <div className="relative aspect-21/9 min-h-[260px] sm:min-h-[300px] w-full">
          <img
            src="/src/assets/images/parent_cherish_moment_1792331746583.jpg"
            alt="Warm hands holding ceramic tea cups together at a family table"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.4] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />

          <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-end h-full max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-rose-300 font-semibold tracking-wider uppercase mb-2">
              <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-400" />
              <span>The Tail End · Finite Presence</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2">
              How Much Time Left With Your Parents?
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              When we graduate and move away, we transition from seeing our parents every day to just a handful of times per year. Chronologically they may have years left, but in in-person visits, it is a finite, precious number.
            </p>
          </div>
        </div>

        {/* Parent Switcher Strip */}
        <div className="flex items-center justify-between gap-4 p-4 bg-stone-900/90 border-t border-stone-800 overflow-x-auto">
          <div className="flex items-center gap-2">
            {parents.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedParentId(p.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedParentId === p.id
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'bg-stone-950 text-stone-300 hover:bg-stone-800 hover:text-stone-100 border border-stone-800'
                }`}
              >
                <span>{p.name}</span>
                <span className="font-mono-numbers opacity-80">({insight.parentAge}y)</span>
              </button>
            ))}

            <button
              onClick={onAddParent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors border border-stone-800/60 whitespace-nowrap cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Profile</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditParent(currentParent)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-stone-300 hover:text-stone-100 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Life Parameters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Focus: The Reality in Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Visits Left */}
        <div className="bg-stone-900 border border-amber-500/30 rounded-xl p-5 relative overflow-hidden">
          <div className="text-xs text-amber-300 font-medium uppercase tracking-wider mb-1">
            Visits Remaining
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-amber-200 font-mono-numbers">
            ~{insight.remainingVisits}
          </div>
          <p className="text-xs text-stone-400 mt-2">
            Based on {currentParent.visitsPerYear} visits/year across estimated {insight.remainingYears} remaining years.
          </p>
        </div>

        {/* Estimated Days Together Left */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <div className="text-xs text-rose-300 font-medium uppercase tracking-wider mb-1">
            In-Person Days Left
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-rose-200 font-mono-numbers">
            ~{insight.remainingInPersonDays} <span className="text-base font-normal text-stone-500">days</span>
          </div>
          <p className="text-xs text-stone-400 mt-2">
            Average {currentParent.avgDaysPerVisit} days per visit. That is less than one year of 24/7 presence combined.
          </p>
        </div>

        {/* Lifetime Presence Ratio */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <div className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">
            In-Person Time Lived
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-stone-100 font-mono-numbers">
            {insight.percentInPersonSpent}%
          </div>
          <div className="w-full bg-stone-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full"
              style={{ width: `${insight.percentInPersonSpent}%` }}
            />
          </div>
          <p className="text-xs text-stone-500 mt-2">
            ~{(100 - insight.percentInPersonSpent).toFixed(1)}% of your lifetime in-person time remains.
          </p>
        </div>

        {/* Phone Calls Remaining */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <div className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">
            Phone Calls Remaining
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-stone-100 font-mono-numbers">
            ~{insight.remainingCalls}
          </div>
          <p className="text-xs text-stone-400 mt-2">
            At {currentParent.callsPerMonth} calls/month. Pick up the phone; every conversation counts.
          </p>
        </div>
      </div>

      {/* Visual Tail End Representation */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-stone-100">
              The Lifetime Presence Horizon with {currentParent.name}
            </h2>
            <p className="text-xs text-stone-400">
              Visualizing past childhood in-person days vs remaining adult visits
            </p>
          </div>
          <div className="text-xs text-stone-400 font-mono-numbers">
            Past: ~{insight.pastInPersonDays.toLocaleString()} days · Ahead: ~{insight.remainingInPersonDays} days
          </div>
        </div>

        {/* Tail End Segmented Bar */}
        <div className="w-full h-8 rounded-lg overflow-hidden flex bg-stone-950 border border-stone-800">
          <div
            className="bg-stone-700 h-full flex items-center justify-center text-[11px] font-medium text-stone-300 font-mono-numbers transition-all duration-500"
            style={{ width: `${insight.percentInPersonSpent}%` }}
            title={`Past in-person days: ~${insight.pastInPersonDays} (${insight.percentInPersonSpent}%)`}
          >
            {insight.percentInPersonSpent > 25 && `Past In-Person (${insight.percentInPersonSpent}%)`}
          </div>
          <div
            className="bg-amber-400 h-full flex items-center justify-center text-[11px] font-bold text-stone-950 font-mono-numbers transition-all duration-500"
            style={{ width: `${100 - insight.percentInPersonSpent}%` }}
            title={`Remaining in-person days: ~${insight.remainingInPersonDays} (${(100 - insight.percentInPersonSpent).toFixed(1)}%)`}
          >
            {100 - insight.percentInPersonSpent > 6 && `${(100 - insight.percentInPersonSpent).toFixed(1)}%`}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-stone-700"></span>
            <span>Childhood & Earlier Adult Years (Lived)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-amber-400"></span>
            <span>Remaining Visits (Your Tail End)</span>
          </div>
        </div>
      </section>

      {/* Live Countdowns for Next Visit, Next Call, and Next Birthday */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Next Visit Countdown */}
        <div className="bg-stone-900 border border-amber-500/40 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Next In-Person Visit</span>
            </div>
            <button
              onClick={() => onScheduleVisit(currentParent.id)}
              className="text-xs text-stone-400 hover:text-amber-300 underline cursor-pointer"
            >
              Change Date
            </button>
          </div>

          {currentParent.nextScheduledVisit ? (
            <div className="space-y-3">
              <div className="text-xs text-stone-400">
                Scheduled for:{' '}
                <span className="text-stone-200 font-medium">
                  {new Date(currentParent.nextScheduledVisit).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  at{' '}
                  {new Date(currentParent.nextScheduledVisit).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <CountdownDisplay targetDateIso={currentParent.nextScheduledVisit} variant="hero" />
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <Clock className="w-8 h-8 text-stone-600 mx-auto" />
              <div className="text-xs text-stone-400">No scheduled upcoming visit set</div>
              <button
                onClick={() => onScheduleVisit(currentParent.id)}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 cursor-pointer"
              >
                Schedule Visit Countdown
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-500">{currentParent.location}</span>
            <button
              onClick={() => onLogVisit(currentParent.id)}
              className="text-xs text-stone-300 hover:text-stone-100 font-medium cursor-pointer"
            >
              + Log Past Visit
            </button>
          </div>
        </div>

        {/* Next Scheduled Phone Call */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 uppercase tracking-wider">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Next Planned Call</span>
            </div>
            <button
              onClick={() => onScheduleVisit(currentParent.id)}
              className="text-xs text-stone-400 hover:text-stone-200 underline cursor-pointer"
            >
              Set Call Time
            </button>
          </div>

          {currentParent.nextScheduledCall ? (
            <div className="space-y-3">
              <div className="text-xs text-stone-400">
                Scheduled for:{' '}
                <span className="text-stone-200 font-medium">
                  {new Date(currentParent.nextScheduledCall).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  at{' '}
                  {new Date(currentParent.nextScheduledCall).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <CountdownDisplay targetDateIso={currentParent.nextScheduledCall} variant="hero" />
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <Phone className="w-8 h-8 text-stone-600 mx-auto" />
              <div className="text-xs text-stone-400">No scheduled call reminder set</div>
              <button
                onClick={() => onScheduleVisit(currentParent.id)}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-800 text-stone-200 hover:bg-stone-700 rounded-lg cursor-pointer"
              >
                Schedule Call
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-mono-numbers">
              {currentParent.callsPerMonth} planned calls/month
            </span>
            <button
              onClick={() => onLogVisit(currentParent.id)}
              className="text-xs text-stone-300 hover:text-stone-100 font-medium cursor-pointer"
            >
              + Log Call Note
            </button>
          </div>
        </div>

        {/* Next Birthday Countdown */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Next Birthday</span>
            </div>
            <span className="text-xs text-stone-500 font-mono-numbers">
              Turning {insight.parentAge + 1}
            </span>
          </div>

          <div className="space-y-3">
            <div className="text-xs text-stone-400">
              Birthday:{' '}
              <span className="text-stone-200 font-medium">
                {nextBirthday.toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <CountdownDisplay targetDateIso={nextBirthdayIso} variant="hero" />
          </div>

          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
            <span>Born {new Date(currentParent.birthDate).toLocaleDateString()}</span>
            <span className="font-mono-numbers">Target: {currentParent.lifeExpectancyYears}y horizon</span>
          </div>
        </div>
      </section>

      {/* Cherish Moments: The Meaningful Conversations & Bucket List */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Cherish Moments & Meaningful Inquiries</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Things you must ask, learn, and experience together with {currentParent.name} before it is too late.
            </p>
          </div>

          <button
            onClick={() => setShowAddMoment(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Moment to Bucket List</span>
          </button>
        </div>

        {/* Add Moment Form */}
        {showAddMoment && (
          <form
            onSubmit={handleAddMomentSubmit}
            className="p-4 bg-stone-950 border border-stone-800 rounded-lg space-y-3"
          >
            <div className="text-xs font-semibold text-stone-300">
              Add a Cherish Moment with {currentParent.name}
            </div>
            <input
              type="text"
              placeholder="e.g., Ask about the hardest decision they made at age 25, or plan a weekend drive to the coast..."
              value={newMomentTitle}
              onChange={(e) => setNewMomentTitle(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>Category:</span>
                <select
                  value={newMomentCategory}
                  onChange={(e) => setNewMomentCategory(e.target.value as any)}
                  className="bg-stone-900 border border-stone-800 rounded px-2 py-1 text-xs text-stone-200"
                >
                  <option value="conversation">Deep Conversation / Story</option>
                  <option value="activity">Shared Activity / Trip</option>
                  <option value="memory">Record Audio / Artifact</option>
                  <option value="milestone">Milestone Celebration</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMoment(false)}
                  className="px-3 py-1 text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold bg-amber-400 text-stone-950 rounded hover:bg-amber-300"
                >
                  Save Moment
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Moments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentParent.cherishMoments.map((moment) => (
            <div
              key={moment.id}
              className={`p-3.5 rounded-lg border transition-all flex items-start gap-3 ${
                moment.completed
                  ? 'bg-stone-950/40 border-stone-800/40 opacity-70'
                  : 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
              }`}
            >
              <button
                onClick={() => onToggleCherishMoment(currentParent.id, moment.id)}
                className="mt-0.5 text-stone-500 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
              >
                {moment.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-600" />
                )}
              </button>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-medium ${
                      moment.completed ? 'line-through text-stone-500' : 'text-stone-200'
                    }`}
                  >
                    {moment.title}
                  </span>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wide shrink-0">
                    {moment.category}
                  </span>
                </div>

                {moment.notes && (
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {moment.notes}
                  </p>
                )}

                {moment.completed && moment.completedDate && (
                  <div className="text-[10px] text-emerald-400/80 font-mono-numbers">
                    Cherished on {new Date(moment.completedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Memory & Visit History Log */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Recorded Encounters & Calls Log</span>
            </h2>
            <p className="text-xs text-stone-400">
              A permanent journal of the time you dedicated to each other.
            </p>
          </div>

          <button
            onClick={() => onLogVisit(currentParent.id)}
            className="px-3 py-1.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg cursor-pointer"
          >
            + Log New Encounter
          </button>
        </div>

        {currentParent.visitLogs.length === 0 ? (
          <div className="text-xs text-stone-500 text-center py-6">
            No logged visits or calls recorded yet. Log your next conversation to remember the precious details.
          </div>
        ) : (
          <div className="space-y-2">
            {currentParent.visitLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-stone-950/60 border border-stone-800/80 rounded-lg flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-200">
                      {log.type === 'visit' ? 'In-Person Visit' : 'Phone Call'}
                    </span>
                    <span aria-hidden="true" className="text-stone-600">·</span>
                    <span className="text-stone-400 font-mono-numbers">{log.date}</span>
                    {log.durationDays > 0 && (
                      <>
                        <span aria-hidden="true" className="text-stone-600">·</span>
                        <span className="text-amber-400/90 font-mono-numbers">{log.durationDays} days together</span>
                      </>
                    )}
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    {log.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
