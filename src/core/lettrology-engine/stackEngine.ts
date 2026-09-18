/**
 * @license
 * Lettrology Forensic Science - Deterministic Calculation Engine
 * Section 26: Multi-Stack / Multi-Person Analysis
 */

import { AnnualState, generateAnnualTimeMap, parseDob } from './annualEngine.ts';
import { MonthlyState, generateMonthlyCalendar } from './monthlyEngine.ts';
import { formatCompound } from './compoundTrail.ts';
import { formatHistoricalYear, historicalYearDifference } from '../historicalDate.ts';

export interface PersonStackInput {
  personId: string;
  name: string;
  dob: string;
  roleInCase?: string;
}

export interface PersonAnnualStackItem {
  personId: string;
  name: string;
  dob: string;
  roleInCase?: string;
  age: number;
  calendarYear: number;
  firstLetter: string;
  middleLetters: string[];
  surnameLetter: string;
  activeLetters: string[];
  ess: string;
  essRoot: number;
  py: string;
  pyRoot: number;
  com: string;
  comRoot: number;
  cy: string;
  isIntensified: boolean;
  powerNumbers: (11 | 13 | 16)[];
  isPowerNumber: boolean;
  rawAnnual: AnnualState;
}

export interface PersonMonthlyStackItem {
  personId: string;
  name: string;
  dob: string;
  roleInCase?: string;
  monthIndex: number;
  monthName: string;
  year: number;
  ess: string;
  pme: string;
  mcom: string;
  pm: string;
  cm: number;
  py: string;
  isPowerMonth: boolean;
  powerNumbers: (11 | 13 | 16)[];
  rawMonthly: MonthlyState;
}

export interface StackGroupFindings {
  totalSubjects: number;
  subjectsWithPowerNumber: number;
  powerNumberBreakdown: Record<11 | 13 | 16, number>;
  sharedPersonalYears: Record<number, string[]>;
  intensificationCount: number;
  observations: string[];
}

export function computeAnnualStack(
  people: PersonStackInput[],
  targetYear: number
): {
  items: PersonAnnualStackItem[];
  findings: StackGroupFindings;
} {
  const items: PersonAnnualStackItem[] = [];
  const pyMap: Record<number, string[]> = {};
  const powerMap: Record<11 | 13 | 16, number> = { 11: 0, 13: 0, 16: 0 };
  let powerCount = 0;
  let intensCount = 0;

  for (const person of people) {
    const dob = parseDob(person.dob);
    const age = historicalYearDifference(dob.year, targetYear);
    if (age < 0) continue;

    const timeMap = generateAnnualTimeMap(person.name, person.dob, age, age, 'AGE');
    const annual = timeMap[0];
    if (!annual) continue;

    if (annual.isIntensified) intensCount++;
    if (annual.isPowerNumber) {
      powerCount++;
      for (const pn of annual.powerNumbers) powerMap[pn] = (powerMap[pn] || 0) + 1;
    }

    if (!pyMap[annual.py.root]) pyMap[annual.py.root] = [];
    pyMap[annual.py.root].push(person.name);

    items.push({
      personId: person.personId,
      name: person.name,
      dob: person.dob,
      roleInCase: person.roleInCase,
      age,
      calendarYear: targetYear,
      firstLetter: annual.firstLetter,
      middleLetters: annual.middleLetters,
      surnameLetter: annual.surnameLetter,
      activeLetters: annual.activeLetters,
      ess: formatCompound(annual.ess),
      essRoot: annual.ess.root,
      py: formatCompound(annual.py),
      pyRoot: annual.py.root,
      com: formatCompound(annual.com),
      comRoot: annual.com.root,
      cy: formatCompound(annual.cy),
      isIntensified: annual.isIntensified,
      powerNumbers: annual.powerNumbers,
      isPowerNumber: annual.isPowerNumber,
      rawAnnual: annual,
    });
  }

  const observations: string[] = [];
  const yearLabel = formatHistoricalYear(targetYear);
  if (powerCount > 0) {
    observations.push(`${powerCount} of ${items.length} subjects have authentic Power Numbers active in ${yearLabel}.`);
  }
  for (const [pyRoot, names] of Object.entries(pyMap)) {
    if (names.length > 1) observations.push(`${names.length} subjects (${names.join(', ')}) share Personal Year ${pyRoot} in ${yearLabel}.`);
  }
  if (intensCount > 0) observations.push(`${intensCount} subject(s) exhibit active Intensification (ESS root == PY root) in ${yearLabel}.`);

  return {
    items,
    findings: {
      totalSubjects: items.length,
      subjectsWithPowerNumber: powerCount,
      powerNumberBreakdown: powerMap,
      sharedPersonalYears: pyMap,
      intensificationCount: intensCount,
      observations,
    },
  };
}

export function computeMonthlyStack(
  people: PersonStackInput[],
  targetYear: number,
  targetMonth: number
): {
  items: PersonMonthlyStackItem[];
  findings: StackGroupFindings;
} {
  const items: PersonMonthlyStackItem[] = [];
  const pyMap: Record<number, string[]> = {};
  const powerMap: Record<11 | 13 | 16, number> = { 11: 0, 13: 0, 16: 0 };
  let powerCount = 0;

  for (const person of people) {
    const dob = parseDob(person.dob);
    const age = historicalYearDifference(dob.year, targetYear);
    if (age < 0) continue;

    const timeMap = generateAnnualTimeMap(person.name, person.dob, age, age + 1, 'AGE');
    const annual = timeMap[0];
    const nextAnnual = timeMap[1];
    if (!annual) continue;

    const monthlyMap = generateMonthlyCalendar(annual, nextAnnual);
    const month = monthlyMap[targetMonth - 1];
    if (!month) continue;

    if (month.isPowerMonth) {
      powerCount++;
      for (const pn of month.powerNumbers) powerMap[pn] = (powerMap[pn] || 0) + 1;
    }

    if (!pyMap[month.py.root]) pyMap[month.py.root] = [];
    pyMap[month.py.root].push(person.name);

    items.push({
      personId: person.personId,
      name: person.name,
      dob: person.dob,
      roleInCase: person.roleInCase,
      monthIndex: targetMonth,
      monthName: month.monthName,
      year: targetYear,
      ess: formatCompound(month.ess),
      pme: formatCompound(month.pme),
      mcom: formatCompound(month.mcom),
      pm: formatCompound(month.pm),
      cm: month.cm,
      py: formatCompound(month.py),
      isPowerMonth: month.isPowerMonth,
      powerNumbers: month.powerNumbers,
      rawMonthly: month,
    });
  }

  const observations: string[] = [];
  if (powerCount > 0) {
    observations.push(`${powerCount} of ${items.length} subjects have authentic Power Numbers active in ${monthNames[targetMonth - 1]} ${formatHistoricalYear(targetYear)}.`);
  }

  return {
    items,
    findings: {
      totalSubjects: items.length,
      subjectsWithPowerNumber: powerCount,
      powerNumberBreakdown: powerMap,
      sharedPersonalYears: pyMap,
      intensificationCount: 0,
      observations,
    },
  };
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
