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
} from './compoundTrail.ts';
import {
  buildPersonNameCycles,
  getActiveLettersAtAge,
} from './timelineEngine.ts';
import {
  addHistoricalYears,
  formatHistoricalYear,
  historicalYearDifference,
  parseHistoricalDate,
  previousHistoricalYear,
  type HistoricalEra,
} from '../historicalDate.ts';

export interface AnnualState {
  age: number;
  /** Signed display year: negative = BC, positive = AD. Zero is never emitted. */
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
  /** Signed display year: -44 = 44 BC, 44 = 44 AD. */
  year: number;
  yearNumber: number;
  era: HistoricalEra;
}

export type AnnualRangeMode = 'AUTO' | 'AGE' | 'YEAR';

export function parseDob(dobStr: string): ParsedDob {
  const parsed = parseHistoricalDate(dobStr);
  if (!parsed) {
    return { day: 1, month: 1, year: 1970, yearNumber: 1970, era: 'CE' };
  }
  return {
    day: parsed.day,
    month: parsed.month,
    year: parsed.signedYear,
    yearNumber: parsed.year,
    era: parsed.era,
  };
}

/** Calendar Year: sum the visible year digits and reduce. Era sign is not summed. */
export function calculateCalendarYear(year: number): CompoundValue {
  const digits = Math.abs(year).toString().split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return reduceWithTrail(sum, {
    rawFormula: `CY ${formatHistoricalYear(year)} digits (${digits.join('+')}) = ${sum}`,
  });
}

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

export function calculateEssence(activeLetters: string[]): {
  compound: CompoundValue;
  ordinals: { letter: string; value: number }[];
} {
  const ordinals = activeLetters.map(l => ({ letter: l, value: getOrdinalLetterValue(l) }));
  const rawSum = ordinals.reduce((acc, o) => acc + o.value, 0);
  const formula = ordinals.map(o => `${o.letter}(${o.value})`).join(' + ') + ` = ${rawSum}`;
  return {
    compound: reduceWithTrail(rawSum, { rawFormula: formula }),
    ordinals,
  };
}

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
 * Generates annual states across modern or ancient history.
 *
 * Calendar-year storage uses signed display years (-5 = 5 BC, +6 = 6 AD),
 * but all elapsed-year math uses the no-year-zero historical ordinal axis.
 * Example: 5 BC + 10 years -> 6 AD.
 */
export function generateAnnualTimeMap(
  birthName: string,
  dobStr: string,
  startYearOrAge: number = 0,
  endYearOrAge: number = 100,
  rangeMode: AnnualRangeMode = 'AUTO',
): AnnualState[] {
  const dob = parseDob(dobStr);
  const cycles = buildPersonNameCycles(birthName);
  const states: AnnualState[] = [];

  let startYear: number;
  let endYear: number;
  const autoLooksLikeYear = startYearOrAge < 0 || endYearOrAge < 0 || startYearOrAge > 1800 || endYearOrAge > 1800;
  const useYears = rangeMode === 'YEAR' || (rangeMode === 'AUTO' && autoLooksLikeYear);

  if (useYears) {
    startYear = startYearOrAge;
    endYear = endYearOrAge;
  } else {
    startYear = addHistoricalYears(dob.year, startYearOrAge);
    endYear = addHistoricalYears(dob.year, endYearOrAge);
  }

  if (startYear === 0 || endYear === 0) {
    throw new Error('Historical year 0 does not exist.');
  }

  const span = historicalYearDifference(startYear, endYear);
  if (span < 0) return states;

  for (let offset = 0; offset <= span; offset++) {
    const calendarYear = addHistoricalYears(startYear, offset);
    const elapsedYears = historicalYearDifference(dob.year, calendarYear);
    if (elapsedYears < 0) continue;

    let age: number;
    if (elapsedYears === 0) {
      age = 0;
    } else if (dob.month > 1) {
      age = Math.max(0, elapsedYears - 1);
    } else {
      age = elapsedYears;
    }

    const { firstLetter, middleLetters, surnameLetter, allActiveLetters } =
      getActiveLettersAtAge(cycles, age);

    const { compound: ess, ordinals } = calculateEssence(allActiveLetters);
    const cy = calculateCalendarYear(calendarYear);
    const py = calculatePersonalYear(dob.day, dob.month, cy.root);
    const com = calculateYearlyCombiner(ess.raw, py.raw);
    const isIntensified = ess.root === py.root;

    const powerNumbers: (11 | 13 | 16)[] = [];
    if (ess.isPowerNumber && ess.powerNumber) powerNumbers.push(ess.powerNumber);
    if (py.isPowerNumber && py.powerNumber && !powerNumbers.includes(py.powerNumber)) powerNumbers.push(py.powerNumber);
    if (com.isPowerNumber && com.powerNumber && !powerNumbers.includes(com.powerNumber)) powerNumbers.push(com.powerNumber);

    const previousYear = previousHistoricalYear(calendarYear);
    const prevCY = calculateCalendarYear(previousYear);
    const prevPY = calculatePersonalYear(dob.day, dob.month, prevCY.root);
    const isCycleReset = prevPY.root === 9 && py.root === 1;

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
