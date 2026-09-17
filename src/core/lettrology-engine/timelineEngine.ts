/**
 * @license
 * Lettrology Forensic Science - Deterministic Calculation Engine
 * Section 11: Name Timeline / Letter-Duration Algorithm
 */

import {
  getBaseLetterValue,
  cleanAlphaString,
  splitNameParts,
} from './letterValues.ts';

export interface NamePartCycle {
  originalWord: string;
  cycleLength: number;
  letterSpans: {
    letter: string;
    duration: number;
    startIndex: number;
    endIndex: number; // inclusive
  }[];
}

/**
 * Builds the deterministic letter-duration cycle for a single word.
 * Each letter repeats for its base (1-9) duration value.
 */
export function buildWordCycle(word: string): NamePartCycle {
  const cleanWord = cleanAlphaString(word);
  if (!cleanWord) {
    return {
      originalWord: word,
      cycleLength: 1,
      letterSpans: [{ letter: ' ', duration: 1, startIndex: 0, endIndex: 0 }],
    };
  }

  const spans: NamePartCycle['letterSpans'] = [];
  let currentIndex = 0;

  for (let i = 0; i < cleanWord.length; i++) {
    const char = cleanWord[i];
    const duration = getBaseLetterValue(char);
    const startIndex = currentIndex;
    const endIndex = currentIndex + duration - 1;

    spans.push({
      letter: char,
      duration,
      startIndex,
      endIndex,
    });

    currentIndex += duration;
  }

  return {
    originalWord: word,
    cycleLength: currentIndex,
    letterSpans: spans,
  };
}

/**
 * Returns the active letter for a word cycle at any given age (0, 1, 2, ...).
 */
export function getActiveLetterAtAge(cycle: NamePartCycle, age: number): string {
  if (cycle.cycleLength === 0 || cycle.letterSpans.length === 0) return '';
  const pos = ((age % cycle.cycleLength) + cycle.cycleLength) % cycle.cycleLength;

  for (const span of cycle.letterSpans) {
    if (pos >= span.startIndex && pos <= span.endIndex) {
      return span.letter;
    }
  }

  return cycle.letterSpans[0].letter;
}

export interface PersonNameCycles {
  fullName: string;
  firstNameCycle: NamePartCycle;
  middleNameCycles: NamePartCycle[];
  surnameCycle: NamePartCycle;
}

/**
 * Parses full birth name into first, middle(s), and surname cycles.
 */
export function buildPersonNameCycles(fullName: string): PersonNameCycles {
  const parts = splitNameParts(fullName);

  if (parts.length === 0) {
    const emptyCycle = buildWordCycle('');
    return {
      fullName,
      firstNameCycle: emptyCycle,
      middleNameCycles: [],
      surnameCycle: emptyCycle,
    };
  }

  if (parts.length === 1) {
    return {
      fullName,
      firstNameCycle: buildWordCycle(parts[0]),
      middleNameCycles: [],
      surnameCycle: buildWordCycle(''),
    };
  }

  const firstName = parts[0];
  const surname = parts[parts.length - 1];
  const middles = parts.slice(1, parts.length - 1);

  return {
    fullName,
    firstNameCycle: buildWordCycle(firstName),
    middleNameCycles: middles.map(buildWordCycle),
    surnameCycle: buildWordCycle(surname),
  };
}

/**
 * Extracts all active letters at a specific age for a person.
 */
export function getActiveLettersAtAge(
  cycles: PersonNameCycles,
  age: number
): {
  firstLetter: string;
  middleLetters: string[];
  surnameLetter: string;
  allActiveLetters: string[];
} {
  const firstLetter = getActiveLetterAtAge(cycles.firstNameCycle, age);
  const middleLetters = cycles.middleNameCycles.map(c => getActiveLetterAtAge(c, age));
  const surnameLetter = getActiveLetterAtAge(cycles.surnameCycle, age);

  const allActiveLetters = [firstLetter, ...middleLetters, surnameLetter].filter(
    l => l.trim().length > 0
  );

  return {
    firstLetter,
    middleLetters,
    surnameLetter,
    allActiveLetters,
  };
}
