import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, Flag, Pin } from 'lucide-react';
import { Goal, GoalCategory, GoalPriority, Milestone } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Partial<Goal>) => void;
  initialGoal?: Goal | null;
}

const CATEGORIES: GoalCategory[] = [
  'Career',
  'Health & Vitality',
  'Family & Roots',
  'Creative & Craft',
  'Financial Freedom',
  'Adventure & Travel',
  'Mind & Spirit',
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Career');
  const [priority, setPriority] = useState<GoalPriority>('high');
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('23:59');
  const [isPinned, setIsPinned] = useState(false);
  const [notes, setNotes] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description);
      setCategory(initialGoal.category);
      setPriority(initialGoal.priority);
      const target = new Date(initialGoal.targetDate);
      const yyyy = target.getFullYear();
      const mm = String(target.getMonth() + 1).padStart(2, '0');
      const dd = String(target.getDate()).padStart(2, '0');
      setTargetDate(`${yyyy}-${mm}-${dd}`);
      const hh = String(target.getHours()).padStart(2, '0');
      const min = String(target.getMinutes()).padStart(2, '0');
      setTargetTime(`${hh}:${min}`);
      setIsPinned(initialGoal.isPinned);
      setNotes(initialGoal.notes || '');
      setMilestones(initialGoal.milestones || []);
    } else {
      // Default new goal: 90 days from now (2026-10-18) -> around mid January 2027
      setTitle('');
      setDescription('');
      setCategory('Career');
      setPriority('high');
      setTargetDate('2026-12-31');
      setTargetTime('23:59');
      setIsPinned(true);
      setNotes('');
      setMilestones([]);
    }
  }, [initialGoal, isOpen]);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestones([
      ...milestones,
      {
        id: `m-${Date.now()}`,
        title: newMilestoneTitle.trim(),
        isCompleted: false,
      },
    ]);
    setNewMilestoneTitle('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;

    const fullIsoString = new Date(`${targetDate}T${targetTime || '00:00'}:00`).toISOString();

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      targetDate: fullIsoString,
      isPinned,
      notes: notes.trim(),
      milestones,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber-400" />
            <span>{initialGoal ? 'Edit Goal Deadline' : 'Set New Goal & Deadline Countdown'}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-stone-300 font-medium">Goal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Publish my first book, Run the spring half marathon..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-stone-400 font-medium">Description & Purpose</label>
            <textarea
              rows={2}
              placeholder="Why does this matter? What is the tangible outcome?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-stone-400 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-stone-400 font-medium">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
              >
                <option value="high">High (Front & Center)</option>
                <option value="medium">Medium</option>
                <option value="low">Low (Flexible Horizon)</option>
              </select>
            </div>
          </div>

          {/* Deadline Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-stone-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Target Deadline Date *</span>
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono-numbers focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>Target Time (for ticking countdown)</span>
              </label>
              <input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono-numbers focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Pin toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-stone-700 text-amber-400 focus:ring-0 bg-stone-950"
              />
              <span className="flex items-center gap-1">
                <Pin className="w-3.5 h-3.5 text-amber-400" />
                <span>Pin to top of Dashboard Overview</span>
              </span>
            </label>
          </div>

          {/* Milestones */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <label className="text-stone-300 font-medium">Milestones / Action Steps</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add sub-milestone (e.g., Draft first chapter)..."
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMilestone();
                  }
                }}
                className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1.5 bg-stone-800 text-stone-200 hover:bg-stone-700 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {milestones.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded bg-stone-950 border border-stone-800/80 text-stone-300"
                  >
                    <span className="truncate">{m.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(m.id)}
                      className="text-stone-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personal reflections / notes */}
          <div className="space-y-1 pt-1">
            <label className="text-stone-400 font-medium">Personal Mantra or Notes</label>
            <input
              type="text"
              placeholder="e.g., Done is better than perfect."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Modal Footer buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-800">
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
              {initialGoal ? 'Save Changes' : 'Create Goal Countdown'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
