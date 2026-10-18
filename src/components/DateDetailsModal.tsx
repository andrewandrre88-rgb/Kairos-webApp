import React from 'react';
import { X, Calendar, Flag, Heart, Phone, Plus } from 'lucide-react';
import { Goal, ParentProfile } from '../types';

interface DateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null; // YYYY-MM-DD
  goals: Goal[];
  parents: ParentProfile[];
  onAddGoalForDate: (dateStr: string) => void;
  onScheduleVisitForDate: (parentId: string, dateStr: string) => void;
}

export const DateDetailsModal: React.FC<DateDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  goals,
  parents,
  onAddGoalForDate,
  onScheduleVisitForDate,
}) => {
  if (!isOpen || !selectedDate) return null;

  const dayGoals = goals.filter((g) => g.targetDate.startsWith(selectedDate));
  const dayVisits = parents.filter(
    (p) => p.nextScheduledVisit && p.nextScheduledVisit.startsWith(selectedDate)
  );
  const dayCalls = parents.filter(
    (p) => p.nextScheduledCall && p.nextScheduledCall.startsWith(selectedDate)
  );

  const formattedDate = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{formattedDate}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Scheduled events on this day */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Events & Deadlines on this Day
            </div>

            {dayGoals.length === 0 && dayVisits.length === 0 && dayCalls.length === 0 ? (
              <div className="text-stone-500 py-4 text-center bg-stone-950/40 rounded-lg border border-stone-800/40">
                No events or deadlines currently scheduled for this day.
              </div>
            ) : (
              <div className="space-y-2">
                {dayVisits.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-center gap-3 text-rose-200"
                  >
                    <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-semibold">In-Person Visit: {p.name}</div>
                      <div className="text-[11px] text-rose-300/80">
                        Scheduled for {new Date(p.nextScheduledVisit!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {dayCalls.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-3 text-emerald-200"
                  >
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Phone Call: {p.name}</div>
                      <div className="text-[11px] text-emerald-300/80">
                        Scheduled for {new Date(p.nextScheduledCall!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {dayGoals.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-center gap-3 text-amber-200"
                  >
                    <Flag className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-semibold">{g.title}</div>
                      <div className="text-[11px] text-amber-300/80">
                        {g.category} · Due {new Date(g.targetDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions to schedule for this date */}
          <div className="pt-4 border-t border-stone-800 space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-2">
              Add Item for This Date
            </div>

            <button
              onClick={() => {
                onAddGoalForDate(selectedDate);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 rounded-lg font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Set Goal Deadline on {selectedDate}</span>
            </button>

            {parents.length > 0 && (
              <div className="pt-1">
                <div className="text-[10px] text-stone-500 mb-1">Schedule visit with:</div>
                <div className="grid grid-cols-2 gap-2">
                  {parents.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onScheduleVisitForDate(p.id, selectedDate);
                        onClose();
                      }}
                      className="p-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-lg text-left truncate transition-colors cursor-pointer"
                    >
                      <Heart className="w-3 h-3 text-rose-400 inline mr-1" />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
