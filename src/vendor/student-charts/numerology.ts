export type PinChaType =
  | "P1"
  | "P2"
  | "P3"
  | "P4"
  | "C1"
  | "C2"
  | "C3"
  | "C4"
  | "PPP_P"
  | "CCC_C"
  | "PPPP"
  | "CCCC"
  | "PPPP_CCCC";

export type YearsSet = {
  names: string[];
  essence: string;
  combined: string;
  personalYear: string;
  calendarYear: string;
};

export type MonthsSet = {
  essence: string;
  personalYear: string;
  personalMonthEssence: string;
  combined: string;
  personalMonth: string;
};

const separators = /[ \-/\\]/;

export function calcString(input: string, singleRound = false): number {
  let total = 0;
  for (const character of input.toUpperCase()) {
    const code = character.charCodeAt(0);
    if (code >= 65 && code <= 90) total += code - 64;
    else if (code >= 48 && code <= 57) total += code - 48;
  }
  if (singleRound || total <= 9) return total;
  const reduced = total % 9;
  return reduced === 0 ? 9 : reduced;
}

export function calcNumber(input: number, singleRound = false): number {
  if (input <= 0) return 0;
  if (singleRound) {
    let remaining = Math.trunc(input);
    let total = 0;
    do {
      total += remaining % 10;
      remaining = Math.trunc(remaining / 10);
    } while (remaining > 0);
    return total;
  }
  const reduced = input % 9;
  return reduced === 0 ? 9 : reduced;
}

export function full(input: string, length = 0): string {
  let value = calcString(input, true).toString();
  let output = "";
  while (value.length > 1) {
    output += `${value}/`;
    value = calcString(value, true).toString();
  }
  output += value;
  if (length !== 0) {
    while (output.length > length) {
      output = output.replace(/^\/+/, "");
      if (output.length > length) {
        const slash = output.indexOf("/");
        output = slash >= 0 ? output.slice(slash) : "";
      }
    }
  }
  return output === "0" ? "" : output;
}

export function multiFull(input: string, split = separators): string {
  return input
    .split(split)
    .map((part) => {
      const value = full(part, part.length);
      return value + " ".repeat(part.length - value.length);
    })
    .join(" ");
}

export function hdc(input: string, returnType: number): string {
  const vowels = new Set(["A", "E", "I", "O", "U"]);
  let output = "";
  for (const character of input.toUpperCase()) {
    output += vowels.has(character)
      ? returnType === 3
        ? calcString(character).toString()
        : character
      : " ";
  }
  if (returnType === 0 || returnType === 3) return output;
  if (returnType === 1) return full(output);
  return calcString(output).toString();
}

export function letters(input: string): string {
  let output = "";
  for (const character of input.toUpperCase()) {
    const code = character.charCodeAt(0);
    if (code >= 48 && code <= 57) output += character;
    else {
      const value = code - 64;
      output += value < 1 || value > 26 ? " " : calcNumber(value).toString();
    }
  }
  return output;
}

export function countWords(input: string): number {
  return input.split(separators).length;
}

export function getWord(input: string, which: number): string {
  const words = input.split(separators);
  return which <= words.length ? (words[which - 1] ?? "") : "";
}

export function pinCha(input: string, returnType: PinChaType): string {
  if (countWords(input) !== 3) return "";
  const month = calcString(getWord(input, 2));
  const day = calcString(getWord(input, 1));
  const year = calcString(getWord(input, 3));
  const p1 = calcNumber(month + day);
  const p2 = calcNumber(day + year);
  const p3 = calcNumber(p1 + p2);
  const p4 = calcNumber(month + year);
  const c1 = Math.abs(month - day);
  const c2 = Math.abs(day - year);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(month - year);
  const values: Record<PinChaType, string> = {
    P1: p1.toString(),
    P2: p2.toString(),
    P3: p3.toString(),
    P4: p4.toString(),
    C1: c1.toString(),
    C2: c2.toString(),
    C3: c3.toString(),
    C4: c4.toString(),
    PPP_P: `${p1}${p2}${p3}-${p4}`,
    CCC_C: `${c1}${c2}${c3}-${c4}`,
    PPPP: `${p1}${p2}${p3}${p4}`,
    CCCC: `${c1}${c2}${c3}${c4}`,
    PPPP_CCCC: `${p1}${p2}${p3}${p4}-${c1}${c2}${c3}${c4}`,
  };
  return values[returnType];
}

export function repeat(word: string): string {
  let output = "";
  for (const character of word) output += character.repeat(calcString(character));
  return output;
}

export function combine(inputA: string, inputB: string): string {
  const length = Math.min(inputA.length, inputB.length);
  let output = "";
  for (let index = 0; index < length; index += 1) {
    const value = (calcString(inputA[index]) + calcString(inputB[index])) % 9;
    output += value === 0 ? "9" : value.toString();
  }
  return output;
}

export function seasons(dob: string): string[] {
  const transition = 36 - calcString(dob);
  return [
    `0 ~ ${transition}`,
    `${transition + 1} ~ ${transition + 9}`,
    `${transition + 10} ~ ${transition + 18}`,
    `${transition + 19} ~~`,
  ];
}

export function ageFinder(dob: string, currentYear = new Date().getFullYear()): number {
  return currentYear - Number.parseInt(getWord(dob, 3), 10);
}

