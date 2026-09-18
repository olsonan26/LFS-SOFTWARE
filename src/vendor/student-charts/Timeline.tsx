// Ported from olsonan26/Chartcreation-for-students, commit 7d12ffb23397b9f8ab0dbafb7a41072b9f2fc63a.
// Row order, spacing model and Report calculations retained. Cell annotations are additive.
import { createContext, useContext, type CSSProperties } from 'react';
import { Report, type MonthsSet } from './numerology';
export type CellAnnotation = { title: string; warning: boolean; selected?: boolean };
export const TimelineAnnotations = createContext<Record<string, CellAnnotation[]>>({});
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const PRINT_DOTTED_ROWS = 2;
const EMPTY_MONTH: MonthsSet = { essence: "............", personalYear: "............", personalMonth: "............", personalMonthEssence: "............", combined: "............" };
type PrintTone = "black" | "red" | "blue" | "cyan" | "green";

function PrintCharacterRow({
  value,
  length,
  tone = "black",
  label = "",
}: {
  value: string;
  length: number;
  tone?: PrintTone;
  label?: string;
}) {
  const annotations = useContext(TimelineAnnotations);
  const characters = Array.from(value.padEnd(length, " ").slice(0, length));
  const style = { "--print-columns": length } as CSSProperties;
  return (
    <div className="print-data-row">
      <div className={`print-character-row print-tone-${tone}`} style={style}>
        {characters.map((character, index) => (
          <span key={index} title={annotations[label]?.[index]?.title}
            className={[annotations[label]?.[index]?.warning ? "timeline-pattern-cell" : "", annotations[label]?.[index]?.selected ? "timeline-selected-month" : ""].filter(Boolean).join(" ") || undefined}
            data-pattern={annotations[label]?.[index]?.warning || undefined}
          >{character === " " ? "\u00a0" : character}</span>
        ))}
      </div>
      <span className={`print-row-label print-tone-${tone}`}>{label}</span>
    </div>
  );
}

function ageMarker(start: number, length: number, kind: "tens" | "ones"): string {
  return Array.from({ length }, (_, index) => {
    const age = start + index;
    if (kind === "ones") return String(age % 10);
    return age % 10 === 0 ? String(Math.floor(age / 10) % 10) : " ";
  }).join("");
}

export function PrintYearSection({
  report,
  start,
  length,
  variant,
}: {
  report: Report;
  start: number;
  length: number;
  variant: "focus" | "lifetime";
}) {
  const set = report.getYearSet(start, length);
  const markerIndex = report.age - start;
  const marker = markerIndex >= 0 && markerIndex < length
    ? `${" ".repeat(markerIndex)}*`
    : "";

  return (
    <section className={`print-year-section print-year-${variant}`} aria-label={`${variant} year cycles`}>
      {variant === "focus" && <PrintCharacterRow value={marker} length={length} tone="red" />}
      <PrintCharacterRow value={ageMarker(start, length, "tens")} length={length} />
      <PrintCharacterRow value={ageMarker(start, length, "ones")} length={length} />
      {set.names.map((value, index) => (
        <PrintCharacterRow key={`name-${index}`} value={value} length={length} tone="red" />
      ))}
      {Array.from({ length: PRINT_DOTTED_ROWS }, (_, index) => (
        <PrintCharacterRow key={`dots-${index}`} value={":".repeat(length)} length={length} tone="red" />
      ))}
      <PrintCharacterRow value={set.essence} length={length} tone="blue" label="ESS" />
      <PrintCharacterRow value={set.combined} length={length} tone="cyan" label="COM" />
      <PrintCharacterRow value={set.personalYear} length={length} tone="blue" label="PY" />
      <PrintCharacterRow value={set.calendarYear} length={length} tone="green" label="CY" />
    </section>
  );
}

export function PrintMonthSection({
  report,
  currentYear,
  focusYear,
}: {
  report: Report;
  currentYear: number;
  focusYear: number;
}) {
  const focusAge = report.age + focusYear - currentYear;
  const ages = [focusAge - 1, focusAge, focusAge + 1];
  const sets = ages.map((age) => age < 0 ? EMPTY_MONTH : report.getMonthSet(age));
  const join = (select: (set: MonthsSet) => string) => sets.map(select).join("");
  const birthYear = currentYear - report.age;

  return (
    <section className="print-month-section" aria-label={`Three year monthly cycles centered on ${focusYear}`}>
      <PrintCharacterRow value={join((set) => set.essence)} length={36} tone="red" label="ESS" />
      <PrintCharacterRow value={join((set) => set.personalMonthEssence)} length={36} tone="blue" label="PME" />
      <PrintCharacterRow value={join((set) => set.combined)} length={36} tone="cyan" label="MCOM" />
      <PrintCharacterRow value={join((set) => set.personalMonth)} length={36} tone="blue" label="PM" />
      <PrintCharacterRow value={MONTHS.join("").repeat(3)} length={36} tone="green" label="CM" />
      <PrintCharacterRow value={join((set) => set.personalYear)} length={36} tone="red" label="PY" />
      <div className="print-month-years">
        {ages.map((age) => <span key={age}>{birthYear + age}</span>)}
      </div>
    </section>
  );
}

