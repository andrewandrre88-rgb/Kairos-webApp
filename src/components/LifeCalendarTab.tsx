import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Heart, Flag, Sparkles } from 'lucide-react';
import { Goal, ParentProfile, UserProfile } from '../types';
import { getLifeWeeks, getYearProgress } from '../utils/timeCalculations';

interface LifeCalendarTabProps {
  goals: Goal[];
  parents: ParentProfile[];
  user: UserProfile;
  onSelectDate: (dateStr: string) => void;
  onOpenNewGoal: () => void;
}

export const LifeCalendarTab: React.FC<LifeCalendarTabProps> = ({
  goals,
  parents,
  user,
  onSelectDate,
  onOpenNewGoal,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(2026, 9, 1)); // October 2026
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'year' | 'memento_mori'>('month');
  const [showParentOverlap, setShowParentOverlap] = useState(true);
  const [hoveredWeek, setHoveredWeek] = useState<{ age: number; week: number; year: number } | null>(null);

  const now = new Date();
  const yearProgress = getYearProgress(now);
  const lifeWeeks = getLifeWeeks(user, now);

  // Month calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 for Sun

  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  // Find events for dates
  const getEventsForDay = (dayNum: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayGoals = goals.filter((g) => g.targetDate.startsWith(dateStr));
    const dayVisits = parents.filter((p) => p.nextScheduledVisit && p.nextScheduledVisit.startsWith(dateStr));
    const dayCalls = parents.filter((p) => p.nextScheduledCall && p.nextScheduledCall.startsWith(dateStr));
    return { dayGoals, dayVisits, dayCalls, dateStr };
  };

  // Memento mori calculation
  const totalYears = user.targetLifespanYears || 85;
  const userBirthYear = new Date(user.birthDate).getFullYear();

  // Parents life expectancy horizon relative to user age
  const parentsPassingUserAges = parents.map((p) => {
    const parentBirth = new Date(p.birthDate);
    const parentPassYear = parentBirth.getFullYear() + p.lifeExpectancyYears;
    const userAgeAtParentPass = parentPassYear - userBirthYear;
    return {
      parent: p,
      userAgeAtParentPass,
    };
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Calendar & Life Grid</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Keep track of time from individual days to your entire 4,420-week human horizon.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setCalendarViewMode('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              calendarViewMode === 'month'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Monthly Calendar
          </button>
          <button
            onClick={() => setCalendarViewMode('year')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              calendarViewMode === 'year'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {yearProgress.year} Year Grid
          </button>
          <button
            onClick={() => setCalendarViewMode('memento_mori')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              calendarViewMode === 'memento_mori'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Life in Weeks
          </button>
        </div>
      </div>

      {/* VIEW 1: Monthly Calendar */}
      {calendarViewMode === 'month' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-6">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-stone-100">{monthName}</h2>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs text-stone-400 hover:text-stone-200 bg-stone-950 border border-stone-800 rounded hover:border-stone-700 transition-colors cursor-pointer"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                aria-label="Previous Month"
                className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next Month"
                className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-stone-500 font-medium">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank cells for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[90px] rounded-lg bg-stone-950/30 border border-stone-800/30" />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isToday =
                now.getFullYear() === year &&
                now.getMonth() === month &&
                now.getDate() === dayNum;

              const { dayGoals, dayVisits, dayCalls, dateStr } = getEventsForDay(dayNum);

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => onSelectDate(dateStr)}
                  className={`min-h-[90px] p-2 rounded-lg border text-left flex flex-col justify-between transition-colors cursor-pointer group ${
                    isToday
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                      : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono-numbers font-medium ${
                        isToday ? 'text-amber-400 font-bold' : 'text-stone-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[10px] text-amber-400 font-semibold uppercase">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Badges / events */}
                  <div className="space-y-1 my-1">
                    {dayVisits.map((p) => (
                      <div
                        key={p.id}
                        className="text-[10px] bg-rose-950/60 text-rose-300 border border-rose-800/60 rounded px-1.5 py-0.5 truncate flex items-center gap-1 font-medium"
                      >
                        <Heart className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">Visit: {p.name}</span>
                      </div>
                    ))}

                    {dayCalls.map((p) => (
                      <div
                        key={p.id}
                        className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded px-1.5 py-0.5 truncate flex items-center gap-1"
                      >
                        <span className="truncate">Call: {p.name}</span>
                      </div>
                    ))}

                    {dayGoals.map((g) => (
                      <div
                        key={g.id}
                        className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded px-1.5 py-0.5 truncate flex items-center gap-1"
                      >
                        <Flag className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{g.title}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-stone-600 group-hover:text-stone-400 transition-colors">
                    + Click to view
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Year 2026 Day-by-Day Block Grid */}
      {calendarViewMode === 'year' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-100">
                Year {yearProgress.year} at a Glance (365 Days)
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Each dot is 24 hours. Today is Day {yearProgress.dayOfYear} of {yearProgress.totalDaysInYear} ({yearProgress.percentElapsed}% elapsed).
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono-numbers">
              <span className="text-stone-400">{yearProgress.daysRemaining} days left</span>
              <span className="text-amber-400">{yearProgress.percentElapsed}% gone</span>
            </div>
          </div>

          {/* 365 days visual dots */}
          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800/80">
            <div className="grid grid-cols-15 sm:grid-cols-25 md:grid-cols-35 lg:grid-cols-52 gap-1.5">
              {Array.from({ length: yearProgress.totalDaysInYear }).map((_, index) => {
                const dayNumber = index + 1;
                const isPast = dayNumber < yearProgress.dayOfYear;
                const isCurrent = dayNumber === yearProgress.dayOfYear;

                return (
                  <div
                    key={dayNumber}
                    title={`Day ${dayNumber} of ${yearProgress.year}${isCurrent ? ' (Today)' : ''}`}
                    className={`aspect-square rounded-[2px] transition-all ${
                      isCurrent
                        ? 'bg-amber-400 ring-2 ring-amber-400/50 scale-125 z-10'
                        : isPast
                        ? 'bg-stone-700/80'
                        : 'bg-stone-800 hover:bg-stone-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500 pt-2 border-t border-stone-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-stone-700"></span>
                <span>Days Elapsed ({yearProgress.dayOfYear - 1})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-amber-400"></span>
                <span className="text-stone-300 font-medium">Today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-stone-800"></span>
                <span>Days Ahead ({yearProgress.daysRemaining})</span>
              </div>
            </div>

            <button
              onClick={onOpenNewGoal}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              Set Year End Goal →
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: Memento Mori - Life in Weeks */}
      {calendarViewMode === 'memento_mori' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-100">
                  Memento Mori — Your Life in Weeks
                </h2>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Every tiny square is one full week of your life. 52 weeks per row across {totalYears} years.
              </p>
            </div>

            {/* Parent Horizon Overlay Toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showParentOverlap}
                  onChange={(e) => setShowParentOverlap(e.target.checked)}
                  className="rounded border-stone-700 text-amber-500 focus:ring-0 bg-stone-950"
                />
                <span>Highlight Parents Overlap Horizon</span>
              </label>
            </div>
          </div>

          {/* Hovered week inspector tooltip */}
          <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 flex items-center justify-between text-xs text-stone-300">
            {hoveredWeek ? (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-amber-300">
                  Age {hoveredWeek.age}, Week {hoveredWeek.week}
                </span>
                <span aria-hidden="true" className="text-stone-600">·</span>
                <span className="text-stone-400 font-mono-numbers">Year ~{hoveredWeek.year}</span>
                {showParentOverlap && (
                  <span className="text-xs text-rose-300">
                    {hoveredWeek.age <= (parentsPassingUserAges[0]?.userAgeAtParentPass || 50)
                      ? 'Within Parents Lifespan Window'
                      : 'Post-Parents Life Chapter'}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-stone-500">
                Hover over any week below to inspect your age and calendar year.
              </div>
            )}

            <div className="font-mono-numbers text-stone-400">
              Lived: <span className="text-stone-200">{lifeWeeks.weeksLived}</span> / {lifeWeeks.totalWeeks} ({lifeWeeks.percentLived}%)
            </div>
          </div>

          {/* Grid Container */}
          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 overflow-x-auto">
            <div className="min-w-[640px] space-y-1">
              {Array.from({ length: totalYears }).map((_, age) => {
                const yearNumber = userBirthYear + age;
                const isCurrentAge = age === lifeWeeks.currentAgeYears;
                const isWithinParentOverlap =
                  showParentOverlap &&
                  parentsPassingUserAges.some((p) => age <= p.userAgeAtParentPass);

                return (
                  <div key={age} className="flex items-center gap-2 group">
                    {/* Age label */}
                    <span
                      className={`text-[10px] w-6 text-right font-mono-numbers shrink-0 ${
                        isCurrentAge ? 'text-amber-400 font-bold' : 'text-stone-600 group-hover:text-stone-400'
                      }`}
                    >
                      {age % 5 === 0 || isCurrentAge ? age : ''}
                    </span>

                    {/* 52 weeks in this year */}
                    <div className="flex items-center gap-[3px] flex-1">
                      {Array.from({ length: 52 }).map((_, weekIndex) => {
                        const totalWeekIndex = age * 52 + weekIndex;
                        const isPast = totalWeekIndex < lifeWeeks.weeksLived;
                        const isCurrentWeek = totalWeekIndex === lifeWeeks.weeksLived;

                        return (
                          <div
                            key={weekIndex}
                            onMouseEnter={() =>
                              setHoveredWeek({ age, week: weekIndex + 1, year: yearNumber })
                            }
                            className={`w-[7px] h-[7px] sm:w-[9px] sm:h-[9px] rounded-[1px] transition-all cursor-pointer ${
                              isCurrentWeek
                                ? 'bg-amber-400 ring-2 ring-amber-400/80 scale-125 z-10'
                                : isPast
                                ? isWithinParentOverlap && showParentOverlap
                                  ? 'bg-rose-950/70 border border-rose-900/40'
                                  : 'bg-stone-700/80'
                                : isWithinParentOverlap && showParentOverlap
                                ? 'bg-amber-950/30 border border-amber-900/30 hover:bg-amber-400/40'
                                : 'bg-stone-900 border border-stone-800 hover:bg-stone-700'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend for Memento Mori */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500 pt-2 border-t border-stone-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-[1px] bg-stone-700"></span>
                <span>Weeks Lived ({lifeWeeks.weeksLived})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-[1px] bg-amber-400"></span>
                <span className="text-stone-300 font-medium">This Week (Age {lifeWeeks.currentAgeYears})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-[1px] bg-stone-900 border border-stone-800"></span>
                <span>Future Weeks ({lifeWeeks.weeksRemaining})</span>
              </div>
            </div>

            {showParentOverlap && (
              <div className="flex items-center gap-2 text-rose-300">
                <span className="inline-block w-2.5 h-2.5 rounded-[1px] bg-amber-950/40 border border-amber-900/50"></span>
                <span>Shared Lifetime With Parents Horizon</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
