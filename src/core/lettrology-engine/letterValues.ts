/**
 * @license
 * Lettrology Forensic Science - Deterministic Calculation Engine
 * Rule: Two distinct letter-value concepts
 * A. Base / duration value: repeating 1-9 (A=1..I=9, J=1..R=9, S=1..Z=8)
 * B. Full alphabet position: A=1..Z=26
 */

// Base duration values (1 to 9 repeating)
export const BASE_LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

// Full alphabet positions (A=1 through Z=26)
export const ORDINAL_LETTER_VALUES: Record<string, number> = {
  A: 1,  B: 2,  C: 3,  D: 4,  E: 5,  F: 6,  G: 7,  H: 8,  I: 9,
  J: 10, K: 11, L: 12, M: 13, N: 14, O: 15, P: 16, Q: 17, R: 18,
  S: 19, T: 20, U: 21, V: 22, W: 23, X: 24, Y: 25, Z: 26,
};

// Canonical vowels: A, E, I, O, U. Y is consonant in core canonical rules.
export const CANONICAL_VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export function cleanAlphaString(input: string): string {
  return input.toUpperCase().replace(/[^A-Z]/g, '');
}

export function splitNameParts(fullName: string): string[] {
  return fullName
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .map(cleanAlphaString)
    .filter(p => p.length > 0);
}

export function getBaseLetterValue(char: string): number {
  const c = char.toUpperCase();
  return BASE_LETTER_VALUES[c] || 0;
}

export function getOrdinalLetterValue(char: string): number {
  const c = char.toUpperCase();
  return ORDINAL_LETTER_VALUES[c] || 0;
}

export function isVowel(char: string): boolean {
  return CANONICAL_VOWELS.has(char.toUpperCase());
}
