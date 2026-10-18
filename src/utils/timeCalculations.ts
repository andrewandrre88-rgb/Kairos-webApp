import { ParentProfile, UserProfile } from '../types';

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalSeconds: number;
}

export function getTimeRemaining(targetDateIso: string, fromDate: Date = new Date()): TimeRemaining {
  const target = new Date(targetDateIso).getTime();
  const now = fromDate.getTime();
  const diff = target - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      totalSeconds: 0,
    };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    totalSeconds: Math.floor(diff / 1000),
  };
}

export function getAge(birthDateIso: string, now: Date = new Date()): number {
  const birth = new Date(birthDateIso);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function getDetailedAge(birthDateIso: string, now: Date = new Date()): { years: number; months: number; days: number; totalDays: number } {
  const birth = new Date(birthDateIso);
  const diffMs = now.getTime() - birth.getTime();
  const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  
  const years = getAge(birthDateIso, now);
  const currentYearBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  let lastBirthday = currentYearBirthday;
  if (now < currentYearBirthday) {
    lastBirthday = new Date(now.getFullYear() - 1, birth.getMonth(), birth.getDate());
  }
  const daysSinceBirthday = Math.floor((now.getTime() - lastBirthday.getTime()) / (1000 * 60 * 60 * 24));
  const months = Math.floor(daysSinceBirthday / 30.44);
  const days = Math.floor(daysSinceBirthday % 30.44);

  return { years, months, days, totalDays };
}

export interface ParentTimeInsight {
  parentAge: number;
  remainingYears: number;
  remainingDays: number;
  estimatedPassDate: Date;
  remainingVisits: number;
  remainingInPersonDays: number;
  remainingCalls: number;
  percentInPersonSpent: number;
  pastInPersonDays: number;
  totalLifetimeInPersonDays: number;
}

export function calculateParentTimeInsights(
  parent: ParentProfile, 
  user: UserProfile, 
  now: Date = new Date()
): ParentTimeInsight {
  const parentBirth = new Date(parent.birthDate);
  const userBirth = new Date(user.birthDate);
  
  const parentAge = getAge(parent.birthDate, now);
  const userAge = getAge(user.birthDate, now);
  
  const targetEndYear = parentBirth.getFullYear() + parent.lifeExpectancyYears;
  const estimatedPassDate = new Date(targetEndYear, parentBirth.getMonth(), parentBirth.getDate());
  
  const diffMs = estimatedPassDate.getTime() - now.getTime();
  const remainingDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const remainingYears = Math.max(0, Number((remainingDays / 365.25).toFixed(1)));
  
  // Remaining visits and in-person days
  const remainingVisits = Math.max(0, Math.round(remainingYears * parent.visitsPerYear));
  const remainingInPersonDays = Math.max(0, Math.round(remainingVisits * parent.avgDaysPerVisit));
  const remainingCalls = Math.max(0, Math.round(remainingYears * 12 * parent.callsPerMonth));
  
  // The Tail End calculation:
  // Days spent from birth to 18: ~18 years * 330 days = 5940 days
  // College/ages 18-22: 4 years * 60 days = 240 days
  const adultYears = Math.max(0, userAge - 22);
  const adultPastDays = adultYears * parent.visitsPerYear * parent.avgDaysPerVisit;
  
  const childhoodDays = Math.min(userAge, 18) * 330;
  const collegeDays = (userAge > 18 ? Math.min(userAge - 18, 4) : 0) * 60;
  const pastInPersonDays = Math.round(childhoodDays + collegeDays + adultPastDays);
  
  const totalLifetimeInPersonDays = pastInPersonDays + remainingInPersonDays;
  const percentInPersonSpent = totalLifetimeInPersonDays > 0 
    ? Math.min(99.5, Math.max(1, Number(((pastInPersonDays / totalLifetimeInPersonDays) * 100).toFixed(1))))
    : 90;

  return {
    parentAge,
    remainingYears,
    remainingDays,
    estimatedPassDate,
    remainingVisits,
    remainingInPersonDays,
    remainingCalls,
    percentInPersonSpent,
    pastInPersonDays,
    totalLifetimeInPersonDays,
  };
}

export interface YearProgress {
  year: number;
  dayOfYear: number;
  totalDaysInYear: number;
  percentElapsed: number;
  daysRemaining: number;
  currentDateFormatted: string;
}

export function getYearProgress(now: Date = new Date()): YearProgress {
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const totalDaysInYear = isLeapYear ? 366 : 365;
  
  const diffMs = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.min(totalDaysInYear, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
  const daysRemaining = Math.max(0, totalDaysInYear - dayOfYear);
  const percentElapsed = Number(((dayOfYear / totalDaysInYear) * 100).toFixed(1));
  
  const currentDateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    year,
    dayOfYear,
    totalDaysInYear,
    percentElapsed,
    daysRemaining,
    currentDateFormatted,
  };
}

export interface LifeWeeksInfo {
  totalWeeks: number;
  weeksLived: number;
  weeksRemaining: number;
  percentLived: number;
  currentAgeYears: number;
}

export function getLifeWeeks(user: UserProfile, now: Date = new Date()): LifeWeeksInfo {
  const birth = new Date(user.birthDate);
  const totalWeeks = user.targetLifespanYears * 52;
  const diffMs = now.getTime() - birth.getTime();
  const weeksLived = Math.min(totalWeeks, Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))));
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  const percentLived = Number(((weeksLived / totalWeeks) * 100).toFixed(1));
  const currentAgeYears = getAge(user.birthDate, now);

  return {
    totalWeeks,
    weeksLived,
    weeksRemaining,
    percentLived,
    currentAgeYears,
  };
}
