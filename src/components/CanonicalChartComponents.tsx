/**
 * @license
 * Lettrology Forensic Science - Canonical Annual & Monthly Chart Components
 * Exact implementation from the canonical formula reference
 * Identifies and highlights 11, 13, and 16 Power Numbers
 * Light theme, zero "Aionis" branding
 */

import React, { useState } from "react";
import {
  Report,
  YearsSet,
  MonthsSet,
  detectPowerNumber,
} from "../core/lettrology-engine/canonicalReport.ts";
import { Zap, Sparkles, ChevronLeft, ChevronRight, Info } from "lucide-react";

const MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const PRINT_DOTTED_ROWS = 2;

function ageMarker(start: number, length: number, kind: "tens" | "ones"): string {
  return Array.from({ length }, (_, index) => {
    const age = start + index;
    if (kind === "ones") return String(age % 10);
    return age % 10 === 0 ? String(Math.floor(age / 10) % 10) : " ";
  }).join("");
}

interface YearGridProps {
  report: Report;
  start: number;
  length: number;
  includeNames?: boolean;
  label?: string;
  showPowerNumbers?: boolean;
}

export const CanonicalYearGrid: React.FC<YearGridProps> = ({
  report,
  start,
  length,
  includeNames = true,
  label = "Annual Timeline Grid",
  showPowerNumbers = true,
}) => {
  const set: YearsSet = report.getYearSet(start, length);
  const ages = Array.from({ length }, (_, index) => start + index);
  const powerAnalysis = report.getAnnualPowerAnalysis(start, length);

  const rows = [
    ...(includeNames
      ? set.names.map((value, index) => ({
          label: report.names[index] || `Name ${index + 1}`,
          value,
          tone: "name",
          rowType: "name" as const,
        }))
      : []),
    { label: "Essence", value: set.essence, tone: "essence", rowType: "essence" as const },
    { label: "Combined", value: set.combined, tone: "combined", rowType: "combined" as const },
    { label: "Personal", value: set.personalYear, tone: "personal", rowType: "personal" as const },
    { label: "Calendar", value: set.calendarYear, tone: "calendar", rowType: "calendar" as const },
  ];

  // Count power numbers in this span
  const powerCount = powerAnalysis.reduce((acc, a) => acc + a.allPowers.length, 0);

  return (
    <div className="space-y-3">
      {/* Power Number Quick Summary Banner */}
      {showPowerNumbers && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-xs">
          <div className="flex items-center gap-2 font-black text-slate-900">
            <Zap className="w-4 h-4 text-red-600" />
            <span>Power Numbers Identified: {powerCount} instances of 11, 13, and 16</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 border border-red-400 font-bold text-red-950">
              <span className="w-2 h-2 rounded-full bg-red-600"></span> 11, 13, 16 Highlighted
            </span>
            <span className="text-slate-600 font-bold">
              Current Age: <strong className="text-slate-950">{report.age}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Grid container */}
      <div
        className="w-full overflow-x-auto border-2 border-slate-300 rounded-lg bg-white shadow-sm"
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        <div
          className="grid font-mono text-xs select-none"
          style={{
            gridTemplateColumns: `90px repeat(${length}, minmax(32px, 1fr))`,
            minWidth: `${90 + length * 32}px`,
          }}
        >
          {/* Header row: Age */}
          <div className="sticky left-0 z-20 bg-slate-100 p-2 font-black text-slate-800 border-r-2 border-b-2 border-slate-300 uppercase tracking-wider text-[11px] flex items-center">
            Age
          </div>
          {ages.map((age) => {
            const isCurrent = age === report.age;
            return (
              <div
                key={`age-${age}`}
                className={`p-2 text-center font-black border-r border-b-2 border-slate-200 transition-colors ${
                  isCurrent
                    ? "bg-amber-100 text-slate-950 border-b-amber-600 ring-2 ring-inset ring-amber-400"
                    : "bg-slate-50 text-slate-700"
                }`}
                title={isCurrent ? `Current Age: ${age}` : `Age ${age}`}
              >
                {age}
                {isCurrent && <span className="block text-[9px] text-amber-900 font-black">●</span>}
              </div>
            );
          })}

          {/* Data rows */}
          {rows.map((row) => (
            <React.Fragment key={row.label}>
              {/* Row Label */}
              <div
                className={`sticky left-0 z-10 p-2 font-black border-r-2 border-b border-slate-300 bg-white flex items-center ${
                  row.rowType === "name"
                    ? "text-red-950 uppercase text-[10px]"
                    : row.rowType === "essence"
                    ? "text-blue-950"
                    : row.rowType === "combined"
                    ? "text-teal-950 font-black"
                    : row.rowType === "personal"
                    ? "text-blue-900"
                    : "text-emerald-950"
                }`}
              >
                {row.label}
              </div>

              {/* Row Cells */}
              {Array.from(row.value).map((val, idx) => {
                const age = ages[idx];
                const isCurrentCol = age === report.age;
                const analysis = powerAnalysis[idx];

                let isPowerCell = false;
                let powerTooltip = "";

                if (showPowerNumbers && analysis) {
                  if (row.rowType === "essence" && analysis.essencePower) {
                    isPowerCell = true;
                    powerTooltip = `Essence Power ${analysis.essencePower.powerNumber} (raw sum ${analysis.essencePower.rawSum})`;
                  } else if (row.rowType === "combined" && analysis.comPower) {
                    isPowerCell = true;
                    powerTooltip = `Combined Power ${analysis.comPower.powerNumber} (sum ${analysis.comPower.rawSum})`;
                  } else if (row.rowType === "personal" && analysis.pyPower) {
                    isPowerCell = true;
                    powerTooltip = `Personal Year Power ${analysis.pyPower.powerNumber} (raw ${analysis.pyPower.rawSum})`;
                  }
                }

                return (
                  <div
                    key={`${row.label}-${idx}`}
                    className={`p-2 text-center border-r border-b border-slate-200 font-bold transition-colors ${
                      isCurrentCol ? "bg-amber-50/70" : "bg-white"
                    } ${
                      row.rowType === "name"
                        ? "text-red-950 font-black"
                        : row.rowType === "essence"
                        ? "text-blue-950"
                        : row.rowType === "combined"
                        ? "text-teal-950 font-black"
                        : row.rowType === "personal"
                        ? "text-blue-900 font-bold"
                        : "text-emerald-950"
                    }`}
                    title={powerTooltip || undefined}
                  >
                    {isPowerCell ? (
                      <span className="inline-block px-1 rounded bg-red-100 text-red-950 font-black border border-red-400">
                        {val}
                      </span>
                    ) : (
                      val === " " ? "·" : val
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

interface MonthCardProps {
  title: string;
  set: MonthsSet;
  powerAnalysis?: ReturnType<Report["getMonthPowerAnalysis"]>;
}

export const CanonicalMonthCard: React.FC<MonthCardProps> = ({ title, set, powerAnalysis }) => {
  const rows = [
    { label: "Ess", value: set.essence, rowKey: "ess" as const, tone: "text-red-900" },
    { label: "PME", value: set.personalMonthEssence, rowKey: "pme" as const, tone: "text-blue-900" },
    { label: "Comb", value: set.combined, rowKey: "mcom" as const, tone: "text-teal-900" },
    { label: "PM", value: set.personalMonth, rowKey: "pm" as const, tone: "text-blue-950" },
    { label: "Month", value: MONTH_LETTERS.join(""), rowKey: "cm" as const, tone: "text-emerald-900 font-black" },
    { label: "PY", value: set.personalYear, rowKey: "py" as const, tone: "text-red-950 font-black" },
  ];

  return (
    <article className="p-4 rounded-xl border-2 border-slate-300 bg-white shadow-sm min-w-[340px] flex-1">
      <div className="flex items-center justify-between mb-3 border-b-2 border-slate-200 pb-2">
        <h4 className="font-serif font-black text-sm text-slate-950 tracking-wide">{title}</h4>
        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 uppercase">
          12-Month Cycle
        </span>
      </div>

      <div className="space-y-1 font-mono text-xs">
        {rows.map((row) => (
          <div
            key={`${title}-${row.label}`}
            className="grid grid-cols-[46px_repeat(12,1fr)] items-center py-1 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded"
          >
            <span className={`font-black text-[11px] uppercase tracking-wider ${row.tone}`}>
              {row.label}
            </span>
            {Array.from(row.value).map((val, idx) => {
              const analysis = powerAnalysis?.[idx];
              let isPower = false;
              let powerLabel = "";

              if (analysis) {
                if (row.rowKey === "pm" && analysis.pmPower) {
                  isPower = true;
                  powerLabel = `PM Power ${analysis.pmPower.powerNumber}`;
                } else if (row.rowKey === "pme" && analysis.pmePower) {
                  isPower = true;
                  powerLabel = `PME Power ${analysis.pmePower.powerNumber}`;
                } else if (row.rowKey === "mcom" && analysis.mcomPower) {
                  isPower = true;
                  powerLabel = `MCOM Power ${analysis.mcomPower.powerNumber}`;
                }
              }

              return (
                <span
                  key={`${row.label}-${idx}`}
                  className={`text-center font-bold ${row.tone}`}
                  title={powerLabel || undefined}
                >
                  {isPower ? (
                    <span className="inline-block px-1 rounded bg-red-100 text-red-950 font-black border border-red-400">
                      {val}
                    </span>
                  ) : (
                    val
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </article>
  );
};

interface MonthlyTimelineViewProps {
  report: Report;
  focusYear: number;
  currentYear: number;
}

export const CanonicalMonthlyTimelineView: React.FC<MonthlyTimelineViewProps> = ({
  report,
  focusYear,
  currentYear,
}) => {
  const birthYear = currentYear - report.age;
  const focusAge = report.age + focusYear - currentYear;
  const ages = [focusAge - 1, focusAge, focusAge + 1];

  const emptyMonth: MonthsSet = {
    essence: "............",
    personalYear: "............",
    personalMonth: "............",
    personalMonthEssence: "............",
    combined: "............",
  };

  const centerAnalysis = focusAge >= 0 ? report.getMonthPowerAnalysis(focusAge) : [];

  // Collect all power numbers for the center focus year
  const centerPowers = centerAnalysis.filter((m) => m.allPowers.length > 0);

  return (
    <div className="space-y-4">
      {/* Power Number Identification Panel */}
      <div className="p-4 rounded-lg bg-slate-50 border-2 border-slate-300 text-xs shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-600" />
            <h4 className="font-black text-slate-950 uppercase tracking-wider text-xs">
              Month Power Numbers (11, 13, 16) for Year {focusYear} (Age {focusAge})
            </h4>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-950 border border-red-400 font-bold">
            {centerPowers.length} Power Months Identified
          </span>
        </div>

        {centerPowers.length === 0 ? (
          <p className="text-slate-600 italic">No 11, 13, or 16 Power Numbers in year {focusYear}.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
            {centerPowers.map((p) => (
              <div
                key={p.monthIndex}
                className="p-2.5 rounded-md bg-white border-2 border-slate-200 shadow-xs flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-slate-950 font-black">
                    {MONTH_NAMES[p.monthIndex - 1]} (M{p.monthIndex})
                  </strong>
                  <div className="flex gap-1">
                    {p.allPowers.map((pn) => (
                      <span
                        key={pn}
                        className="px-1.5 py-0.5 rounded bg-red-100 text-red-950 border border-red-400 font-black text-[10px]"
                      >
                        PN {pn}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-slate-700 space-y-0.5 font-mono">
                  {p.pmPower && <div>• PM {p.pmPower.powerNumber} (raw {p.pmPower.rawSum})</div>}
                  {p.pmePower && <div>• PME {p.pmePower.powerNumber} (raw {p.pmePower.rawSum})</div>}
                  {p.mcomPower && <div>• MCOM {p.mcomPower.powerNumber} (raw {p.mcomPower.rawSum})</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Three Year Monthly Band */}
      <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto pb-2">
        {ages.map((age) => {
          const year = birthYear + age;
          const isCenter = age === focusAge;
          const set = age < 0 ? emptyMonth : report.getMonthSet(age);
          const analysis = age >= 0 ? report.getMonthPowerAnalysis(age) : undefined;

          return (
            <div
              key={age}
              className={`flex-1 min-w-[320px] ${
                isCenter ? "ring-2 ring-slate-950 rounded-xl" : "opacity-90"
              }`}
            >
              <CanonicalMonthCard
                title={age < 0 ? "Before Birth" : `${year} · Age ${age}${isCenter ? " (Selected)" : ""}`}
                set={set}
                powerAnalysis={analysis}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface PrintReportProps {
  fullName: string;
  dob: string;
  report: Report;
  currentYear: number;
  chartDate: string;
}

export const CanonicalPrintReport: React.FC<PrintReportProps> = ({
  fullName,
  dob,
  report,
  currentYear,
  chartDate,
}) => {
  const focusStart = Math.max(0, report.age - 14);
  const birthYear = currentYear - report.age;
  const minMonthYear = birthYear;
  const maxMonthYear = Math.max(currentYear + 40, birthYear + 119);
  const [monthFocusYear, setMonthFocusYear] = useState(currentYear);

  const focusAge = report.age + monthFocusYear - currentYear;
  const monthAges = [focusAge - 1, focusAge, focusAge + 1];
  const emptyMonth: MonthsSet = {
    essence: "............",
    personalYear: "............",
    personalMonth: "............",
    personalMonthEssence: "............",
    combined: "............",
  };
  const monthSets = monthAges.map((age) => (age < 0 ? emptyMonth : report.getMonthSet(age)));
  const joinMonth = (select: (set: MonthsSet) => string) => monthSets.map(select).join("");

  // Letter stack calculation
  const letterGroups = report.fullLetters.trim().split(/\s+/);
  const partTotals = report.fullLettersTotalPart.trim().split(/\s+/);

  return (
    <article className="max-w-[1100px] mx-auto bg-white p-6 border-2 border-slate-300 rounded-xl shadow-md text-slate-950 space-y-6 print:border-0 print:p-0 print:shadow-none">
      {/* Masthead */}
      <header className="border-b-2 border-slate-300 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono font-black text-lg tracking-wider text-slate-950 uppercase">
            <span>TIMELINE FORMULA · FORENSIC REPORT</span>
          </div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-0.5">
            Deterministic Forensic Science Charting
          </p>
        </div>
        <div className="text-right font-mono text-xs">
          <time className="block font-bold text-slate-700">{chartDate}</time>
          <code className="font-black text-slate-950">Ultimate Goal (UG): {report.ultimateGoal}</code>
        </div>
      </header>

      {/* Summary Section */}
      <section className="p-4 rounded-lg bg-slate-50 border-2 border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        {/* Identity */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Identity Calculations</span>
          <div className="font-black text-sm text-slate-950">{fullName.toUpperCase()}</div>
          <div>HDC: {report.hdc} = <strong>{report.hdcTotal}</strong></div>
          <div className="flex gap-3 text-[11px] text-slate-700 pt-1">
            {letterGroups.map((g, i) => (
              <span key={i} className="text-center">
                <span className="block font-bold">{g}</span>
                <span className="block text-[10px] text-slate-500">{partTotals[i] || ""}</span>
              </span>
            ))}
            <span className="text-center font-black text-slate-950 pl-1 border-l border-slate-300">
              Total: {report.fullLettersTotal}
            </span>
          </div>
        </div>

        {/* Birth & PMEI */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Birth & PMEI</span>
          <div>DOB: <strong>{dob}</strong></div>
          <div>Birth Force: <strong>{report.birthForce}</strong></div>
          <div className="pt-1 space-y-0.5 text-[11px] text-slate-800">
            {report.pmei.map((val, idx) => (
              <div key={idx}>
                {["Physical", "Mental", "Emotional", "Intuitive"][idx]}: <strong>{val}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Pin, Cha, Seasons */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Cycles & Seasons</span>
          <div>Pinnacles: <strong>{report.pin}</strong></div>
          <div>Challenges: <strong>{report.cha}</strong></div>
          <div>Age: <strong>{report.age}</strong></div>
          <div className="pt-1 text-[11px] text-slate-700">
            Seasons: {report.seasons.join(" | ")}
          </div>
        </div>
      </section>

      {/* Focus Annual Section (30 Years) */}
      <section className="space-y-2">
        <h3 className="font-black text-sm uppercase tracking-wider text-slate-950 flex items-center gap-2">
          <span>Yearly Timeline - Personal Cycles (Focus 30 Years)</span>
        </h3>
        <CanonicalYearGrid
          report={report}
          start={focusStart}
          length={30}
          includeNames={true}
          label="Print Focus 30-Year Grid"
          showPowerNumbers={true}
        />
      </section>

      {/* Monthly Timeline Section (3 Years) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-950">
            Yearly / Monthly Timeline Summary (Centered on {monthFocusYear})
          </h3>
          <div className="flex items-center gap-2 no-print text-xs">
            <button
              type="button"
              onClick={() => setMonthFocusYear((y) => Math.max(minMonthYear, y - 1))}
              className="px-2 py-1 bg-slate-100 border border-slate-300 rounded hover:bg-slate-200 font-bold"
            >
              ‹ Prev
            </button>
            <span className="font-mono font-black">{monthFocusYear}</span>
            <button
              type="button"
              onClick={() => setMonthFocusYear((y) => Math.min(maxMonthYear, y + 1))}
              className="px-2 py-1 bg-slate-100 border border-slate-300 rounded hover:bg-slate-200 font-bold"
            >
              Next ›
            </button>
          </div>
        </div>

        <CanonicalMonthlyTimelineView
          report={report}
          focusYear={monthFocusYear}
          currentYear={currentYear}
        />
      </section>

      {/* Lifetime Extended Cycles (80 Years) */}
      <section className="space-y-2">
        <h3 className="font-black text-sm uppercase tracking-wider text-slate-950">
          Sequence Timeline - Extended Cycles (80-Year Lifetime)
        </h3>
        <CanonicalYearGrid
          report={report}
          start={0}
          length={80}
          includeNames={true}
          label="Print 80-Year Lifetime Grid"
          showPowerNumbers={true}
        />
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-slate-300 pt-3 text-center text-xs font-mono text-slate-600 uppercase tracking-wider">
        Timeline Formula · Private and Confidential · Certified Calculations
      </footer>
    </article>
  );
};
