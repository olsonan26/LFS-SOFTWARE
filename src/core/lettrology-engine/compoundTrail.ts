/**
 * @license
 * Lettrology Forensic Science - Deterministic Calculation Engine
 * Rule: All important compound trails must be preserved.
 * Canonical Power Numbers in core: 11, 13, 16.
 * Never reconstruct a Power Number from a final root.
 */

export interface CompoundValue {
  raw: number;
  trail: number[];
  root: number;
  isPowerNumber: boolean;
  powerNumber?: 11 | 13 | 16;
  retainedOperand?: number;
  rawFormula?: string;
}

export const CANONICAL_POWER_NUMBERS = [11, 13, 16] as const;
export type CanonicalPowerNumber = typeof CANONICAL_POWER_NUMBERS[number];

/**
 * Deterministically reduces an integer down to a single root digit,
 * while preserving the complete sequence of intermediate reductions.
 * Detects authentic canonical Power Numbers (11, 13, 16) in the trail or raw value.
 */
export function reduceWithTrail(
  num: number,
  options?: {
    stopAtMaster?: boolean;
    rawFormula?: string;
  }
): CompoundValue {
  const cleanNum = Math.abs(Math.floor(num));
  if (cleanNum === 0) {
    return {
      raw: 0,
      trail: [0],
      root: 0,
      isPowerNumber: false,
      rawFormula: options?.rawFormula,
    };
  }

  const trail: number[] = [cleanNum];
  let current = cleanNum;

  // Track if authentic 11, 13, or 16 occurred
  let detectedPower: 11 | 13 | 16 | undefined;
  if (cleanNum === 11 || cleanNum === 13 || cleanNum === 16) {
    detectedPower = cleanNum;
  }

  while (current > 9) {
    const digits = current.toString().split('').map(Number);
    const sum = digits.reduce((acc, d) => acc + d, 0);
    trail.push(sum);
    if (!detectedPower && (sum === 11 || sum === 13 || sum === 16)) {
      detectedPower = sum;
    }
    current = sum;
  }

  return {
    raw: cleanNum,
    trail,
    root: current,
    isPowerNumber: detectedPower !== undefined,
    powerNumber: detectedPower,
    rawFormula: options?.rawFormula,
  };
}

/**
 * Formats a CompoundValue into its standard display string.
 * Example: [75, 12, 3] -> "75/12/3"
 * Example: [32, 5] -> "32/5"
 * Example: [4] -> "4"
 */
export function formatCompound(cv: CompoundValue): string {
  if (!cv || !cv.trail || cv.trail.length === 0) return '0';
  return cv.trail.join('/');
}

/**
 * Formats standard short display: "32/5" or "13/4" or "9"
 */
export function formatShortCompound(cv: CompoundValue): string {
  if (!cv || !cv.trail || cv.trail.length === 0) return '0';
  if (cv.trail.length === 1) return `${cv.root}`;
  return `${cv.raw}/${cv.root}`;
}
