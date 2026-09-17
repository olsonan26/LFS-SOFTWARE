/**
 * @license
 * Lettrology Forensic Science - Deterministic Calculation Engine
 * Section 20: Power Numbers (11, 13, 16)
 * Section 21: Pattern Detection Engine - Canonical
 * Section 23: Experimental Research Patterns
 * Section 24: Forensic Focus Mode Arithmetic Breakdown
 */

import {
  CompoundValue,
  reduceWithTrail,
  formatCompound,
  formatShortCompound,
} from './compoundTrail.ts';
import { AnnualState } from './annualEngine.ts';
import { MonthlyState } from './monthlyEngine.ts';

export interface ForensicArithmeticLine {
  label: string;
  category: 'CANONICAL' | 'EXPERIMENTAL';
  operands: string;
  rawSum: number;
  compoundTrail: string;
  root: number;
  isPowerNumber: boolean;
  powerNumber?: 11 | 13 | 16;
  notes?: string;
}

export interface ForensicSignatureBreakdown {
  date: string;
  subjectName: string;
  canonicalLines: ForensicArithmeticLine[];
  experimentalLines: ForensicArithmeticLine[];
  summaryObservations: string[];
}

export const POWER_NUMBER_DESCRIPTIONS: Record<11 | 13 | 16, { title: string; description: string }> = {
  11: {
    title: 'Power Number 11',
    description:
      'Unexpected developments, heightened conditions, potential oversight, or illuminated pivot points depending on chart position.',
  },
  13: {
    title: 'Power Number 13',
    description:
      'Major transition, disruption, accident hazard requiring deliberate planning, structural reorganization, or major breakthrough under stress.',
  },
  16: {
    title: 'Power Number 16',
    description:
      'Intense emotional/passion dynamics, lessons, sudden shifts, vulnerability, and wisdom forged through direct trial.',
  },
};

/**
 * Generates the full arithmetic breakdown for Forensic Focus mode.
 * Discloses every operand, intermediate sum, trail, and root.
 */