export function spaceOutString(input: string, skipSpace: boolean, spaces = 1): string {
  let output = "";
  for (const character of input) {
    if (!skipSpace || character !== " ") output += character + " ".repeat(spaces);
  }
  return output;
}

export class Report {
  readonly fullName: string;
  readonly dob: string;
  readonly age: number;
  readonly pmei: string[];
  readonly hdc: string;
  readonly hdcTotal: string;
  readonly birthForce: string;
  readonly fullNameRepeated: string[];
  readonly fullLetters: string;
  readonly fullLettersTotal: string;
  readonly fullLettersTotalPart: string;
  readonly seasons: string[];
  readonly names: string[];
  readonly pin: string;
  readonly cha: string;
  readonly ultimateGoal: string;

  constructor(name: string, dob: string, currentYear = new Date().getFullYear()) {
    this.fullName = name;
    this.dob = dob;
    this.hdc = hdc(name, 3);
    this.fullLetters = letters(name);
    this.hdcTotal = full(this.hdc);
    this.fullLettersTotal = full(this.fullLetters);
    this.fullLettersTotalPart = multiFull(this.fullLetters);

    const occurrences: Record<string, number> = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
    };
    for (const character of this.fullLetters) {
      occurrences[character] = (occurrences[character] ?? 0) + 1;
    }
    this.pmei = [
      `${occurrences["4"]}   ${occurrences["5"]} = ${calcNumber(occurrences["4"] + occurrences["5"])}`,
      `${occurrences["1"]}   ${occurrences["8"]} = ${calcNumber(occurrences["1"] + occurrences["8"])}`,
      `${occurrences["2"]} ${occurrences["3"]} ${occurrences["6"]} = ${calcNumber(occurrences["2"] + occurrences["3"] + occurrences["6"])}`,
      `${occurrences["7"]}   ${occurrences["9"]} = ${calcNumber(occurrences["7"] + occurrences["9"])}`,
    ];
    this.birthForce = `${multiFull(dob)} ${full(dob)}`;
    this.seasons = seasons(dob);
    this.names = [];
    this.fullNameRepeated = [];
    for (let index = 1; index <= countWords(name); index += 1) {
      const word = getWord(name, index);
      this.names.push(word);
      this.fullNameRepeated.push(repeat(word));
    }
    this.pin = pinCha(dob, "PPP_P");
    this.cha = pinCha(dob, "CCC_C");
    this.ultimateGoal = full(this.fullLetters + dob);
    this.age = ageFinder(dob, currentYear);
  }

  getEssence(start: number, length: number): string {
    if (length < 0 || start < 0) throw new Error("Invalid essence range");
    const values = Array<number>(length).fill(0);
    let outputStart = 0;
    let adjustedStart = start;
    if (adjustedStart === 0) {
      outputStart += 1;
      adjustedStart += 1;
    }
    for (const repeatedName of this.fullNameRepeated) {
      const digits = Array.from(repeatedName, (character) => calcString(character));
      let sourceIndex = adjustedStart - 1;
      for (let index = outputStart; index < length; index += 1) {
        values[index] += digits[sourceIndex % digits.length];
        sourceIndex += 1;
      }
    }
    return values.map((value) => calcNumber(value).toString()).join("");
  }

  getPersonalYear(start: number, length: number): string {
    if (length < 0 || start < 0) throw new Error("Invalid personal year range");
    let value = calcNumber(calcString(this.dob) + start);
    let output = "";
    for (let index = 0; index < length; index += 1) {
      output += value;
      value += 1;
      if (value > 9) value = 1;
    }
    return output;
  }

  getCalendarYear(start: number, length: number): string {
    if (length < 0 || start < 0) throw new Error("Invalid calendar year range");
    let value = calcNumber(calcString(getWord(this.dob, 3)) + start);
    let output = "";
    for (let index = 0; index < length; index += 1) {
      output += value;
      value += 1;
      if (value > 9) value = 1;
    }
    return output;
  }

  getYearSet(start: number, length: number): YearsSet {
    if (length < 0 || start < 0) throw new Error("Invalid year range");
    const essence = this.getEssence(start, length);
    const personalYear = this.getPersonalYear(start, length);
    const calendarYear = this.getCalendarYear(start, length);
    const names = this.fullNameRepeated.map((repeatedName) => {
      const offset = start + (start !== 0 ? -1 : 0);
      let value = (start === 0 ? " " : "") + repeatedName.slice(offset % repeatedName.length);
      while (value.length <= length) value += repeatedName;
      return value.slice(0, length).toUpperCase();
    });
    let combined = combine(essence, personalYear);
    if (start === 0) combined = `/${combined.slice(1)}`;
    return { names, essence, personalYear, calendarYear, combined };
  }

  getMonthSet(offset: number): MonthsSet {
    if (offset < 0) throw new Error("Invalid month offset");
    const monthCycle = "123456789123";
    const essence = this.getEssence(offset, 1)[0].repeat(12);
    const personalYear = this.getPersonalYear(offset, 1)[0].repeat(12);
    const personalMonth = combine(personalYear, monthCycle);
    const personalMonthEssence = combine(personalMonth, essence);
    const combined = combine(personalMonthEssence, personalMonth);
    return { essence, personalYear, personalMonth, personalMonthEssence, combined };
  }
}

export function normalizeName(name: string): string {
  return name.trim().replace(/[ \-/\\]+/g, " ");
}

export function normalizeDob(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join("/");
}

export function isValidDob(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    year >= 1000
  );
}
