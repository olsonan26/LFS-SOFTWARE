/**
 * @license
 * Lettrology Forensic Science - Deterministic Engine Verification Tests
 * PRD Section 43: Regression / Acceptance Tests
 */

import { calculateEssence, calculatePersonalYear, calculateCalendarYear, calculateYearlyCombiner, generateAnnualTimeMap } from './annualEngine.ts';
import { calculatePersonalMonth, calculatePersonalMonthEssence, calculateMonthlyCombiner, getCalendarMonthReduced, generateMonthlyCalendar } from './monthlyEngine.ts';
import { reduceWithTrail, formatCompound } from './compoundTrail.ts';

export interface TestCaseResult {
  testId: string;
  name: string;
  description: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes?: string;
}

export function runAllAcceptanceTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // Test 1: ESS full-position example: A + W + D -> 1 + 23 + 4 = 28/10/1
  try {
    const { compound } = calculateEssence(['A', 'W', 'D']);
    const actualStr = formatCompound(compound);
    results.push({
      testId: 'TEST-001',
      name: 'ESS Full-Alphabet Position Sum (A+W+D)',
      description: 'Verifies ordinal positions (1 + 23 + 4 = 28 -> 10 -> 1)',
      expected: '28/10/1',
      actual: actualStr,
      passed: actualStr === '28/10/1' && compound.root === 1,
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST-001',
      name: 'ESS Full-Alphabet Position Sum (A+W+D)',
      description: 'Verifies ordinal positions (1 + 23 + 4 = 28 -> 10 -> 1)',
      expected: '28/10/1',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 2: Elon advanced 2025 annual example (DOB: 28 June 1971, Full: Elon Reeve Musk)
  try {
    // Elon was born in 1971. In calendar year 2025 (age 53 prior to June 28 birthday):
    // 2025: N E M -> ESS 32/5, PY 43/7, COM 75/12/3, CY 9
    const timeMap = generateAnnualTimeMap('Elon Reeve Musk', '1971-06-28', 2025, 2025);
    const state2025 = timeMap[0];

    const lettersOk = state2025.activeLetters.join(' ') === 'N E M';
    const essOk = formatCompound(state2025.ess) === '32/5';
    const pyOk = formatCompound(state2025.py) === '43/7';
    const comOk = formatCompound(state2025.com) === '75/12/3';
    const cyOk = state2025.cy.root === 9;

    const allPassed = lettersOk && essOk && pyOk && comOk && cyOk;
    const actualSummary = `Letters: ${state2025.activeLetters.join(' ')}, ESS: ${formatCompound(state2025.ess)}, PY: ${formatCompound(state2025.py)}, COM: ${formatCompound(state2025.com)}, CY: ${state2025.cy.root}`;

    results.push({
      testId: 'TEST-002',
      name: 'Elon Musk 2025 Benchmark Fixture',
      description: 'DOB 28 June 1971, 2025: ESS letters N E M, ESS 32/5, PY 43/7, COM 75/12/3, CY 9',
      expected: 'Letters: N E M, ESS: 32/5, PY: 43/7, COM: 75/12/3, CY: 9',
      actual: actualSummary,
      passed: allPassed,
      notes: 'Matches Peter Vaughan manual reference chart exactly.',
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST-002',
      name: 'Elon Musk 2025 Benchmark Fixture',
      description: 'DOB 28 June 1971, 2025 benchmark',
      expected: 'Letters: N E M, ESS: 32/5, PY: 43/7, COM: 75/12/3, CY: 9',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 3: Carol Royal carry example: PM 5 + PME 11 = MCOM 16/7
  try {
    const pme11 = reduceWithTrail(11);
    const pm5 = reduceWithTrail(5);
    const mcom = calculateMonthlyCombiner(pme11, pm5);
    const actualMcom = formatCompound(mcom);

    results.push({
      testId: 'TEST-003',
      name: 'Carol Royal PME 11 Carry in MCOM',
      description: 'PME 11 + PM 5 = MCOM 16/7 with preserved authentic 16 Power Number',
      expected: '16/7 (isPowerNumber: true, powerNumber: 16)',
      actual: `${actualMcom} (isPowerNumber: ${mcom.isPowerNumber}, powerNumber: ${mcom.powerNumber})`,
      passed: actualMcom === '16/7' && mcom.powerNumber === 16,
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST-003',
      name: 'Carol Royal PME 11 Carry in MCOM',
      description: 'PME 11 + PM 5 = MCOM 16/7',
      expected: '16/7',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 4: Monthly Mary-style example: With ESS 4 and PY 9
  // Feb: 9+2=11/2; Apr: 9+4=13/4; Jul: 9+7=16/7
  try {
    const febPm = calculatePersonalMonth(9, 2);
    const aprPm = calculatePersonalMonth(9, 4);
    const julPm = calculatePersonalMonth(9, 7);

    const febOk = formatCompound(febPm) === '11/2' && febPm.powerNumber === 11;
    const aprOk = formatCompound(aprPm) === '13/4' && aprPm.powerNumber === 13;
    const julOk = formatCompound(julPm) === '16/7' && julPm.powerNumber === 16;

    results.push({
      testId: 'TEST-004',
      name: 'Mary Monthly PY 9 Power Months',
      description: 'Verifies appearances of 11 (Feb: 9+2=11/2), 13 (Apr: 9+4=13/4), 16 (Jul: 9+7=16/7)',
      expected: 'Feb: 11/2, Apr: 13/4, Jul: 16/7',
      actual: `Feb: ${formatCompound(febPm)}, Apr: ${formatCompound(aprPm)}, Jul: ${formatCompound(julPm)}`,
      passed: febOk && aprOk && julOk,
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST-004',
      name: 'Mary Monthly PY 9 Power Months',
      description: 'Verifies monthly power numbers',
      expected: 'Feb: 11/2, Apr: 13/4, Jul: 16/7',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 5: Compound Integrity: ESS 19/1 + PY 21/3 = COM 40/4 (NOT 13/4!)
  try {
    const com = calculateYearlyCombiner(19, 21);
    const comStr = formatCompound(com);

    results.push({
      testId: 'TEST-005',
      name: 'Compound Integrity Check (ESS 19 + PY 21)',
      description: '19 + 21 = 40/4; must NEVER reconstruct 13/4 from root 1+3=4',
      expected: '40/4 (powerNumber: undefined)',
      actual: `${comStr} (powerNumber: ${com.powerNumber || 'none'})`,
      passed: comStr === '40/4' && !com.isPowerNumber,
      notes: 'Guards against root reconstruction fallacy.',
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST-005',
      name: 'Compound Integrity Check (ESS 19 + PY 21)',
      description: 'Verifies compound trail integrity',
      expected: '40/4',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 6: Calendar Month Reduced: Oct=1, Nov=2, Dec=3
  try {
    const oct = getCalendarMonthReduced(10);
    const nov = getCalendarMonthReduced(11);
    const dec = getCalendarMonthReduced(12);

    const passed = oct === 1 && nov === 2 && dec === 3;
    results.push({
      testId: 'TEST-006',
      name: 'Calendar Month Reduction (Q4)',
      description: 'Verifies October=1, November=2, December=3',
      expected: 'Oct: 1, Nov: 2, Dec: 3',
      actual: `Oct: ${oct}, Nov: ${nov}, Dec: ${dec}`,
      passed,
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST-006',
      name: 'Calendar Month Reduction (Q4)',
      description: 'Verifies Q4 month reduction',
      expected: 'Oct: 1, Nov: 2, Dec: 3',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  return results;
}
