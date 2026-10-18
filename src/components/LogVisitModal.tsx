import React, { useState } from 'react';
import { X, Calendar, MessageSquare, Heart } from 'lucide-react';
import { ParentProfile, VisitLog } from '../types';

interface LogVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: ParentProfile | null;
  onSaveLog: (parentId: string, log: Omit<VisitLog, 'id'>) => void;
}

export const LogVisitModal: React.FC<LogVisitModalProps> = ({
  isOpen,
  onClose,
  parent,
  onSaveLog,
}) => {
  const [type, setType] = useState<'visit' | 'call'>('visit');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [durationDays, setDurationDays] = useState(3);
  const [notes, setNotes] = useState('');

  if (!isOpen || !parent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    onSaveLog(parent.id, {
      type,
      date,
      durationDays: type === 'visit' ? Number(durationDays) || 1 : 0,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Record Encounter with {parent.name}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Type */}
          <div className="space-y-1">
            <label className="text-stone-400 font-medium">Encounter Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('visit')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  type === 'visit'
                    ? 'bg-amber-400 text-stone-950 border-amber-400'
                    : 'bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-800'
                }`}
              >
                In-Person Visit
              </button>
              <button
                type="button"
                onClick={() => setType('call')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  type === 'call'
                    ? 'bg-amber-400 text-stone-950 border-amber-400'
                    : 'bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-800'
                }`}
              >
                Phone / Video Call
              </button>
            </div>
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-stone-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono-numbers focus:outline-none focus:border-amber-400"
              />
            </div>

            {type === 'visit' && (
              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Duration (Days)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="60"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono-numbers focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Reflections and notes */}
          <div className="space-y-1">
            <label className="text-stone-400 font-medium flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
              <span>Memories, Stories Shared, or Notes</span>
            </label>
            <textarea
              rows={3}
              placeholder="What did you talk about? What made them smile or laugh? What will you remember?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
            />
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
              Save Encounter Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
