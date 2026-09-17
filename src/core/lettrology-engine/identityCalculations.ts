/**
 * @license
 * Lettrology Forensic Science - Deterministic Calculation Engine
 * Section 13: Six Primary Fixed Numbers
 * Section 14: Called Name & Called Name Ultimate Goal
 */

import {
  getBaseLetterValue,
  isVowel,
  splitNameParts,
  cleanAlphaString,
} from './letterValues.ts';
import {
  reduceWithTrail,
  CompoundValue,
  formatCompound,
} from './compoundTrail.ts';

export interface PrimaryFixedProfile {
  firstName: CompoundValue & { spelling: string };
  fullName: CompoundValue & { spelling: string };
  vowels: CompoundValue & { vowelSequence: string };
  dayOfBirth: CompoundValue & { calendarDay: number };
  totalBirthDate: CompoundValue & { rawDigits: string };
  ultimateGoal: CompoundValue & {
    fullNameRaw: number;
    birthDateRaw: number;
  };
  calledName?: CalledNameProfile;
}

export interface CalledNameProfile {
  calledGivenName: string;
  calledSurname: string;
  givenComponent: CompoundValue;
  surnameComponent: CompoundValue;
  combinedCalledName: CompoundValue;
  calledVowels: CompoundValue & { vowelSequence: string };
  calledUltimateGoal: CompoundValue & {
    calledRoot: number;
    birthDateRoot: number;
  };
}

/**
 * Calculates the six primary fixed numbers for an individual from their
 * verified birth name and date of birth.
 *
 * @param birthName Full legal/birth name (e.g. "Elon Reeve Musk")
 * @param dob Date of birth in YYYY-MM-DD or DD-MM-YYYY format
 * @param calledName Optional socially used name (e.g. "Elon Musk" or "Bob Smith")
 */
