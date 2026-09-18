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
} from './compoundTrail.ts';
import { parseHistoricalDate } from '../historicalDate.ts';

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
 * verified birth name and date of birth. Historical BC/BCE dates use the
 * same visible year digits as their source date; the era label itself is not
 * added to the digit sum.
 */
export function calculatePrimaryProfile(
  birthName: string,
  dob: string,
  calledName?: { given: string; surname: string }
): PrimaryFixedProfile {
  const parts = splitNameParts(birthName);
  const firstNameStr = parts[0] || '';
  const fullNameStr = parts.join(' ');

  let firstNameRaw = 0;
  for (const ch of cleanAlphaString(firstNameStr)) firstNameRaw += getBaseLetterValue(ch);
  const firstNameComp = reduceWithTrail(firstNameRaw, {
    rawFormula: `Base 1-9 sum of "${firstNameStr}" = ${firstNameRaw}`,
  });

  let fullNameRaw = 0;
  for (const ch of cleanAlphaString(fullNameStr)) fullNameRaw += getBaseLetterValue(ch);
  const fullNameComp = reduceWithTrail(fullNameRaw, {
    rawFormula: `Base 1-9 sum of all words in "${fullNameStr}" = ${fullNameRaw}`,
  });

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

  const parsedDob = parseHistoricalDate(dob);
  const dayNum = parsedDob?.day ?? 1;
  const monthNum = parsedDob?.month ?? 1;
  const yearNum = parsedDob?.year ?? 1970;

  const dayComp = reduceWithTrail(dayNum, {
    rawFormula: `Calendar Day = ${dayNum}`,
  });

  // Preserve four visible year places for ancient dates. Leading zeroes do not
  // change the sum but keep the formula readable (e.g. 0044 BC).
  const dobDigits = `${dayNum.toString().padStart(2, '0')}${monthNum.toString().padStart(2, '0')}${yearNum.toString().padStart(4, '0')}`;
  let totalBirthDateRaw = 0;
  for (const d of dobDigits) totalBirthDateRaw += parseInt(d, 10);
  const totalBirthDateComp = reduceWithTrail(totalBirthDateRaw, {
    rawFormula: `Sum of DOB digits (${dobDigits.split('').join('+')}) = ${totalBirthDateRaw}`,
  });

  const ultimateGoalRaw = fullNameRaw + totalBirthDateRaw;
  const ultimateGoalComp = reduceWithTrail(ultimateGoalRaw, {
    rawFormula: `Full Name raw (${fullNameRaw}) + Birth Date raw (${totalBirthDateRaw}) = ${ultimateGoalRaw}`,
  });

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
    firstName: { ...firstNameComp, spelling: firstNameStr },
    fullName: { ...fullNameComp, spelling: fullNameStr },
    vowels: { ...vowelsComp, vowelSequence: vowelList.join('') },
    dayOfBirth: { ...dayComp, calendarDay: dayNum },
    totalBirthDate: { ...totalBirthDateComp, rawDigits: dobDigits },
    ultimateGoal: {
      ...ultimateGoalComp,
      fullNameRaw,
      birthDateRaw: totalBirthDateRaw,
    },
    calledName: calledProfile,
  };
}
