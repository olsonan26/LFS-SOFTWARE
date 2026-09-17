/**
 * @license
 * Lettrology Forensic Science - Deterministic Calculation Engine
 * Section 19: Monthly Chart
 * Section 22: Month-End Crossover
 */

import {
  reduceWithTrail,
  CompoundValue,
  formatCompound,
  formatShortCompound,
} from './compoundTrail.ts';
import { AnnualState } from './annualEngine.ts';

// 19.1 Calendar Month (CM) table:
// Jan=1, Feb=2, Mar=3, Apr=4, May=5, Jun=6, Jul=7, Aug=8, Sep=9, Oct=1, Nov=2, Dec=3
export const CM_TABLE: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 1, // 1+0 = 1
  11: 2, // 1+1 = 2
  12: 3, // 1+2 = 3
};

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface MonthlyState {
  monthIndex: number; // 1..12
  monthName: string;
  year: number;
  cm: number; // reduced calendar month (1..9, Oct=1, Nov=2, Dec=3)
  py: CompoundValue;
  pm: CompoundValue;
  ess: CompoundValue;
  pme: CompoundValue;
  mcom: CompoundValue;
  isPowerMonth: boolean;
  powerNumbers: (11 | 13 | 16)[];
  crossover?: {
    nextMonthName: string;
    currentPmRaw: number;
    nextPmeRaw: number;
    combinedCompound: CompoundValue;
    isPowerNumber: boolean;
  };
}

/**
 * Calculates Calendar Month (CM) value:
 * Reduced month cycle where Oct=1, Nov=2, Dec=3.
 */
export function getCalendarMonthReduced(month: number): number {
  return CM_TABLE[month] || 1;
}

/**
 * Calculates Personal Month (PM) (Section 19.2):
 * Formula: PY root + CM -> preserve raw monthly sum / Power Number -> root.
 * Example with PY 9: Feb (9+2=11/2), Apr (9+4=13/4), Jul (9+7=16/7).
 */
export function calculatePersonalMonth(
  pyRoot: number,
  calendarMonth: number
): CompoundValue {
  const cm = getCalendarMonthReduced(calendarMonth);
  const rawSum = pyRoot + cm;
  return reduceWithTrail(rawSum, {
    rawFormula: `PY root (${pyRoot}) + CM (${cm}) = ${rawSum}`,
  });
}

/**
 * Calculates Personal Month Essence (PME) (Section 19.3):
 * Formula: ESS root + PM active value.
 * PME represents the internal feeling layer.
 */
export function calculatePersonalMonthEssence(
  essRoot: number,
  pm: CompoundValue
): CompoundValue {
  // Use pm.raw if it is a canonical Power Number or if raw preserved, else pm.root
  const pmActive = pm.isPowerNumber ? pm.raw : pm.root;
  const rawSum = essRoot + pmActive;
  return reduceWithTrail(rawSum, {
    rawFormula: `ESS root (${essRoot}) + PM active (${pmActive}) = ${rawSum}`,
  });
}

/**
 * Calculates Monthly Combiner (MCOM) (Section 19.4):
 * Formula: PME + PM.
 * Canonical compound-carry rule:
 * If PME is explicitly 11 (or 22/33 per Peter reference),
 * carry that retained operand into MCOM:
 * Example: Carol Royal: PM 5 + PME 11 = MCOM 16/7.
 */
export function calculateMonthlyCombiner(
  pme: CompoundValue,
  pm: CompoundValue
): CompoundValue {
  // Check if PME has retained Power carry (11, 22, 33)
  const carryPme = pme.raw === 11 || pme.raw === 22 || pme.raw === 33 ? pme.raw : pme.root;
  const carryPm = pm.isPowerNumber ? pm.raw : pm.root;

  const mcomRaw = carryPme + carryPm;
  return reduceWithTrail(mcomRaw, {
    rawFormula: `PME active (${carryPme}) + PM active (${carryPm}) = ${mcomRaw}`,
  });
}

/**
 * Generates the complete 12-month sequence for a given calendar year
 * using the corresponding AnnualState.
 */
export function generateMonthlyCalendar(
  annualState: AnnualState,
  nextAnnualState?: AnnualState
): MonthlyState[] {
  const months: MonthlyState[] = [];

  for (let m = 1; m <= 12; m++) {
    const cm = getCalendarMonthReduced(m);
    const pm = calculatePersonalMonth(annualState.py.root, m);
    const pme = calculatePersonalMonthEssence(annualState.ess.root, pm);
    const mcom = calculateMonthlyCombiner(pme, pm);

    const powerNumbers: (11 | 13 | 16)[] = [];
    if (pm.isPowerNumber && pm.powerNumber) powerNumbers.push(pm.powerNumber);
    if (pme.isPowerNumber && pme.powerNumber && !powerNumbers.includes(pme.powerNumber)) {
      powerNumbers.push(pme.powerNumber);
    }
    if (mcom.isPowerNumber && mcom.powerNumber && !powerNumbers.includes(mcom.powerNumber)) {
      powerNumbers.push(mcom.powerNumber);
    }

    months.push({
      monthIndex: m,
      monthName: MONTH_NAMES[m - 1],
      year: annualState.calendarYear,
      cm,
      py: annualState.py,
      pm,
      ess: annualState.ess,
      pme,
      mcom,
      isPowerMonth: powerNumbers.length > 0,
      powerNumbers,
    });
  }

  // Section 22: Month-End Crossover calculation
  // current PM + next month's PME
  for (let i = 0; i < 12; i++) {
    const current = months[i];
    let nextPme: CompoundValue;
    let nextMonthName: string;

    if (i < 11) {
      nextPme = months[i + 1].pme;
      nextMonthName = months[i + 1].monthName;
    } else {
      // December crossovers into January of next year
      if (nextAnnualState) {
        const janPm = calculatePersonalMonth(nextAnnualState.py.root, 1);
        nextPme = calculatePersonalMonthEssence(nextAnnualState.ess.root, janPm);
        nextMonthName = `Jan ${nextAnnualState.calendarYear}`;
      } else {
        // Approximate with current year's cycle if next year not provided
        nextPme = months[0].pme;
        nextMonthName = 'January';
      }
    }

    const currentPmRaw = current.pm.isPowerNumber ? current.pm.raw : current.pm.root;
    const nextPmeRaw = nextPme.isPowerNumber ? nextPme.raw : nextPme.root;
    const crossoverSum = currentPmRaw + nextPmeRaw;
    const crossoverCompound = reduceWithTrail(crossoverSum, {
      rawFormula: `Current PM (${currentPmRaw}) + Next Month PME (${nextPmeRaw}) = ${crossoverSum}`,
    });

    current.crossover = {
      nextMonthName,
      currentPmRaw,
      nextPmeRaw,
      combinedCompound: crossoverCompound,
      isPowerNumber: crossoverCompound.isPowerNumber,
    };
  }

  return months;
}
