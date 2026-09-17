/**
 * @license
 * Lettrology Forensic Science - Dedicated Interactive Time-Map Chart Workspace
 * PRD Section 3.3, 11, 12, 16, 17, 18, 19, 21, 22, 25, 26, 36.5
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Layers,
  Printer,
  ChevronRight,
  ChevronLeft,
  Filter,
  Sparkles,
  Info,
  CalendarRange,
  Zap,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';
import { PersonRecord, EventRecord, CaseRecord } from '../types.ts';
import {
  generateAnnualTimeMap,
  AnnualState,
} from '../core/lettrology-engine/annualEngine.ts';
import {
  generateMonthlyCalendar,
  MonthlyState,
} from '../core/lettrology-engine/monthlyEngine.ts';
import {
  calculateDailyState,
  DailyState,
} from '../core/lettrology-engine/dailyEngine.ts';
import {
  computeAnnualStack,
  computeMonthlyStack,
} from '../core/lettrology-engine/stackEngine.ts';
import {
  formatCompound,
  formatShortCompound,
} from '../core/lettrology-engine/compoundTrail.ts';
import { CURRENT_ENGINE_VERSION } from '../core/lettrology-engine/methodologyVersion.ts';

interface ChartViewProps {
  caseRecord: CaseRecord;
  people: PersonRecord[];
  events: EventRecord[];
  selectedPersonId?: string;
  onSelectPersonId?: (id: string) => void;
  onJumpToForensicFocus?: (event: EventRecord) => void;
}

type ChartDisplayMode = 'ANNUAL' | 'MONTHLY' | 'DAILY' | 'STACK';

export const ChartView: React.FC<ChartViewProps> = ({
  caseRecord,
  people,
  events,
  selectedPersonId,
  onSelectPersonId,
  onJumpToForensicFocus,
}) => {
  const [activePersonId, setActivePersonId] = useState<string>(
    selectedPersonId || people[0]?.personId || ''
  );
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('ANNUAL');
  const [selectedYear, setSelectedYear] = useState<number>(Number(caseRecord.primaryIncidentDate.slice(0, 4)) || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // July default
  const [viewWindow, setViewWindow] = useState<'5YR' | '10YR' | 'LIFETIME'>('5YR');
  const [showCompounds, setShowCompounds] = useState<boolean>(true);
  const [showEventOverlay, setShowEventOverlay] = useState<boolean>(false);
  const [showDiagonals, setShowDiagonals] = useState<boolean>(true);
  const [showIntensifiers, setShowIntensifiers] = useState<boolean>(true);

  // Synchronize external person selection
  React.useEffect(() => {
    if (selectedPersonId && selectedPersonId !== activePersonId) {
      setActivePersonId(selectedPersonId);
    }
  }, [selectedPersonId]);

  const currentPerson = useMemo(() => {
    return people.find(p => p.personId === activePersonId) || people[0];
  }, [people, activePersonId]);

  // Generate full lifetime annual states for current person
  const annualStates = useMemo(() => {
    if (!currentPerson) return [];
    return generateAnnualTimeMap(
      currentPerson.verifiedBirthName,
      currentPerson.dob,
      0,
      95
    );
  }, [currentPerson]);

  // Windowed annual states for display
  const displayedAnnualStates = useMemo(() => {
    if (!annualStates || annualStates.length === 0) return [];
    if (viewWindow === 'LIFETIME') return annualStates;

    const span = viewWindow === '5YR' ? 5 : 10;
    const centerIndex = annualStates.findIndex(s => s.calendarYear === selectedYear);
    const validCenter = centerIndex >= 0 ? centerIndex : 0;
    const half = Math.floor(span / 2);
    const start = Math.max(0, validCenter - half);
    const end = Math.min(annualStates.length, start + span);

    return annualStates.slice(start, end);
  }, [annualStates, selectedYear, viewWindow]);

  // Selected annual state for monthly calculation
  const selectedAnnualState = useMemo(() => {
    return (
      annualStates.find(s => s.calendarYear === selectedYear) ||
      annualStates[0]
    );
  }, [annualStates, selectedYear]);

  const nextAnnualState = useMemo(() => {
    return annualStates.find(s => s.calendarYear === selectedYear + 1);
  }, [annualStates, selectedYear]);

  // Monthly states for selected year
  const monthlyStates = useMemo(() => {
    if (!selectedAnnualState) return [];
    return generateMonthlyCalendar(selectedAnnualState, nextAnnualState);
  }, [selectedAnnualState, nextAnnualState]);

  // Selected monthly state for daily calculation
  const selectedMonthlyState = useMemo(() => {
    return (
      monthlyStates.find(m => m.monthIndex === selectedMonth) ||
      monthlyStates[0]
    );
  }, [monthlyStates, selectedMonth]);

  // Daily states for selected month
  const dailyStates = useMemo(() => {
    if (!selectedMonthlyState) return [];
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days: DailyState[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(calculateDailyState(d, selectedMonthlyState));
    }
    return days;
  }, [selectedMonthlyState, selectedYear, selectedMonth]);

  // Multi-person stack data
  const stackInputPeople = useMemo(() => {
    return people.map(p => ({
      personId: p.personId,
      name: p.verifiedBirthName,
      dob: p.dob,
      roleInCase: p.roleInCase,
    }));
  }, [people]);

  const annualStackData = useMemo(() => {
    return computeAnnualStack(stackInputPeople, selectedYear);
  }, [stackInputPeople, selectedYear]);

  const monthlyStackData = useMemo(() => {
    return computeMonthlyStack(stackInputPeople, selectedYear, selectedMonth);
  }, [stackInputPeople, selectedYear, selectedMonth]);

  // Events filtered for current person / case
  const relevantEvents = useMemo(() => {
    return (events || []).filter(
      e =>
        (e?.peopleInvolved || []).includes(currentPerson?.personId || '') ||
        (caseRecord?.caseId && e?.caseId === caseRecord.caseId)
    );
  }, [events, currentPerson, caseRecord]);

  const handlePrint = () => {
    window.print();
  };

  if (!currentPerson) {
    return (
      <div className="p-8 text-center text-slate-400">
        No subjects available in this case.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="page-heading no-print"><div><p className="eyebrow">The original calculation workspace</p><h1>Lettrology Chart</h1><p className="page-description">Choose a person and a year. Explore the chart at your own pace.</p></div></div>
      {/* Chart Top Control Bar */}
      <div className="chart-controls p-4 rounded-lg bg-white border-2 border-slate-300 shadow-sm">
        {/* Subject & Identity Selector */}
        <div className="flex items-center gap-3">
          <div>
            <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
              Person
            </label>
            <select
              aria-label="Chart person"
              value={activePersonId}
              onChange={e => {
                setActivePersonId(e.target.value);
                onSelectPersonId?.(e.target.value);
              }}
              className="bg-slate-50 border-2 border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-950 font-bold focus:outline-none focus:border-amber-600 shadow-sm"
            >
              {people.map(p => (
                <option key={p.personId} value={p.personId}>
                  {p.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
              Identity Used
            </label>
            <div className="text-xs text-slate-950 font-black bg-slate-100 px-3 py-1.5 rounded-md border-2 border-slate-300 shadow-sm">
              {currentPerson.verifiedBirthName} (Birth Legal)
            </div>
          </div>
        </div>

        {/* Display Mode Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-md border-2 border-slate-300 text-xs">
          <button
            onClick={() => setDisplayMode('ANNUAL')}
            className={`px-3 py-1 rounded font-bold transition-colors uppercase tracking-wider ${
              displayMode === 'ANNUAL'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-700 hover:text-black hover:bg-slate-200'
            }`}
          >
            Annual
          </button>
          <button
            onClick={() => setDisplayMode('MONTHLY')}
            className={`px-3 py-1 rounded font-bold transition-colors uppercase tracking-wider ${
              displayMode === 'MONTHLY'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-700 hover:text-black hover:bg-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setDisplayMode('DAILY')}
            className={`px-3 py-1 rounded font-bold transition-colors uppercase tracking-wider ${
              displayMode === 'DAILY'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-700 hover:text-black hover:bg-slate-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setDisplayMode('STACK')}
            className={`px-3 py-1 rounded font-bold transition-colors uppercase tracking-wider ${
              displayMode === 'STACK'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-700 hover:text-black hover:bg-slate-200'
            }`}
          >
            Compare people
          </button>
        </div>

        {/* View Range & Jump Controls */}
        <div className="flex items-center gap-2">
          {displayMode === 'ANNUAL' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border-2 border-slate-300 text-xs">
              {(['5YR', '10YR', 'LIFETIME'] as const).map(w => (
                <button
                  key={w}
                  onClick={() => setViewWindow(w)}
                  className={`px-2.5 py-1 rounded font-bold uppercase transition-colors ${
                    viewWindow === w
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-700 hover:text-black hover:bg-slate-200'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          )}

          {/* Year Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border-2 border-slate-300 rounded-md px-2 py-1 shadow-sm">
            <button
              aria-label="Previous year"
              onClick={() => setSelectedYear(y => y - 1)}
              className="text-slate-700 hover:text-black p-0.5"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black text-slate-950 px-1">
              {selectedYear}
            </span>
            <button
              aria-label="Next year"
              onClick={() => setSelectedYear(y => y + 1)}
              className="text-slate-700 hover:text-black p-0.5"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button className="secondary-button" onClick={() => {const [year,month] = caseRecord.primaryIncidentDate.split('-').map(Number);if(year) setSelectedYear(year);if(month) setSelectedMonth(month);}}>Jump to incident</button>
          <label className="flex items-center gap-2"><input type="checkbox" checked={showEventOverlay} onChange={e => setShowEventOverlay(e.target.checked)}/>Show case events</label>
          {/* Print / Export Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 border-2 border-slate-300 hover:border-slate-800 text-xs text-slate-950 font-bold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline uppercase tracking-wider">Print Chart</span>
          </button>
        </div>
      </div>

      {/* Incident Quick-Jump Ribbon */}
      {showEventOverlay && relevantEvents.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg flex items-center gap-2 overflow-x-auto text-xs shadow-sm">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-700 whitespace-nowrap">
            Documented Incidents:
          </span>
          {relevantEvents.map(evt => {
            const evtYear = parseInt(evt.startDate.split('-')[0], 10);
            const evtMonth = parseInt(evt.startDate.split('-')[1] || '1', 10);
            const isCurrentYear = evtYear === selectedYear;

            return (
              <button
                key={evt.eventId}
                onClick={() => {
                  setSelectedYear(evtYear);
                  setSelectedMonth(evtMonth);
                }}
                className={`px-3 py-1 rounded-md border-2 whitespace-nowrap transition-colors flex items-center gap-1.5 font-bold ${
                  isCurrentYear
                    ? 'border-amber-600 bg-amber-100 text-slate-950 shadow-sm'
                    : 'border-slate-300 bg-white text-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>{evt.title}</span>
                <span className="text-[11px] text-amber-900 font-bold">({evt.startDate})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* VIEW 1: ANNUAL TIME-MAP */}
      {displayMode === 'ANNUAL' && (
        <div className="rounded-lg bg-white border-2 border-slate-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b-2 border-slate-300 bg-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-amber-800" />
              <h3 className="text-sm font-black tracking-wider text-slate-950 uppercase">
                Annual: {currentPerson.displayName}
              </h3>
              <span className="text-xs font-semibold text-slate-700">
                (Cycle: {currentPerson.verifiedBirthName} • DOB: {currentPerson.dob})
              </span>
            </div>
            <details className="chart-settings"><summary>Chart display options</summary><div className="flex items-center gap-4 text-xs font-bold text-slate-800">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCompounds}
                  onChange={e => setShowCompounds(e.target.checked)}
                  className="rounded border-slate-400 bg-white text-slate-950"
                />
                <span>Compounds</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDiagonals}
                  onChange={e => setShowDiagonals(e.target.checked)}
                  className="rounded border-slate-400 bg-white text-slate-950"
                />
                <span>Diagonals</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showIntensifiers}
                  onChange={e => setShowIntensifiers(e.target.checked)}
                  className="rounded border-slate-400 bg-white text-slate-950"
                />
                <span>Intensifications</span>
              </label>
            </div></details>
          </div>

          {/* Time-Map Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-950 border-b-2 border-slate-300">
                  <th className="p-3 text-left w-36 font-black uppercase tracking-wider sticky left-0 bg-slate-100 z-10 border-r-2 border-slate-300">
                    Row Metric
                  </th>
                  {displayedAnnualStates.map(state => {
                    const isFocus = state.calendarYear === selectedYear;
                    return (
                      <th
                        key={state.calendarYear}
                        onClick={() => setSelectedYear(state.calendarYear)}
                        className={`p-2 min-w-[76px] cursor-pointer transition-colors ${
                          isFocus
                            ? 'bg-amber-100 border-t-2 border-amber-600 text-slate-950 ring-1 ring-amber-300'
                            : 'hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="text-xs font-black text-slate-950">{state.calendarYear}</div>
                        <div className="text-[11px] text-slate-700 font-bold">Age {state.age}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Active Letters: First Name */}
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 text-left text-slate-800 font-bold sticky left-0 bg-white border-r-2 border-slate-300">
                    First Name Letter
                  </td>
                  {displayedAnnualStates.map(state => (
                    <td
                      key={`fn-${state.calendarYear}`}
                      className={`p-2 font-black font-mono text-sm ${
                        state.calendarYear === selectedYear ? 'bg-amber-100/60 text-amber-950' : 'text-slate-950'
                      }`}
                    >
                      {state.firstLetter || '—'}
                    </td>
                  ))}
                </tr>

                {/* Active Letters: Middle Name(s) */}
                {displayedAnnualStates[0]?.middleLetters.length > 0 &&
                  displayedAnnualStates[0].middleLetters.map((_, midIdx) => (
                    <tr key={`mid-row-${midIdx}`} className="hover:bg-slate-50">
                      <td className="p-2.5 text-left text-slate-800 font-bold sticky left-0 bg-white border-r-2 border-slate-300">
                        Middle {midIdx + 1} Letter
                      </td>
                      {displayedAnnualStates.map(state => (
                        <td
                          key={`mid-${midIdx}-${state.calendarYear}`}
                          className={`p-2 font-black font-mono text-sm ${
                            state.calendarYear === selectedYear ? 'bg-amber-100/60 text-amber-950' : 'text-slate-950'
                          }`}
                        >
                          {state.middleLetters[midIdx] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}

                {/* Active Letters: Surname */}
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 text-left text-slate-800 font-bold sticky left-0 bg-white border-r-2 border-slate-300">
                    Surname Letter
                  </td>
                  {displayedAnnualStates.map(state => (
                    <td
                      key={`sn-${state.calendarYear}`}
                      className={`p-2 font-black font-mono text-sm ${
                        state.calendarYear === selectedYear ? 'bg-amber-100/60 text-amber-950' : 'text-slate-950'
                      }`}
                    >
                      {state.surnameLetter || '—'}
                    </td>
                  ))}
                </tr>

                {/* Upper ESS Compound */}
                <tr className="bg-slate-50">
                  <td className="p-2.5 text-left text-amber-900 font-black sticky left-0 bg-slate-50 border-r-2 border-slate-300">
                    ESS (Compound)
                  </td>
                  {displayedAnnualStates.map(state => {
                    const isPower = state.ess.isPowerNumber;
                    return (
                      <td
                        key={`ess-${state.calendarYear}`}
                        className={`p-2 font-bold ${
                          state.calendarYear === selectedYear ? 'bg-amber-100/70' : ''
                        }`}
                      >
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${
                            isPower
                              ? 'bg-red-100 text-red-950 border border-red-400 font-black'
                              : 'text-slate-950 font-bold'
                          }`}
                        >
                          {showCompounds ? formatCompound(state.ess) : state.ess.root}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Lower ESS Root */}
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 text-left text-slate-800 font-bold sticky left-0 bg-white border-r-2 border-slate-300">
                    ESS (Root)
                  </td>
                  {displayedAnnualStates.map(state => (
                    <td
                      key={`ess-root-${state.calendarYear}`}
                      className={`p-2 text-slate-950 font-black text-xs ${
                        state.calendarYear === selectedYear ? 'bg-amber-100/60 text-amber-950' : ''
                      }`}
                    >
                      {state.ess.root}
                    </td>
                  ))}
                </tr>

                {/* Yearly Combiner (COM) */}
                <tr className="bg-slate-50">
                  <td className="p-2.5 text-left text-emerald-950 font-black sticky left-0 bg-slate-50 border-r-2 border-slate-300">
                    COM (Combiner)
                  </td>
                  {displayedAnnualStates.map(state => {
                    const isPower = state.com.isPowerNumber;
                    return (
                      <td
                        key={`com-${state.calendarYear}`}
                        className={`p-2 ${
                          state.calendarYear === selectedYear ? 'bg-amber-100/70' : ''
                        }`}
                      >
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                            isPower
                              ? 'bg-red-100 text-red-950 border border-red-400 font-black'
                              : 'text-emerald-950 font-bold'
                          }`}
                        >
                          {showCompounds ? formatCompound(state.com) : state.com.root}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Personal Year (PY) */}
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 text-left text-blue-950 font-black sticky left-0 bg-white border-r-2 border-slate-300">
                    PY (Personal Year)
                  </td>
                  {displayedAnnualStates.map(state => {
                    const isPower = state.py.isPowerNumber;
                    return (
                      <td
                        key={`py-${state.calendarYear}`}
                        className={`p-2 font-bold ${
                          state.calendarYear === selectedYear ? 'bg-amber-100/60 text-blue-950' : 'text-blue-950'
                        }`}
                      >
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${
                            isPower ? 'bg-red-100 text-red-950 border border-red-400 font-black' : ''
                          }`}
                        >
                          {showCompounds ? formatCompound(state.py) : state.py.root}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Calendar Year (CY) */}
                <tr className="hover:bg-slate-50 text-slate-700">
                  <td className="p-2.5 text-left text-slate-800 font-bold sticky left-0 bg-white border-r-2 border-slate-300">
                    CY (Calendar Year)
                  </td>
                  {displayedAnnualStates.map(state => (
                    <td
                      key={`cy-${state.calendarYear}`}
                      className={`p-2 font-bold text-xs ${
                        state.calendarYear === selectedYear ? 'bg-amber-100/60 text-slate-950 font-black' : ''
                      }`}
                    >
                      {state.cy.root}
                    </td>
                  ))}
                </tr>

                {/* Canonical Markers & Flags */}
                <tr className="bg-slate-50">
                  <td className="p-2.5 text-left text-slate-800 font-bold sticky left-0 bg-slate-50 border-r-2 border-slate-300">
                    Canonical Flags
                  </td>
                  {displayedAnnualStates.map(state => (
                    <td key={`flags-${state.calendarYear}`} className="p-2">
                      <div className="flex flex-col items-center gap-1">
                        {state.isPowerNumber && (
                          <span className="px-1.5 py-0.5 text-[10px] font-black rounded bg-red-100 text-red-950 border border-red-400">
                            PN {state.powerNumbers.join(',')}
                          </span>
                        )}
                        {showIntensifiers && state.isIntensified && (
                          <span className="px-1.5 py-0.5 text-[10px] font-black rounded bg-purple-100 text-purple-950 border border-purple-400">
                            INTENS
                          </span>
                        )}
                        {state.isCycleReset && (
                          <span className="px-1.5 py-0.5 text-[10px] font-black rounded bg-blue-100 text-blue-950 border border-blue-400">
                            9→1 RESET
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Birthday-Lapse Diagonal (Section 21.3) */}
                {showDiagonals && (
                  <tr className="bg-white border-t-2 border-slate-200">
                    <td className="p-2.5 text-left text-amber-900 font-black sticky left-0 bg-white border-r-2 border-slate-300">
                      Birthday Lapse
                    </td>
                    {displayedAnnualStates.map(state => (
                      <td key={`diag-${state.calendarYear}`} className="p-2 text-xs">
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                            state.birthdayLapse.isPowerNumber
                              ? 'bg-red-100 text-red-950 border border-red-400'
                              : 'text-slate-800'
                          }`}
                        >
                          {formatShortCompound(state.birthdayLapse.combinedCompound)}
                        </span>
                      </td>
                    ))}
                  </tr>
                )}

                {/* Documented Events Overlay Row */}
                {showEventOverlay && (
                  <tr className="bg-red-50/50 border-t-2 border-red-200">
                    <td className="p-2.5 text-left text-red-950 font-black sticky left-0 bg-red-50 border-r-2 border-slate-300">
                      Documented Events
                    </td>
                    {displayedAnnualStates.map(state => {
                      const matched = relevantEvents.filter(e => {
                        const y = parseInt(e.startDate.split('-')[0], 10);
                        return y === state.calendarYear;
                      });

                      return (
                        <td key={`events-${state.calendarYear}`} className="p-2 align-top">
                          {matched.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {matched.map(m => (
                                <button
                                  key={m.eventId}
                                  onClick={() => onJumpToForensicFocus?.(m)}
                                  className="text-[10px] font-bold p-1 rounded bg-red-100 border border-red-400 text-red-950 hover:bg-red-200 transition-colors text-left truncate block max-w-[80px]"
                                  title={`${m.title} (${m.startDate})`}
                                >
                                  {m.title}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY CHART (PRD Section 19) */}
      {displayMode === 'MONTHLY' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-white border-2 border-slate-300 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b-2 border-slate-300 bg-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-800" />
                <h3 className="text-sm font-black tracking-wider text-slate-950 uppercase">
                  Monthly: Year {selectedYear} ({currentPerson.displayName})
                </h3>
                <span className="text-xs font-bold text-slate-700">
                  Annual PY: {formatCompound(selectedAnnualState.py)} • ESS: {formatCompound(selectedAnnualState.ess)}
                </span>
              </div>
              <div className="text-xs font-bold text-amber-900">
                Reduced CM Cycle: Oct=1, Nov=2, Dec=3
              </div>
            </div>

            {/* 12 Months Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-950 border-b-2 border-slate-300">
                    <th className="p-3 text-left w-36 font-black uppercase tracking-wider sticky left-0 bg-slate-100 z-10 border-r-2 border-slate-300">
                      Monthly Row
                    </th>
                    {monthlyStates.map(m => (
                      <th
                        key={m.monthIndex}
                        onClick={() => setSelectedMonth(m.monthIndex)}
                        className={`p-2 min-w-[70px] cursor-pointer transition-colors ${
                          m.monthIndex === selectedMonth
                            ? 'bg-amber-100 border-t-2 border-amber-600 text-slate-950 ring-1 ring-amber-300'
                            : 'hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="text-xs font-black">{m.monthName.slice(0, 3)}</div>
                        <div className="text-[11px] text-slate-700 font-bold">M{m.monthIndex}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* 1. ESS (Annual Essence) */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 text-left text-amber-900 font-black sticky left-0 bg-white border-r-2 border-slate-300">
                      1. ESS (Essence)
                    </td>
                    {monthlyStates.map(m => (
                      <td key={`ess-m-${m.monthIndex}`} className="p-2 text-slate-950 font-black">
                        {formatCompound(m.ess)}
                      </td>
                    ))}
                  </tr>

                  {/* 2. PME (Personal Month Essence) */}
                  <tr className="bg-slate-50">
                    <td className="p-2.5 text-left text-purple-950 font-black sticky left-0 bg-slate-50 border-r-2 border-slate-300">
                      2. PME (Feeling Layer)
                    </td>
                    {monthlyStates.map(m => {
                      const isPower = m.pme.isPowerNumber;
                      return (
                        <td key={`pme-m-${m.monthIndex}`} className="p-2 font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${
                              isPower
                                ? 'bg-red-100 text-red-950 border border-red-400 font-black'
                                : 'text-purple-950 font-bold'
                            }`}
                          >
                            {formatCompound(m.pme)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* 3. MCOM (Monthly Combiner) */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 text-left text-emerald-950 font-black sticky left-0 bg-white border-r-2 border-slate-300">
                      3. MCOM (Action/Advice)
                    </td>
                    {monthlyStates.map(m => {
                      const isPower = m.mcom.isPowerNumber;
                      return (
                        <td key={`mcom-m-${m.monthIndex}`} className="p-2 font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${
                              isPower
                                ? 'bg-red-100 text-red-950 border border-red-400 font-black'
                                : 'text-emerald-950 font-bold'
                            }`}
                          >
                            {formatCompound(m.mcom)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* 4. PM (Personal Month) */}
                  <tr className="bg-slate-50">
                    <td className="p-2.5 text-left text-blue-950 font-black sticky left-0 bg-slate-50 border-r-2 border-slate-300">
                      4. PM (Personal Month)
                    </td>
                    {monthlyStates.map(m => {
                      const isPower = m.pm.isPowerNumber;
                      return (
                        <td key={`pm-m-${m.monthIndex}`} className="p-2 font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${
                              isPower
                                ? 'bg-red-100 text-red-950 border border-red-400 font-black'
                                : 'text-blue-950 font-bold'
                            }`}
                          >
                            {formatCompound(m.pm)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* 5. CM (Calendar Month Reduced) */}
                  <tr className="hover:bg-slate-50 text-slate-800">
                    <td className="p-2.5 text-left text-slate-800 font-bold sticky left-0 bg-white border-r-2 border-slate-300">
                      5. CM (Calendar Month)
                    </td>
                    {monthlyStates.map(m => (
                      <td key={`cm-m-${m.monthIndex}`} className="p-2 font-bold">
                        {m.cm}
                      </td>
                    ))}
                  </tr>

                  {/* 6. PY (Personal Year) */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 text-left text-slate-800 font-bold sticky left-0 bg-white border-r-2 border-slate-300">
                      6. PY (Annual Base)
                    </td>
                    {monthlyStates.map(m => (
                      <td key={`py-m-${m.monthIndex}`} className="p-2 text-slate-950 font-bold">
                        {formatCompound(m.py)}
                      </td>
                    ))}
                  </tr>

                  {/* Month-End Crossover (Section 22) */}
                  <tr className="bg-white border-t-2 border-slate-200">
                    <td className="p-2.5 text-left text-amber-900 font-black sticky left-0 bg-white border-r-2 border-slate-300">
                      End Crossover
                    </td>
                    {monthlyStates.map(m => (
                      <td key={`co-m-${m.monthIndex}`} className="p-2 text-xs">
                        {m.crossover && (
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                              m.crossover.isPowerNumber
                                ? 'bg-red-100 text-red-950 border border-red-400'
                                : 'text-slate-800'
                            }`}
                          >
                            {formatShortCompound(m.crossover.combinedCompound)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DAILY CALENDAR LAYER (PRD Section 25) */}
      {displayMode === 'DAILY' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-center justify-between text-xs text-amber-950 shadow-sm">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-800 shrink-0" />
              <span>
                Status:{' '}
                <strong className="font-black">
                  APPROVED LEGACY IMPLEMENTATION – REQUIRES FINAL PETER CERTIFICATION BEFORE BEING LABELED CANONICAL
                </strong>
              </span>
            </div>
            <div className="text-xs font-bold text-amber-900">
              Environment = Reduced Day + PM • Feel = Environment + PME • DCOM = Feel + Environment
            </div>
          </div>

          <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black tracking-wider text-slate-950 uppercase">
                Daily: {selectedMonthlyState.monthName} {selectedYear} ({currentPerson.displayName})
              </h3>
              <div className="text-xs font-bold text-slate-700">
                Active PM: {formatCompound(selectedMonthlyState.pm)} • PME: {formatCompound(selectedMonthlyState.pme)}
              </div>
            </div>

            {/* Daily Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {dailyStates.map(day => (
                <div
                  key={day.dayNumber}
                  className={`p-2.5 rounded-lg border-2 flex flex-col gap-1 transition-all ${
                    day.isPowerDay
                      ? 'border-red-400 bg-red-50 text-red-950 shadow-sm'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between border-b-2 border-slate-200 pb-1">
                    <span className="text-xs font-black text-slate-950">Day {day.dayNumber}</span>
                    {day.isPowerDay && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-200 text-red-950 border border-red-400 font-black">
                        PN {day.powerNumbers.join(',')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs flex justify-between text-slate-700 font-bold">
                    <span>Env:</span>
                    <span className="font-black text-blue-950">{formatCompound(day.environment)}</span>
                  </div>
                  <div className="text-xs flex justify-between text-slate-700 font-bold">
                    <span>Feel:</span>
                    <span className="font-black text-purple-950">{formatCompound(day.feel)}</span>
                  </div>
                  <div className="text-xs flex justify-between text-slate-700 pt-0.5 border-t border-slate-200 font-bold">
                    <span>DCOM:</span>
                    <span className="font-black text-emerald-950">{formatCompound(day.dcom)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: MULTI-PERSON STACK (PRD Section 26) */}
      {displayMode === 'STACK' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-slate-200">
              <div>
                <h3 className="text-sm font-black tracking-wider text-slate-950 uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-800" />
                  Multi-Person Annual Stack: Year {selectedYear}
                </h3>
                <p className="text-xs font-bold text-slate-700">
                  Synchronized comparative matrix across all {people.length} case subjects.
                </p>
              </div>

              {/* Group Findings Observation Bar */}
              <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-md border-2 border-slate-300 flex items-center gap-3">
                <span className="text-slate-700 font-bold">Group Findings:</span>
                <span className="text-slate-950 font-black">
                  {annualStackData.findings.subjectsWithPowerNumber} of {annualStackData.findings.totalSubjects} subjects active Power Numbers
                </span>
                {annualStackData.findings.intensificationCount > 0 && (
                  <span className="text-purple-950 font-black">
                    • {annualStackData.findings.intensificationCount} Intensification(s)
                  </span>
                )}
              </div>
            </div>

            {/* Stack Comparative Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-950 border-b-2 border-slate-300">
                    <th className="p-2.5 font-black">Subject</th>
                    <th className="p-2.5 font-black">Case Role</th>
                    <th className="p-2.5 font-black">DOB</th>
                    <th className="p-2.5 font-black">Age in {selectedYear}</th>
                    <th className="p-2.5 font-black">Letters</th>
                    <th className="p-2.5 font-black">ESS</th>
                    <th className="p-2.5 font-black">PY</th>
                    <th className="p-2.5 font-black">COM</th>
                    <th className="p-2.5 font-black">Power Numbers</th>
                    <th className="p-2.5 font-black">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {annualStackData.items.map(item => (
                    <tr
                      key={item.personId}
                      className={`hover:bg-slate-50 transition-colors ${
                        item.personId === activePersonId ? 'bg-amber-100/60 font-bold' : ''
                      }`}
                    >
                      <td className="p-2.5 font-black text-slate-950">{item.name}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 border border-slate-300 text-slate-900">
                          {item.roleInCase || 'SUBJECT'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-800 font-mono font-bold">{item.dob}</td>
                      <td className="p-2.5 text-slate-950 font-black">{item.age}</td>
                      <td className="p-2.5 font-black font-mono text-amber-950">
                        {item.activeLetters.join(' ')}
                      </td>
                      <td className="p-2.5 text-slate-950 font-black">{item.ess}</td>
                      <td className="p-2.5 text-blue-950 font-black">{item.py}</td>
                      <td className="p-2.5 text-emerald-950 font-black">{item.com}</td>
                      <td className="p-2.5">
                        {item.isPowerNumber ? (
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-red-100 text-red-950 border border-red-400 font-black">
                            {item.powerNumbers.join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        {item.isIntensified && (
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-purple-100 text-purple-950 border border-purple-400 font-black">
                            INTENS
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Objective Observations List (PRD Section 26.3) */}
            {annualStackData.findings.observations.length > 0 && (
              <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border-2 border-slate-300 text-xs text-slate-900 space-y-1.5 shadow-sm">
                <span className="text-xs uppercase tracking-wider text-slate-950 font-black block">
                  Deterministic Group Findings:
                </span>
                {annualStackData.findings.observations.map((obs, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    <span className="font-semibold text-slate-950">{obs}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
