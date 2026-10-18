import React, { useEffect, useState } from 'react';
import { getTimeRemaining, TimeRemaining } from '../utils/timeCalculations';

interface CountdownDisplayProps {
  targetDateIso: string;
  variant?: 'hero' | 'card' | 'inline' | 'compact';
  label?: string;
  className?: string;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  targetDateIso,
  variant = 'card',
  label,
  className = '',
}) => {
  const [time, setTime] = useState<TimeRemaining>(() => getTimeRemaining(targetDateIso));

  useEffect(() => {
    // Tick every second
    const interval = setInterval(() => {
      setTime(getTimeRemaining(targetDateIso));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateIso]);

  if (time.isPast) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-medium text-amber-400 ${className}`}>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <span>Target date reached</span>
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (variant === 'hero') {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <div className="text-xs uppercase tracking-wider text-stone-400 font-medium">
            {label}
          </div>
        )}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2.5 sm:p-3 shadow-inner">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-mono-numbers text-stone-100">
              {time.days}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-stone-500 font-medium mt-0.5">
              Days
            </div>
          </div>
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2.5 sm:p-3 shadow-inner">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-mono-numbers text-stone-100">
              {pad(time.hours)}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-stone-500 font-medium mt-0.5">
              Hours
            </div>
          </div>
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2.5 sm:p-3 shadow-inner">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-mono-numbers text-stone-100">
              {pad(time.minutes)}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-stone-500 font-medium mt-0.5">
              Mins
            </div>
          </div>
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2.5 sm:p-3 shadow-inner">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-mono-numbers text-amber-400">
              {pad(time.seconds)}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-amber-500/80 font-medium mt-0.5">
              Secs
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`flex items-baseline gap-2 font-mono-numbers ${className}`}>
        <div className="flex items-baseline gap-1 text-stone-200">
          <span className="text-lg sm:text-xl font-semibold text-amber-200">{time.days}</span>
          <span className="text-xs text-stone-500">d</span>
        </div>
        <span className="text-stone-700">·</span>
        <div className="flex items-baseline gap-1 text-stone-300">
          <span className="text-base sm:text-lg font-medium">{pad(time.hours)}</span>
          <span className="text-xs text-stone-500">h</span>
        </div>
        <span className="text-stone-700">·</span>
        <div className="flex items-baseline gap-1 text-stone-300">
          <span className="text-base sm:text-lg font-medium">{pad(time.minutes)}</span>
          <span className="text-xs text-stone-500">m</span>
        </div>
        <span className="text-stone-700">·</span>
        <div className="flex items-baseline gap-1 text-amber-400">
          <span className="text-base sm:text-lg font-medium">{pad(time.seconds)}</span>
          <span className="text-xs text-amber-500/70">s</span>
        </div>
      </div>
    );
  }

  // Compact / Inline
  return (
    <span className={`font-mono-numbers text-xs font-medium text-stone-300 ${className}`}>
      <span className="text-amber-300">{time.days}d</span>{' '}
      <span>{pad(time.hours)}h</span>{' '}
      <span>{pad(time.minutes)}m</span>{' '}
      <span className="text-amber-400/90">{pad(time.seconds)}s</span>
    </span>
  );
};
