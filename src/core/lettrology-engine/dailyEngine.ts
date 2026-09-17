/**
 * @license
 * Lettrology Forensic Science - Deterministic Calculation Engine
 * Section 25: Daily Layer
 * Status: APPROVED LEGACY IMPLEMENTATION – REQUIRES FINAL PETER CERTIFICATION BEFORE BEING LABELED CANONICAL
 */

import {
  reduceWithTrail,
  CompoundValue,
  formatCompound,
} from './compoundTrail.ts';
import { MonthlyState } from './monthlyEngine.ts';

export interface DailyState {
  dayNumber: number;
  dateString: string;
  reducedCalendarDay: number;
  environment: CompoundValue;
  feel: CompoundValue;
  dcom: CompoundValue;
  isPowerDay: boolean;
  powerNumbers: (11 | 13 | 16)[];
  provenance: {
    status: 'APPROVED_LEGACY_REQUIRES_PETER_CERTIFICATION';
    version: string;
  };
}

/**
 * Calculates deterministic daily layer for a specific calendar day.
 * Formula:
 * 1. Environment = reduced calendar day + PM
 * 2. Feel = active Environment + PME
 * 3. DCOM / Advice = Feel + Environment
 */
export function calculateDailyState(
  dayNumber: number,
  monthlyState: MonthlyState
): DailyState {
  // 1. Reduced Calendar Day (e.g. 28 -> 2+8=10->1)
  const reducedCalendarDay = reduceWithTrail(dayNumber).root;

  // Active PM value
  const pmActive = monthlyState.pm.isPowerNumber ? monthlyState.pm.raw : monthlyState.pm.root;
  const envRaw = reducedCalendarDay + pmActive;
  const environment = reduceWithTrail(envRaw, {
    rawFormula: `Reduced Day (${reducedCalendarDay}) + PM active (${pmActive}) = ${envRaw}`,
  });

  // 2. Feel = active Environment + PME
  const envActive = environment.isPowerNumber ? environment.raw : environment.root;
  const pmeActive = monthlyState.pme.isPowerNumber ? monthlyState.pme.raw : monthlyState.pme.root;
  const feelRaw = envActive + pmeActive;
  const feel = reduceWithTrail(feelRaw, {
    rawFormula: `Environment active (${envActive}) + PME active (${pmeActive}) = ${feelRaw}`,
  });

  // 3. DCOM / Daily Combiner = Feel + Environment
  const feelActive = feel.isPowerNumber ? feel.raw : feel.root;
  const dcomRaw = feelActive + envActive;
  const dcom = reduceWithTrail(dcomRaw, {
    rawFormula: `Feel active (${feelActive}) + Environment active (${envActive}) = ${dcomRaw}`,
  });

  const powerNumbers: (11 | 13 | 16)[] = [];
  if (environment.isPowerNumber && environment.powerNumber) powerNumbers.push(environment.powerNumber);
  if (feel.isPowerNumber && feel.powerNumber && !powerNumbers.includes(feel.powerNumber)) {
    powerNumbers.push(feel.powerNumber);
  }
  if (dcom.isPowerNumber && dcom.powerNumber && !powerNumbers.includes(dcom.powerNumber)) {
    powerNumbers.push(dcom.powerNumber);
  }

  const monthPadded = monthlyState.monthIndex.toString().padStart(2, '0');
  const dayPadded = dayNumber.toString().padStart(2, '0');
  const dateString = `${monthlyState.year}-${monthPadded}-${dayPadded}`;

  return {
    dayNumber,
    dateString,
    reducedCalendarDay,
    environment,
    feel,
    dcom,
    isPowerDay: powerNumbers.length > 0,
    powerNumbers,
    provenance: {
      status: 'APPROVED_LEGACY_REQUIRES_PETER_CERTIFICATION',
      version: 'legacy-day-v1',
    },
  };
}
