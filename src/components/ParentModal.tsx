import React, { useState, useEffect } from 'react';
import { X, Heart, Calendar, MapPin, Activity } from 'lucide-react';
import { ParentProfile } from '../types';

interface ParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (parentData: Partial<ParentProfile>) => void;
  initialParent?: ParentProfile | null;
}

export const ParentModal: React.FC<ParentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialParent,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<ParentProfile['relationship']>('mother');
  const [birthDate, setBirthDate] = useState('1965-01-01');
  const [lifeExpectancyYears, setLifeExpectancyYears] = useState(82);
  const [visitsPerYear, setVisitsPerYear] = useState(3);
  const [avgDaysPerVisit, setAvgDaysPerVisit] = useState(4);
  const [callsPerMonth, setCallsPerMonth] = useState(4);
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (initialParent) {
      setName(initialParent.name);
      setRelationship(initialParent.relationship);
      setBirthDate(initialParent.birthDate);
      setLifeExpectancyYears(initialParent.lifeExpectancyYears);
      setVisitsPerYear(initialParent.visitsPerYear);
      setAvgDaysPerVisit(initialParent.avgDaysPerVisit);
      setCallsPerMonth(initialParent.callsPerMonth);
      setLocation(initialParent.location);
    } else {
      setName('');
      setRelationship('mother');
      setBirthDate('1965-01-01');
      setLifeExpectancyYears(82);
      setVisitsPerYear(3);
      setAvgDaysPerVisit(4);
      setCallsPerMonth(4);
      setLocation('');
    }
  }, [initialParent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) return;

    onSave({
      name: name.trim(),
      relationship,
      birthDate,
      lifeExpectancyYears: Number(lifeExpectancyYears) || 82,
      visitsPerYear: Number(visitsPerYear) || 1,
      avgDaysPerVisit: Number(avgDaysPerVisit) || 1,
      callsPerMonth: Number(callsPerMonth) || 1,
      location: location.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>{initialParent ? `Edit ${initialParent.name}'s Profile` : 'Add Parent or Loved One'}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-stone-300 font-medium">Name / Label *</label>
              <input
                type="text"
                required
                placeholder="e.g., Mom (Eleanor)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-400 font-medium">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as any)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
              >
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="guardian">Guardian</option>
                <option value="grandparent">Grandparent</option>
                <option value="other">Other Loved One</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-stone-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Date of Birth *</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono-numbers focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-400 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-stone-500" />
                <span>Life Expectancy Horizon (Years)</span>
              </label>
              <input
                type="number"
                min="50"
                max="110"
                required
                value={lifeExpectancyYears}
                onChange={(e) => setLifeExpectancyYears(Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono-numbers focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-stone-500">
                Average actuarial life expectancy is ~79 for males, ~84 for females.
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-950/70 border border-stone-800/80 rounded-lg space-y-3">
            <div className="text-stone-300 font-semibold uppercase tracking-wider text-[11px]">
              Visits & Interaction Frequency
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-stone-400">Visits per Year</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="52"
                  value={visitsPerYear}
                  onChange={(e) => setVisitsPerYear(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200 font-mono-numbers"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Avg Days per Visit</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={avgDaysPerVisit}
                  onChange={(e) => setAvgDaysPerVisit(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200 font-mono-numbers"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Calls per Month</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={callsPerMonth}
                  onChange={(e) => setCallsPerMonth(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200 font-mono-numbers"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-stone-400 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              <span>Location / Distance</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Hometown, OR — 450 miles away"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Footer buttons */}
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
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