export function calculatePrimaryProfile(
  birthName: string,
  dob: string,
  calledName?: { given: string; surname: string }
): PrimaryFixedProfile {
  const parts = splitNameParts(birthName);
  const firstNameStr = parts[0] || '';
  const fullNameStr = parts.join(' ');

  // 1. First Name (base 1-9 values)
  let firstNameRaw = 0;
  for (const ch of cleanAlphaString(firstNameStr)) {
    firstNameRaw += getBaseLetterValue(ch);
  }
  const firstNameComp = reduceWithTrail(firstNameRaw, {
    rawFormula: `Base 1-9 sum of "${firstNameStr}" = ${firstNameRaw}`,
  });

  // 2. Full Name (base 1-9 values across all parts)
  let fullNameRaw = 0;
  for (const ch of cleanAlphaString(fullNameStr)) {
    fullNameRaw += getBaseLetterValue(ch);
  }
  const fullNameComp = reduceWithTrail(fullNameRaw, {
    rawFormula: `Base 1-9 sum of all words in "${fullNameStr}" = ${fullNameRaw}`,
  });

  // 3. Vowels / Heart's Desire (A, E, I, O, U in full name)
  let vowelsRaw = 0;
  const vowelList: string[] = [];
  for (const ch of cleanAlphaString(fullNameStr)) {
    if (isVowel(ch)) {
      vowelsRaw += getBaseLetterValue(ch);
      vowelList.push(ch);
    }
  }
  const vowelsComp = reduceWithTrail(vowelsRaw, {
    rawFormula: `Vowels (${vowelList.join('+')}) = ${vowelsRaw}`,
  });

  // 4. Day of Birth
  // Parse date components safely
  let dayNum = 1;
  let monthNum = 1;
  let yearNum = 1970;

  if (dob.includes('-')) {
    const segments = dob.split('-');
    if (segments[0].length === 4) {
      // YYYY-MM-DD
      yearNum = parseInt(segments[0], 10);
      monthNum = parseInt(segments[1], 10);
      dayNum = parseInt(segments[2], 10);
    } else {
      // DD-MM-YYYY
      dayNum = parseInt(segments[0], 10);
      monthNum = parseInt(segments[1], 10);
      yearNum = parseInt(segments[2], 10);
    }
  }

  const dayComp = reduceWithTrail(dayNum, {
    rawFormula: `Calendar Day = ${dayNum}`,
  });

  // 5. Total Birth Date / Birth Force
  // Add every single digit of the complete DOB
  const dobDigits = `${dayNum.toString().padStart(2, '0')}${monthNum.toString().padStart(2, '0')}${yearNum.toString()}`;
  let totalBirthDateRaw = 0;
  for (const d of dobDigits) {
    totalBirthDateRaw += parseInt(d, 10);
  }
  const totalBirthDateComp = reduceWithTrail(totalBirthDateRaw, {
    rawFormula: `Sum of DOB digits (${dobDigits.split('').join('+')}) = ${totalBirthDateRaw}`,
  });

  // 6. Ultimate Goal: raw Full Birth Name total + raw Total Birth Date total
  const ultimateGoalRaw = fullNameRaw + totalBirthDateRaw;
  const ultimateGoalComp = reduceWithTrail(ultimateGoalRaw, {
    rawFormula: `Full Name raw (${fullNameRaw}) + Birth Date raw (${totalBirthDateRaw}) = ${ultimateGoalRaw}`,
  });

  // Optional: Called Name calculations (Section 14)
  let calledProfile: CalledNameProfile | undefined;
  if (calledName && (calledName.given || calledName.surname)) {
    const givenClean = cleanAlphaString(calledName.given);
    const surnameClean = cleanAlphaString(calledName.surname);

    let givenRaw = 0;
    for (const ch of givenClean) givenRaw += getBaseLetterValue(ch);
    const givenComp = reduceWithTrail(givenRaw);

    let surnameRaw = 0;
    for (const ch of surnameClean) surnameRaw += getBaseLetterValue(ch);
    const surnameComp = reduceWithTrail(surnameRaw);

    const combinedRaw = givenComp.root + surnameComp.root;
    const combinedComp = reduceWithTrail(combinedRaw, {
      rawFormula: `Given root (${givenComp.root}) + Surname root (${surnameComp.root}) = ${combinedRaw}`,
    });

    let calledVowelsRaw = 0;
    const calledVowelList: string[] = [];
    for (const ch of `${givenClean}${surnameClean}`) {
      if (isVowel(ch)) {
        calledVowelsRaw += getBaseLetterValue(ch);
        calledVowelList.push(ch);
      }
    }
    const calledVowelsComp = reduceWithTrail(calledVowelsRaw);

    // Section 14.3: Called Name root + Total Birth Date root = Called Name Ultimate Goal
    const calledUGCombinedRaw = combinedComp.root + totalBirthDateComp.root;
    const calledUGComp = reduceWithTrail(calledUGCombinedRaw, {
      rawFormula: `Called Name root (${combinedComp.root}) + Birth Force root (${totalBirthDateComp.root}) = ${calledUGCombinedRaw}`,
    });

    calledProfile = {
      calledGivenName: calledName.given,
      calledSurname: calledName.surname,
      givenComponent: givenComp,
      surnameComponent: surnameComp,
      combinedCalledName: combinedComp,
      calledVowels: {
        ...calledVowelsComp,
        vowelSequence: calledVowelList.join(''),
      },
      calledUltimateGoal: {
        ...calledUGComp,
        calledRoot: combinedComp.root,
        birthDateRoot: totalBirthDateComp.root,
      },
    };
  }

  return {
    firstName: {
      ...firstNameComp,
      spelling: firstNameStr,
    },
    fullName: {
      ...fullNameComp,
      spelling: fullNameStr,
    },
    vowels: {
      ...vowelsComp,
      vowelSequence: vowelList.join(''),
    },
    dayOfBirth: {
      ...dayComp,
      calendarDay: dayNum,
    },
    totalBirthDate: {
      ...totalBirthDateComp,
      rawDigits: dobDigits,
    },
    ultimateGoal: {
      ...ultimateGoalComp,
      fullNameRaw,
      birthDateRaw: totalBirthDateRaw,
    },
    calledName: calledProfile,
  };
}
