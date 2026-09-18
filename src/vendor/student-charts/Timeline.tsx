// Ported from olsonan26/Chartcreation-for-students, commit 7d12ffb23397b9f8ab0dbafb7a41072b9f2fc63a.
// Row order and spacing model retained. Historical overrides let the canonical
// LFS engine supply BC/AD-aware year/month values without changing the layout.
import { createContext, useContext, type CSSProperties } from 'react';
import { yearTrails, monthTrails } from "./compounds";
import { Report, type MonthsSet, type YearsSet } from './numerology';
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
  trails,
}: {
  value: string;
  length: number;
  tone?: PrintTone;
  label?: string;
  trails?: string[];
}) {
  const annotations = useContext(TimelineAnnotations);
  const characters = Array.from(value.padEnd(length, " ").slice(0, length));
  const style = { "--print-columns": length } as CSSProperties;
  return (
    <div className="print-data-row">
      <div className={`print-character-row print-tone-${tone}`} style={style}>
        {characters.map((character, index) => (
          <span key={index} title={[trails?.[index] ? `${label}: ${trails[index]} (source chart calculation)` : undefined, annotations[label]?.[index]?.title].filter(Boolean).join("\n") || undefined}
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
  yearSetOverride,
  markerAge,
}: {
  report: Report;
  start: number;
  length: number;
  variant: "focus" | "lifetime";
  yearSetOverride?: YearsSet;
  markerAge?: number;
}) {
  const set = yearSetOverride ?? report.getYearSet(start, length);
  const activeMarkerAge = markerAge ?? report.age;
  const markerIndex = activeMarkerAge - start;
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
      <PrintCharacterRow trails={Array.from({length}, (_, i) => yearTrails(report, start + i).ESS)} value={set.essence} length={length} tone="blue" label="ESS" />
      <PrintCharacterRow trails={Array.from({length}, (_, i) => yearTrails(report, start + i).COM)} value={set.combined} length={length} tone="cyan" label="COM" />
      <PrintCharacterRow trails={Array.from({length}, (_, i) => yearTrails(report, start + i).PY)} value={set.personalYear} length={length} tone="blue" label="PY" />
      <PrintCharacterRow trails={Array.from({length}, (_, i) => yearTrails(report, start + i).CY)} value={set.calendarYear} length={length} tone="green" label="CY" />
    </section>
  );
}

export function PrintMonthSection({
  report,
  currentYear,
  focusYear,
  focusAgeOverride,
  setsOverride,
  yearLabelsOverride,
}: {
  report: Report;
  currentYear: number;
  focusYear: number;
  focusAgeOverride?: number;
  setsOverride?: MonthsSet[];
  yearLabelsOverride?: string[];
}) {
  const focusAge = focusAgeOverride ?? (report.age + focusYear - currentYear);
  const ages = [focusAge - 1, focusAge, focusAge + 1];
  const sets = setsOverride ?? ages.map((age) => age < 0 ? EMPTY_MONTH : report.getMonthSet(age));
  const join = (select: (set: MonthsSet) => string) => sets.map(select).join("");
  const birthYear = currentYear - report.age;
  const yearLabels = yearLabelsOverride ?? ages.map(age => String(birthYear + age));

  return (
    <section className="print-month-section" aria-label={`Three year monthly cycles centered on ${yearLabels[1] ?? focusYear}`}>
      <div className="print-month-ages">{ages.map((age, index) => <span key={`${age}-${index}`}>{age < 0 ? "Before birth" : `Age ${age}`}</span>)}</div>
      <PrintCharacterRow value={join((set) => set.essence)} length={36} tone="red" trails={ages.flatMap(age => Array.from({length:12}, (_, i) => monthTrails(report, Math.max(0, age), i+1).ESS))} label="ESS" />
      <PrintCharacterRow value={join((set) => set.personalMonthEssence)} length={36} tone="blue" trails={ages.flatMap(age => Array.from({length:12}, (_, i) => monthTrails(report, Math.max(0, age), i+1).PME))} label="PME" />
      <PrintCharacterRow value={join((set) => set.combined)} length={36} tone="cyan" trails={ages.flatMap(age => Array.from({length:12}, (_, i) => monthTrails(report, Math.max(0, age), i+1).MCOM))} label="MCOM" />
      <PrintCharacterRow value={join((set) => set.personalMonth)} length={36} tone="blue" trails={ages.flatMap(age => Array.from({length:12}, (_, i) => monthTrails(report, Math.max(0, age), i+1).PM))} label="PM" />
      <PrintCharacterRow value={MONTHS.join("").repeat(3)} length={36} tone="green" label="CM" />
      <PrintCharacterRow value={join((set) => set.personalYear)} length={36} tone="red" trails={ages.flatMap(age => Array.from({length:12}, (_, i) => monthTrails(report, Math.max(0, age), i+1).PY))} label="PY" />
      <div className="print-month-years">
        {yearLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
      </div>
    </section>
  );
}
