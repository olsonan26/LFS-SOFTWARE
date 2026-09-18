export type HistoricalEra = 'BCE' | 'CE';

export interface HistoricalDateParts {
  year: number;
  month: number;
  day: number;
  era: HistoricalEra;
  signedYear: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Historical timeline convention used by LFS:
 * - visible calendar has no year 0
 * - signedYear < 0 means BC/BCE (e.g. -5 = 5 BC)
 * - signedYear > 0 means AD/CE (e.g. 6 = 6 AD)
 *
 * Linear math is done through an ordinal axis where 1 BC -> -1 and 1 AD -> 0.
 * That makes 5 BC + 10 years = 6 AD, matching normal historical counting.
 */
export function historicalYearToOrdinal(signedYear: number): number {
  if (!Number.isFinite(signedYear) || signedYear === 0) {
    throw new Error('Historical year 0 does not exist.');
  }
  return signedYear > 0 ? signedYear - 1 : signedYear;
}

export function ordinalToHistoricalYear(ordinal: number): number {
  if (!Number.isFinite(ordinal)) throw new Error('Invalid historical ordinal.');
  return ordinal >= 0 ? ordinal + 1 : ordinal;
}

export function addHistoricalYears(signedYear: number, delta: number): number {
  return ordinalToHistoricalYear(
    historicalYearToOrdinal(signedYear) + Math.trunc(delta),
  );
}

export function historicalYearDifference(fromYear: number, toYear: number): number {
  return historicalYearToOrdinal(toYear) - historicalYearToOrdinal(fromYear);
}

export function nextHistoricalYear(year: number): number {
  return addHistoricalYears(year, 1);
}

export function previousHistoricalYear(year: number): number {
  return addHistoricalYears(year, -1);
}

export function formatHistoricalYear(signedYear: number): string {
  if (!Number.isFinite(signedYear) || signedYear === 0) return 'Invalid year';
  return `${Math.abs(Math.trunc(signedYear))} ${signedYear < 0 ? 'BC' : 'AD'}`;
}

export function formatHistoricalYearLong(signedYear: number): string {
  if (!Number.isFinite(signedYear) || signedYear === 0) return 'Invalid year';
  return `${Math.abs(Math.trunc(signedYear))} ${signedYear < 0 ? 'BC / BCE' : 'AD / CE'}`;
}

export function toSignedHistoricalYear(year: number, era: HistoricalEra): number {
  const clean = Math.abs(Math.trunc(year));
  if (clean < 1) throw new Error('Historical years begin at 1.');
  return era === 'BCE' ? -clean : clean;
}

export function fromSignedHistoricalYear(signedYear: number): { year: number; era: HistoricalEra } {
  if (!Number.isFinite(signedYear) || signedYear === 0) {
    throw new Error('Historical year 0 does not exist.');
  }
  return {
    year: Math.abs(Math.trunc(signedYear)),
    era: signedYear < 0 ? 'BCE' : 'CE',
  };
}

export function isLeapYear(year: number): boolean {
  const y = Math.abs(Math.trunc(year));
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
}

export function daysInHistoricalMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function isValidHistoricalDate(year: number, month: number, day: number): boolean {
  return (
    Number.isInteger(year) && year >= 1 && year <= 9999 &&
    Number.isInteger(month) && month >= 1 && month <= 12 &&
    Number.isInteger(day) && day >= 1 && day <= daysInHistoricalMonth(year, month)
  );
}

export function serializeHistoricalDate(
  year: number,
  month: number,
  day: number,
  era: HistoricalEra,
): string {
  if (!isValidHistoricalDate(year, month, day)) {
    throw new Error('Invalid historical date.');
  }
  const core = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return era === 'BCE' ? `${core} BC` : core;
}

export function parseHistoricalDate(value: string): HistoricalDateParts | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  const era: HistoricalEra = /\s(?:BCE|BC)$/.test(normalized) ? 'BCE' : 'CE';
  const datePart = normalized.replace(/\s(?:BCE|BC|CE|AD)$/, '').trim();

  let year = 0;
  let month = 0;
  let day = 0;

  const dash = datePart.split('-');
  if (dash.length === 3) {
    if (dash[0].length >= 3) {
      year = Number.parseInt(dash[0], 10);
      month = Number.parseInt(dash[1], 10);
      day = Number.parseInt(dash[2], 10);
    } else {
      day = Number.parseInt(dash[0], 10);
      month = Number.parseInt(dash[1], 10);
      year = Number.parseInt(dash[2], 10);
    }
  } else {
    const slash = datePart.split('/');
    if (slash.length === 3) {
      const first = Number.parseInt(slash[0], 10);
      const second = Number.parseInt(slash[1], 10);
      year = Number.parseInt(slash[2], 10);
      if (first > 12) {
        day = first;
        month = second;
      } else {
        month = first;
        day = second;
      }
    }
  }

  if (!isValidHistoricalDate(year, month, day)) return null;
  return {
    year,
    month,
    day,
    era,
    signedYear: toSignedHistoricalYear(year, era),
  };
}

export function formatHistoricalDate(value: string): string {
  const parsed = parseHistoricalDate(value);
  if (!parsed) return value || 'Date not recorded';
  return `${MONTH_NAMES[parsed.month - 1]} ${parsed.day}, ${parsed.year} ${parsed.era === 'BCE' ? 'BC' : 'AD'}`;
}

export function formatHistoricalMonthYear(signedYear: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${formatHistoricalYear(signedYear)}`;
}

export function parseHistoricalYearInput(value: string): number | null {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, ' ');
  const match = /^(\d{1,4})\s*(BC|BCE|AD|CE)?$/.exec(normalized);
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  if (year < 1 || year > 9999) return null;
  const era = match[2] === 'BC' || match[2] === 'BCE' ? 'BCE' : 'CE';
  return toSignedHistoricalYear(year, era);
}

export function formatReportDob(value: string): string {
  const parsed = parseHistoricalDate(value);
  if (!parsed) return value;
  return `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}/${String(parsed.year).padStart(4, '0')}`;
}
