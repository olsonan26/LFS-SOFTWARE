/**
 * @license
 * Lettrology Forensic Science - Deterministic Calculation Engine
 * Section 12: Essence (ESS)
 * Section 15: Calendar Year (CY)
 * Section 16: Personal Year (PY)
 * Section 17: Yearly Combiner (COM)
 * Section 18: Annual Time-Map
 * Section 21: Pattern Detection Engine - Canonical
 */

import { getOrdinalLetterValue } from './letterValues.ts';
import {
  reduceWithTrail,
  CompoundValue,
  formatCompound,
  formatShortCompound,
} from './compoundTrail.ts';
import {
  buildPersonNameCycles,
  getActiveLettersAtAge,
  PersonNameCycles,
} from './timelineEngine.ts';

export interface AnnualState {
  age: number;
  calendarYear: number;
  firstLetter: string;
  middleLetters: string[];
  surnameLetter: string;
  activeLetters: string[];
  activeLetterOrdinals: { letter: string; value: number }[];
  ess: CompoundValue;
  cy: CompoundValue;
  py: CompoundValue;
  com: CompoundValue;
  isIntensified: boolean;
  isPowerNumber: boolean;
  powerNumbers: (11 | 13 | 16)[];
  isCycleReset: boolean;
  birthdayLapse: {
    nextAge: number;
    nextEssRaw: number;
    combinedRaw: number;
    combinedCompound: CompoundValue;
    isPowerNumber: boolean;
  };
}

export interface ParsedDob {
  day: number;
  month: number;
  year: number;
}

export function parseDob(dobStr: string): ParsedDob {
  let day = 1;
  let month = 1;
  let year = 1970;

  if (dobStr.includes('-')) {
    const segments = dobStr.split('-');
    if (segments[0].length === 4) {
      year = parseInt(segments[0], 10);
      month = parseInt(segments[1], 10);
      day = parseInt(segments[2], 10);
    } else {
      day = parseInt(segments[0], 10);
      month = parseInt(segments[1], 10);
      year = parseInt(segments[2], 10);
    }
  } else if (dobStr.includes('/')) {
    const segments = dobStr.split('/');
    if (segments[2]?.length === 4) {
      // MM/DD/YYYY or DD/MM/YYYY - detect if segments[0] > 12
      const first = parseInt(segments[0], 10);
      const second = parseInt(segments[1], 10);
      year = parseInt(segments[2], 10);
      if (first > 12) {
        day = first;
        month = second;
      } else {
        month = first;
        day = second;
      }
    }
  }

  return { day, month, year };
}

/**
 * Calculates Calendar Year (CY) (Section 15):
 * Sum digits of selected calendar year -> reduce to root.
 * Example: 2025 -> 2+0+2+5 = 9.
 */
export function calculateCalendarYear(year: number): CompoundValue {
  const digits = Math.abs(year).toString().split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return reduceWithTrail(sum, {
    rawFormula: `CY ${year} digits (${digits.join('+')}) = ${sum}`,
  });
}

/**
 * Calculates Personal Year (PY) (Section 16.1):
 * Formula: Birth Day + Birth Month + reduced Calendar Year.
 * Preserve the compound total.
 * Example: 28 June, selected year 2025:
 * Day 28 + Month 6 + reduced CY 9 = 43 -> 7. Display: PY 43/7.
 */
export function calculatePersonalYear(
  birthDay: number,
  birthMonth: number,
  reducedCY: number
): CompoundValue {
  const pyRaw = birthDay + birthMonth + reducedCY;
  return reduceWithTrail(pyRaw, {
    rawFormula: `Birth Day (${birthDay}) + Month (${birthMonth}) + reduced CY (${reducedCY}) = ${pyRaw}`,
  });
}

/**
 * Calculates Essence (ESS) (Section 12):
 * Sum of full alphabet positions A=1..Z=26 for all active letters.
 * Preserve upper compound trail and reduce to lower root.
 * Example: N(14) + E(5) + M(13) = 32 -> 5 (ESS 32/5).
 */
export function calculateEssence(activeLetters: string[]): {
  compound: CompoundValue;
  ordinals: { letter: string; value: number }[];
} {
  const ordinals = activeLetters.map(l => ({
    letter: l,
    value: getOrdinalLetterValue(l),
  }));

  const rawSum = ordinals.reduce((acc, o) => acc + o.value, 0);
  const formula = ordinals.map(o => `${o.letter}(${o.value})`).join(' + ') + ` = ${rawSum}`;

  const compound = reduceWithTrail(rawSum, {
    rawFormula: formula,
  });

  return {
    compound,
    ordinals,
  };
}

/**
 * Calculates Yearly Combiner (COM) (Section 17.1):
 * Formula: ESS stored raw operand + PY stored raw operand.
 * Example: ESS 32 + PY 43 = 75 -> 12 -> 3 (COM 75/12/3).
 */
