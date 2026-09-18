/**
 * @license
 * Lettrology Forensic Science - Dedicated Interactive Time-Map Chart Workspace
 * PRD Section 3.3, 11, 12, 16, 17, 18, 19, 21, 22, 25, 26, 36.5
 */

import React, { useState, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { StudentTimeline } from './StudentTimeline';
import {
  Layers,
  Printer,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { PersonRecord, EventRecord, CaseRecord } from '../types.ts';
import { generateAnnualTimeMap } from '../core/lettrology-engine/annualEngine.ts';
import { generateMonthlyCalendar } from '../core/lettrology-engine/monthlyEngine.ts';
import { calculateDailyState, DailyState } from '../core/lettrology-engine/dailyEngine.ts';
import { computeAnnualStack, computeMonthlyStack } from '../core/lettrology-engine/stackEngine.ts';
import { formatCompound } from '../core/lettrology-engine/compoundTrail.ts';
import {
  daysInHistoricalMonth,
  formatHistoricalDate,
  formatHistoricalYear,
  historicalYearDifference,
  nextHistoricalYear,
  parseHistoricalDate,
  previousHistoricalYear,
} from '../core/historicalDate.ts';

type ChartDisplayMode = 'FULL' | 'ANNUAL' | 'MONTHLY' | 'DAILY' | 'STACK';

interface ChartViewProps {
  caseRecord: CaseRecord;
  people: PersonRecord[];
  events: EventRecord[];
  selectedPersonId?: string;
  onSelectPersonId?: (id: string) => void;
  onJumpToForensicFocus?: (event: EventRecord) => void;
}

export const ChartView: React.FC<ChartViewProps> = ({
  caseRecord,
  people,
  events,
  selectedPersonId,
  onSelectPersonId,
}) => {
  const [activePersonId, setActivePersonId] = useState<string>(
    selectedPersonId || people[0]?.personId || ''
  );
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('FULL');
  const initialIncident = parseHistoricalDate(caseRecord.primaryIncidentDate);
  const [selectedYear, setSelectedYear] = useState<number>(initialIncident?.signedYear || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(initialIncident?.month || 7);
  const [showEventOverlay, setShowEventOverlay] = useState<boolean>(false);

  React.useEffect(() => {
    if (selectedPersonId && selectedPersonId !== activePersonId) setActivePersonId(selectedPersonId);
  }, [selectedPersonId]);

  const currentPerson = useMemo(() => {
    return people.find(p => p.personId === activePersonId) || people[0];
  }, [people, activePersonId]);

  const currentDob = useMemo(
    () => currentPerson ? parseHistoricalDate(currentPerson.dob) : null,
    [currentPerson],
  );

  React.useEffect(() => {
    if (!currentDob || selectedYear === 0) return;
    const age = historicalYearDifference(currentDob.signedYear, selectedYear);
    if (age < 0) setSelectedYear(currentDob.signedYear);
  }, [currentPerson?.personId]);

  const selectedAge = currentDob && selectedYear !== 0
    ? Math.max(0, historicalYearDifference(currentDob.signedYear, selectedYear))
    : 0;

  // Generate only the local window needed by annual/monthly/daily views. The
  // StudentTimeline independently generates its visible windows, so ancient
  // subjects can move thousands of years forward without building a giant map.
  const annualStates = useMemo(() => {
    if (!currentPerson) return [];
    const startAge = Math.max(0, selectedAge - 1);
    const endAge = selectedAge + 2;
    return generateAnnualTimeMap(
      currentPerson.verifiedBirthName,
      currentPerson.dob,
      startAge,
      endAge,
      'AGE',
    );
  }, [currentPerson, selectedAge]);

  const selectedAnnualState = useMemo(() => (
    annualStates.find(s => s.calendarYear === selectedYear) || annualStates.find(s => s.age === selectedAge) || annualStates[0]
  ), [annualStates, selectedYear, selectedAge]);

  const nextAnnualState = useMemo(() => {
    if (!selectedAnnualState) return undefined;
    return annualStates.find(s => s.calendarYear === nextHistoricalYear(selectedAnnualState.calendarYear));
  }, [annualStates, selectedAnnualState]);

  const monthlyStates = useMemo(() => {
    if (!selectedAnnualState) return [];
    return generateMonthlyCalendar(selectedAnnualState, nextAnnualState);
  }, [selectedAnnualState, nextAnnualState]);

  const selectedMonthlyState = useMemo(() => (
    monthlyStates.find(m => m.monthIndex === selectedMonth) || monthlyStates[0]
  ), [monthlyStates, selectedMonth]);

  const dailyStates = useMemo(() => {
    if (!selectedMonthlyState) return [];
    const daysInMonth = daysInHistoricalMonth(Math.abs(selectedYear), selectedMonth);
    const days: DailyState[] = [];
    for (let d = 1; d <= daysInMonth; d++) days.push(calculateDailyState(d, selectedMonthlyState));
    return days;
  }, [selectedMonthlyState, selectedYear, selectedMonth]);

  const stackInputPeople = useMemo(() => people.map(p => ({
    personId: p.personId,
    name: p.verifiedBirthName,
    dob: p.dob,
    roleInCase: p.roleInCase,
  })), [people]);

  const annualStackData = useMemo(() => computeAnnualStack(stackInputPeople, selectedYear), [stackInputPeople, selectedYear]);
  const monthlyStackData = useMemo(() => computeMonthlyStack(stackInputPeople, selectedYear, selectedMonth), [stackInputPeople, selectedYear, selectedMonth]);

  const relevantEvents = useMemo(() => (events || []).filter(
    e => (e?.peopleInvolved || []).includes(currentPerson?.personId || '') || (caseRecord?.caseId && e?.caseId === caseRecord.caseId)
  ), [events, currentPerson, caseRecord]);

  const handlePrint = () => {
    if (displayMode === 'ANNUAL' || displayMode === 'MONTHLY') flushSync(() => setDisplayMode('FULL'));
    window.print();
  };

  if (!currentPerson || !currentDob) {
    return <div className="p-8 text-center text-slate-400">No subject with a readable birth date is available in this case.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="page-heading no-print"><div><p className="eyebrow">The original calculation workspace</p><h1>Lettrology Chart</h1><p className="page-description">Choose a person and a year. Explore the chart from ancient history through modern time.</p></div></div>

      <div className="chart-controls p-4 rounded-lg bg-white border-2 border-slate-300 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">Person</label>
            <select
              aria-label="Chart person"
              value={activePersonId}
              onChange={e => {
                setActivePersonId(e.target.value);
                onSelectPersonId?.(e.target.value);
                const nextPerson = people.find(p => p.personId === e.target.value);
                const parsed = nextPerson ? parseHistoricalDate(nextPerson.dob) : null;
                if (parsed) setSelectedYear(parsed.signedYear);
              }}
              className="bg-slate-50 border-2 border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-950 font-bold focus:outline-none focus:border-amber-600 shadow-sm"
            >
              {people.map(p => <option key={p.personId} value={p.personId}>{p.displayName}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">Identity Used</label>
            <div className="text-xs text-slate-950 font-black bg-slate-100 px-3 py-1.5 rounded-md border-2 border-slate-300 shadow-sm">
              {currentPerson.verifiedBirthName} (Birth Legal) · {formatHistoricalDate(currentPerson.dob)}
            </div>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-md border-2 border-slate-300 text-xs">
          <button onClick={() => setDisplayMode('FULL')} className={`px-3 py-2 rounded font-bold text-xs ${displayMode === 'FULL' ? 'bg-slate-950 text-white' : 'text-slate-700'}`}>Full chart</button>
          <button onClick={() => setDisplayMode('ANNUAL')} className={`px-3 py-1 rounded font-bold transition-colors uppercase tracking-wider ${displayMode === 'ANNUAL' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-700 hover:text-black hover:bg-slate-200'}`}>Annual</button>
          <button onClick={() => setDisplayMode('MONTHLY')} className={`px-3 py-1 rounded font-bold transition-colors uppercase tracking-wider ${displayMode === 'MONTHLY' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-700 hover:text-black hover:bg-slate-200'}`}>Monthly</button>
          <button onClick={() => setDisplayMode('DAILY')} className={`px-3 py-1 rounded font-bold transition-colors uppercase tracking-wider ${displayMode === 'DAILY' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-700 hover:text-black hover:bg-slate-200'}`}>Daily</button>
          <button onClick={() => setDisplayMode('STACK')} className={`px-3 py-1 rounded font-bold transition-colors uppercase tracking-wider ${displayMode === 'STACK' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-700 hover:text-black hover:bg-slate-200'}`}>Compare people</button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 border-2 border-slate-300 rounded-md px-2 py-1 shadow-sm">
            <button aria-label="Previous historical year" onClick={() => setSelectedYear(y => previousHistoricalYear(y))} className="text-slate-700 hover:text-black p-0.5"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-black text-slate-950 px-1 min-w-[64px] text-center">{formatHistoricalYear(selectedYear)}</span>
            <button aria-label="Next historical year" onClick={() => setSelectedYear(y => nextHistoricalYear(y))} className="text-slate-700 hover:text-black p-0.5"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <button className="secondary-button" onClick={() => {
            const incident = parseHistoricalDate(caseRecord.primaryIncidentDate);
            if (incident) { setSelectedYear(incident.signedYear); setSelectedMonth(incident.month); }
          }}>Jump to incident</button>
          <label className="flex items-center gap-2"><input type="checkbox" checked={showEventOverlay} onChange={e => setShowEventOverlay(e.target.checked)}/>Show case events</label>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 border-2 border-slate-300 hover:border-slate-800 text-xs text-slate-950 font-bold transition-colors shadow-sm"><Printer className="w-4 h-4 text-slate-700" /><span className="hidden sm:inline uppercase tracking-wider">Print Chart</span></button>
        </div>
      </div>

      {showEventOverlay && relevantEvents.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg flex items-center gap-2 overflow-x-auto text-xs shadow-sm">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-700 whitespace-nowrap">Documented Incidents:</span>
          {relevantEvents.map(evt => {
            const parsed = parseHistoricalDate(evt.startDate);
            if (!parsed) return null;
            const isCurrentYear = parsed.signedYear === selectedYear;
            return (
              <button key={evt.eventId} onClick={() => { setSelectedYear(parsed.signedYear); setSelectedMonth(parsed.month); }} className={`px-3 py-1 rounded-md border-2 whitespace-nowrap transition-colors flex items-center gap-1.5 font-bold ${isCurrentYear ? 'border-amber-600 bg-amber-100 text-slate-950 shadow-sm' : 'border-slate-300 bg-white text-slate-800 hover:border-slate-600'}`}>
                <span className="w-2 h-2 rounded-full bg-red-600"></span><span>{evt.title}</span><span className="text-[11px] text-amber-900 font-bold">({formatHistoricalDate(evt.startDate)})</span>
              </button>
            );
          })}
        </div>
      )}

      {(displayMode === 'FULL' || displayMode === 'ANNUAL' || displayMode === 'MONTHLY') && (
        <StudentTimeline key={`${currentPerson.personId}-${selectedYear}`} person={currentPerson} mode={displayMode} year={selectedYear} month={selectedMonth} onYearChange={setSelectedYear} onMonthChange={setSelectedMonth} />
      )}

      {displayMode === 'DAILY' && selectedMonthlyState && (
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-center justify-between text-xs text-amber-950 shadow-sm">
            <div className="flex items-center gap-2"><Info className="w-5 h-5 text-amber-800 shrink-0" /><span>Status: <strong className="font-black">APPROVED LEGACY IMPLEMENTATION – REQUIRES FINAL PETER CERTIFICATION BEFORE BEING LABELED CANONICAL</strong></span></div>
            <div className="text-xs font-bold text-amber-900">Environment = Reduced Day + PM • Feel = Environment + PME • DCOM = Feel + Environment</div>
          </div>

          <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black tracking-wider text-slate-950 uppercase">Daily: {selectedMonthlyState.monthName} {formatHistoricalYear(selectedYear)} ({currentPerson.displayName})</h3>
              <div className="text-xs font-bold text-slate-700">Active PM: {formatCompound(selectedMonthlyState.pm)} • PME: {formatCompound(selectedMonthlyState.pme)}</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {dailyStates.map(day => (
                <div key={day.dayNumber} className={`p-2.5 rounded-lg border-2 flex flex-col gap-1 transition-all ${day.isPowerDay ? 'border-red-400 bg-red-50 text-red-950 shadow-sm' : 'border-slate-300 bg-slate-50 hover:border-slate-800'}`}>
                  <div className="flex items-center justify-between border-b-2 border-slate-200 pb-1"><span className="text-xs font-black text-slate-950">Day {day.dayNumber}</span>{day.isPowerDay && <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-200 text-red-950 border border-red-400 font-black">PN {day.powerNumbers.join(',')}</span>}</div>
                  <div className="text-xs flex justify-between text-slate-700 font-bold"><span>Env:</span><span className="font-black text-blue-950">{formatCompound(day.environment)}</span></div>
                  <div className="text-xs flex justify-between text-slate-700 font-bold"><span>Feel:</span><span className="font-black text-purple-950">{formatCompound(day.feel)}</span></div>
                  <div className="text-xs flex justify-between text-slate-700 pt-0.5 border-t border-slate-200 font-bold"><span>DCOM:</span><span className="font-black text-emerald-950">{formatCompound(day.dcom)}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {displayMode === 'STACK' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-slate-200">
              <div><h3 className="text-sm font-black tracking-wider text-slate-950 uppercase flex items-center gap-2"><Layers className="w-4 h-4 text-amber-800" />Multi-Person Annual Stack: {formatHistoricalYear(selectedYear)}</h3><p className="text-xs font-bold text-slate-700">Synchronized comparative matrix across all {people.length} case subjects.</p></div>
              <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-md border-2 border-slate-300 flex items-center gap-3"><span className="text-slate-700 font-bold">Group Findings:</span><span className="text-slate-950 font-black">{annualStackData.findings.subjectsWithPowerNumber} of {annualStackData.findings.totalSubjects} subjects active Power Numbers</span>{annualStackData.findings.intensificationCount > 0 && <span className="text-purple-950 font-black">• {annualStackData.findings.intensificationCount} Intensification(s)</span>}</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead><tr className="bg-slate-100 text-slate-950 border-b-2 border-slate-300"><th className="p-2.5 font-black">Subject</th><th className="p-2.5 font-black">Case Role</th><th className="p-2.5 font-black">DOB</th><th className="p-2.5 font-black">Age in {formatHistoricalYear(selectedYear)}</th><th className="p-2.5 font-black">Letters</th><th className="p-2.5 font-black">ESS</th><th className="p-2.5 font-black">PY</th><th className="p-2.5 font-black">COM</th><th className="p-2.5 font-black">Power Numbers</th><th className="p-2.5 font-black">Flags</th></tr></thead>
                <tbody className="divide-y divide-slate-200">
                  {annualStackData.items.map(item => (
                    <tr key={item.personId} className={`hover:bg-slate-50 transition-colors ${item.personId === activePersonId ? 'bg-amber-100/60 font-bold' : ''}`}>
                      <td className="p-2.5 font-black text-slate-950">{item.name}</td>
                      <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 border border-slate-300 text-slate-900">{item.roleInCase || 'SUBJECT'}</span></td>
                      <td className="p-2.5 text-slate-800 font-bold">{formatHistoricalDate(item.dob)}</td>
                      <td className="p-2.5 text-slate-950 font-black">{item.age}</td>
                      <td className="p-2.5 font-black font-mono text-amber-950">{item.activeLetters.join(' ')}</td>
                      <td className="p-2.5 text-slate-950 font-black">{item.ess}</td>
                      <td className="p-2.5 text-blue-950 font-black">{item.py}</td>
                      <td className="p-2.5 text-emerald-950 font-black">{item.com}</td>
                      <td className="p-2.5">{item.isPowerNumber ? <span className="px-1.5 py-0.5 rounded text-[11px] bg-red-100 text-red-950 border border-red-400 font-black">{item.powerNumbers.join(', ')}</span> : <span className="text-slate-400">—</span>}</td>
                      <td className="p-2.5">{item.isIntensified && <span className="px-1.5 py-0.5 rounded text-[11px] bg-purple-100 text-purple-950 border border-purple-400 font-black">INTENS</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {annualStackData.findings.observations.length > 0 && (
              <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border-2 border-slate-300 text-xs text-slate-900 space-y-1.5 shadow-sm">
                <span className="text-xs uppercase tracking-wider text-slate-950 font-black block">Deterministic Group Findings:</span>
                {annualStackData.findings.observations.map((obs, i) => <div key={i} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-600"></span><span className="font-semibold text-slate-950">{obs}</span></div>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
