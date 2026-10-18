import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Phone, Heart } from 'lucide-react';
import { ParentProfile } from '../types';

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: ParentProfile | null;
  onSaveSchedule: (parentId: string, visitIso: string | null, callIso: string | null) => void;
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  isOpen,
  onClose,
  parent,
  onSaveSchedule,
}) => {
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('14:00');
  const [callDate, setCallDate] = useState('');
  const [callTime, setCallTime] = useState('19:00');

  useEffect(() => {
    if (parent) {
      if (parent.nextScheduledVisit) {
        const v = new Date(parent.nextScheduledVisit);
        setVisitDate(
          `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`
        );
        setVisitTime(
          `${String(v.getHours()).padStart(2, '0')}:${String(v.getMinutes()).padStart(2, '0')}`
        );
      } else {
        setVisitDate('');
        setVisitTime('14:00');
      }

      if (parent.nextScheduledCall) {
        const c = new Date(parent.nextScheduledCall);
        setCallDate(
          `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, '0')}-${String(c.getDate()).padStart(2, '0')}`
        );
        setCallTime(
          `${String(c.getHours()).padStart(2, '0')}:${String(c.getMinutes()).padStart(2, '0')}`
        );
      } else {
        setCallDate('');
        setCallTime('19:00');
      }
    }
  }, [parent, isOpen]);

  if (!isOpen || !parent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const visitIso = visitDate ? new Date(`${visitDate}T${visitTime || '00:00'}:00`).toISOString() : null;
    const callIso = callDate ? new Date(`${callDate}T${callTime || '00:00'}:00`).toISOString() : null;

    onSaveSchedule(parent.id, visitIso, callIso);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Schedule Encounter with {parent.name}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* In-Person Visit */}
          <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Next In-Person Visit (Live Countdown)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-stone-400">Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 font-mono-numbers"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Time</label>
                <input
                  type="time"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 font-mono-numbers"
                />
              </div>
            </div>
            {visitDate && (
              <button
                type="button"
                onClick={() => setVisitDate('')}
                className="text-[11px] text-stone-500 hover:text-stone-300 underline"
              >
                Clear scheduled visit
              </button>
            )}
          </div>

          {/* Next Phone Call */}
          <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
              <Phone className="w-3.5 h-3.5" />
              <span>Next Planned Phone Call</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-stone-400">Date</label>
                <input
                  type="date"
                  value={callDate}
                  onChange={(e) => setCallDate(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 font-mono-numbers"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Time</label>
                <input
                  type="time"
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 font-mono-numbers"
                />
              </div>
            </div>
            {callDate && (
              <button
                type="button"
                onClick={() => setCallDate('')}
                className="text-[11px] text-stone-500 hover:text-stone-300 underline"
              >
                Clear scheduled call
              </button>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 shadow-sm cursor-pointer"
            >
              Update Countdowns
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