export function calculateYearlyCombiner(
  essRaw: number,
  pyRaw: number
): CompoundValue {
  const comRaw = essRaw + pyRaw;
  return reduceWithTrail(comRaw, {
    rawFormula: `ESS raw (${essRaw}) + PY raw (${pyRaw}) = ${comRaw}`,
  });
}

/**
 * Generates the full Annual Time-Map for a person from startYear to endYear
 * (or from birthYear to birthYear + maxAge).
 * Each row corresponds to a Calendar Year.
 * For subjects born later in the year (months 2-12), the age at January 1
 * is (calendarYear - birthYear - 1) for year > birthYear, which aligns the pre-birthday
 * active Essence with the calendar year PY.
 */
export function generateAnnualTimeMap(
  birthName: string,
  dobStr: string,
  startYearOrAge: number = 0,
  endYearOrAge: number = 100
): AnnualState[] {
  const dob = parseDob(dobStr);
  const cycles = buildPersonNameCycles(birthName);
  const states: AnnualState[] = [];

  // Determine if caller passed ages (e.g. 0..100) or calendar years (e.g. 1971..2071)
  let startYear: number;
  let endYear: number;

  if (startYearOrAge > 1800) {
    startYear = startYearOrAge;
    endYear = endYearOrAge > 1800 ? endYearOrAge : startYearOrAge + 100;
  } else {
    startYear = dob.year + startYearOrAge;
    endYear = dob.year + endYearOrAge;
  }

  for (let calendarYear = startYear; calendarYear <= endYear; calendarYear++) {
    // Determine active age for this calendar year:
    // On January 1 when CY and PY take effect:
    // If born in months 2..12 (after January 1), age on Jan 1 is calendarYear - dob.year - 1 (min 0)
    // For birth year, age is 0.
    let age: number;
    if (calendarYear === dob.year) {
      age = 0;
    } else if (dob.month > 1) {
      age = Math.max(0, calendarYear - dob.year - 1);
    } else {
      age = Math.max(0, calendarYear - dob.year);
    }

    const { firstLetter, middleLetters, surnameLetter, allActiveLetters } =
      getActiveLettersAtAge(cycles, age);

    // 1. Essence
    const { compound: ess, ordinals } = calculateEssence(allActiveLetters);

    // 2. Calendar Year
    const cy = calculateCalendarYear(calendarYear);

    // 3. Personal Year
    const py = calculatePersonalYear(dob.day, dob.month, cy.root);

    // 4. Yearly Combiner (COM)
    const com = calculateYearlyCombiner(ess.raw, py.raw);

    // 5. Intensification: ESS root == PY root
    const isIntensified = ess.root === py.root;

    // 6. Power Numbers check in ESS, PY, or COM (11, 13, 16)
    const powerNumbers: (11 | 13 | 16)[] = [];
    if (ess.isPowerNumber && ess.powerNumber) powerNumbers.push(ess.powerNumber);
    if (py.isPowerNumber && py.powerNumber && !powerNumbers.includes(py.powerNumber)) {
      powerNumbers.push(py.powerNumber);
    }
    if (com.isPowerNumber && com.powerNumber && !powerNumbers.includes(com.powerNumber)) {
      powerNumbers.push(com.powerNumber);
    }

    // 7. Cycle Reset check (9 -> 1)
    const prevCY = calculateCalendarYear(calendarYear - 1);
    const prevPY = calculatePersonalYear(dob.day, dob.month, prevCY.root);
    const isCycleReset = prevPY.root === 9 && py.root === 1;

    // 8. Birthday-Lapse Diagonal (Section 21.3)
    // After birthday, subject links to next-age ESS while current PY remains active.
    const nextAgeLetters = getActiveLettersAtAge(cycles, age + 1);
    const nextEss = calculateEssence(nextAgeLetters.allActiveLetters);
    const lapseCombinedRaw = py.raw + nextEss.compound.raw;
    const lapseCompound = reduceWithTrail(lapseCombinedRaw, {
      rawFormula: `Current PY raw (${py.raw}) + Next Age ESS raw (${nextEss.compound.raw}) = ${lapseCombinedRaw}`,
    });

    states.push({
      age,
      calendarYear,
      firstLetter,
      middleLetters,
      surnameLetter,
      activeLetters: allActiveLetters,
      activeLetterOrdinals: ordinals,
      ess,
      cy,
      py,
      com,
      isIntensified,
      isPowerNumber: powerNumbers.length > 0,
      powerNumbers,
      isCycleReset,
      birthdayLapse: {
        nextAge: age + 1,
        nextEssRaw: nextEss.compound.raw,
        combinedRaw: lapseCombinedRaw,
        combinedCompound: lapseCompound,
        isPowerNumber: lapseCompound.isPowerNumber,
      },
    });
  }

  return states;
}