export function generateForensicSignature(
  subjectName: string,
  eventDate: string,
  annual: AnnualState,
  monthly: MonthlyState,
  eventTimeStr?: string
): ForensicSignatureBreakdown {
  const canonical: ForensicArithmeticLine[] = [];
  const experimental: ForensicArithmeticLine[] = [];
  const observations: string[] = [];

  // Canonical Line 1: ESS
  canonical.push({
    label: 'ESS (Essence)',
    category: 'CANONICAL',
    operands: annual.activeLetters.join(' + ') + ' (' + annual.activeLetterOrdinals.map(o => `${o.letter}=${o.value}`).join(', ') + ')',
    rawSum: annual.ess.raw,
    compoundTrail: formatCompound(annual.ess),
    root: annual.ess.root,
    isPowerNumber: annual.ess.isPowerNumber,
    powerNumber: annual.ess.powerNumber,
    notes: 'Internal state and personal focus for the annual cycle',
  });

  // Canonical Line 2: PY
  canonical.push({
    label: 'PY (Personal Year)',
    category: 'CANONICAL',
    operands: annual.py.rawFormula || `Day + Month + reduced CY (${annual.cy.root})`,
    rawSum: annual.py.raw,
    compoundTrail: formatCompound(annual.py),
    root: annual.py.root,
    isPowerNumber: annual.py.isPowerNumber,
    powerNumber: annual.py.powerNumber,
    notes: 'Environmental cycle and external conditions during the year',
  });

  // Canonical Line 3: COM
  canonical.push({
    label: 'COM (Yearly Combiner)',
    category: 'CANONICAL',
    operands: `ESS raw (${annual.ess.raw}) + PY raw (${annual.py.raw})`,
    rawSum: annual.com.raw,
    compoundTrail: formatCompound(annual.com),
    root: annual.com.root,
    isPowerNumber: annual.com.isPowerNumber,
    powerNumber: annual.com.powerNumber,
    notes: 'Synthesized outcome and interaction of internal state and external conditions',
  });

  // Canonical Line 4: PM
  canonical.push({
    label: 'PM (Personal Month)',
    category: 'CANONICAL',
    operands: `PY root (${annual.py.root}) + CM (${monthly.cm})`,
    rawSum: monthly.pm.raw,
    compoundTrail: formatCompound(monthly.pm),
    root: monthly.pm.root,
    isPowerNumber: monthly.pm.isPowerNumber,
    powerNumber: monthly.pm.powerNumber,
    notes: `Monthly environmental tier (${monthly.monthName})`,
  });

  // Canonical Line 5: PME
  canonical.push({
    label: 'PME (Personal Month Essence)',
    category: 'CANONICAL',
    operands: `ESS root (${annual.ess.root}) + PM active (${monthly.pm.isPowerNumber ? monthly.pm.raw : monthly.pm.root})`,
    rawSum: monthly.pme.raw,
    compoundTrail: formatCompound(monthly.pme),
    root: monthly.pme.root,
    isPowerNumber: monthly.pme.isPowerNumber,
    powerNumber: monthly.pme.powerNumber,
    notes: 'Monthly internal feeling and psychological orientation',
  });

  // Canonical Line 6: MCOM
  canonical.push({
    label: 'MCOM (Monthly Combiner)',
    category: 'CANONICAL',
    operands: `PME active (${monthly.pme.raw === 11 ? 11 : monthly.pme.root}) + PM active (${monthly.pm.isPowerNumber ? monthly.pm.raw : monthly.pm.root})`,
    rawSum: monthly.mcom.raw,
    compoundTrail: formatCompound(monthly.mcom),
    root: monthly.mcom.root,
    isPowerNumber: monthly.mcom.isPowerNumber,
    powerNumber: monthly.mcom.powerNumber,
    notes: 'Actionable guidance and monthly event synthesis',
  });

  // Canonical Line 7: Birthday-Lapse Diagonal
  canonical.push({
    label: 'Birthday-Lapse Diagonal',
    category: 'CANONICAL',
    operands: `Current PY raw (${annual.py.raw}) + Next Age ESS raw (${annual.birthdayLapse.nextEssRaw})`,
    rawSum: annual.birthdayLapse.combinedRaw,
    compoundTrail: formatCompound(annual.birthdayLapse.combinedCompound),
    root: annual.birthdayLapse.combinedCompound.root,
    isPowerNumber: annual.birthdayLapse.combinedCompound.isPowerNumber,
    powerNumber: annual.birthdayLapse.combinedCompound.powerNumber,
    notes: 'Transition layer active after birthday lapses into next age essence',
  });

  // Canonical Line 8: Month Crossover (if available)
  if (monthly.crossover) {
    canonical.push({
      label: 'Month-End Crossover',
      category: 'CANONICAL',
      operands: `Current PM (${monthly.crossover.currentPmRaw}) + Next Month PME (${monthly.crossover.nextPmeRaw})`,
      rawSum: monthly.crossover.combinedCompound.raw,
      compoundTrail: formatCompound(monthly.crossover.combinedCompound),
      root: monthly.crossover.combinedCompound.root,
      isPowerNumber: monthly.crossover.combinedCompound.isPowerNumber,
      powerNumber: monthly.crossover.combinedCompound.powerNumber,
      notes: `Bridging period connecting into ${monthly.crossover.nextMonthName}`,
    });
  }

  // Experimental Research Patterns (Section 23) - Visually labeled EXPERIMENTAL
  // 1. Month + ESS
  const expMonthEssSum = monthly.monthIndex + annual.ess.root;
  const expMonthEss = reduceWithTrail(expMonthEssSum);
  experimental.push({
    label: 'Month + ESS [Experimental]',
    category: 'EXPERIMENTAL',
    operands: `Calendar Month (${monthly.monthIndex}) + ESS root (${annual.ess.root})`,
    rawSum: expMonthEssSum,
    compoundTrail: formatCompound(expMonthEss),
    root: expMonthEss.root,
    isPowerNumber: expMonthEss.isPowerNumber,
    powerNumber: expMonthEss.powerNumber,
    notes: 'Hypothetical timing trigger under testing; not canonical.',
  });

  // 2. ESS + MCOM
  const expEssMcomSum = annual.ess.root + monthly.mcom.root;
  const expEssMcom = reduceWithTrail(expEssMcomSum);
  experimental.push({
    label: 'ESS + MCOM [Experimental]',
    category: 'EXPERIMENTAL',
    operands: `ESS root (${annual.ess.root}) + MCOM root (${monthly.mcom.root})`,
    rawSum: expEssMcomSum,
    compoundTrail: formatCompound(expEssMcom),
    root: expEssMcom.root,
    isPowerNumber: expEssMcom.isPowerNumber,
    powerNumber: expEssMcom.powerNumber,
    notes: 'Secondary interaction layer under research investigation.',
  });

  // 3. PME + MCOM
  const expPmeMcomSum = monthly.pme.root + monthly.mcom.root;
  const expPmeMcom = reduceWithTrail(expPmeMcomSum);
  experimental.push({
    label: 'PME + MCOM [Experimental]',
    category: 'EXPERIMENTAL',
    operands: `PME root (${monthly.pme.root}) + MCOM root (${monthly.mcom.root})`,
    rawSum: expPmeMcomSum,
    compoundTrail: formatCompound(expPmeMcom),
    root: expPmeMcom.root,
    isPowerNumber: expPmeMcom.isPowerNumber,
    powerNumber: expPmeMcom.powerNumber,
    notes: 'Feeling-action tension index; experimental research only.',
  });

  // 4. Time Sum (if incident time provided)
  if (eventTimeStr) {
    const timeDigits = eventTimeStr.replace(/[^0-9]/g, '').split('').map(Number);
    if (timeDigits.length > 0) {
      const timeSum = timeDigits.reduce((a, b) => a + b, 0);
      const timeComp = reduceWithTrail(timeSum);
      experimental.push({
        label: 'Event Time Sum [Experimental]',
        category: 'EXPERIMENTAL',
        operands: `Time digits "${eventTimeStr}" = ${timeSum}`,
        rawSum: timeSum,
        compoundTrail: formatCompound(timeComp),
        root: timeComp.root,
        isPowerNumber: timeComp.isPowerNumber,
        powerNumber: timeComp.powerNumber,
        notes: 'Chronometric signature for timestamped incident records.',
      });
    }
  }

  // Summary observations (strictly neutral research phrasing per PRD Section 49)
  if (annual.isIntensified) {
    observations.push(
      `Intensification active: ESS root (${annual.ess.root}) matches PY root (${annual.py.root}), indicating amplified focal themes during this year.`
    );
  }

  const powersFound = canonical
    .filter(c => c.isPowerNumber && c.powerNumber)
    .map(c => `${c.label} (${c.powerNumber})`);

  if (powersFound.length > 0) {
    observations.push(
      `Canonical Power Number presence detected in: ${powersFound.join(', ')}.`
    );
  }

  return {
    date: eventDate,
    subjectName,
    canonicalLines: canonical,
    experimentalLines: experimental,
    summaryObservations: observations,
  };
}
