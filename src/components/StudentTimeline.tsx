import { useMemo, useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PersonRecord } from '../types';
import { Report, normalizeName, type MonthsSet, type YearsSet } from '../vendor/student-charts/numerology';
import { PrintYearSection, PrintMonthSection, TimelineAnnotations, type CellAnnotation } from '../vendor/student-charts/Timeline';
import { generateAnnualTimeMap } from '../core/lettrology-engine/annualEngine';
import { generateMonthlyCalendar } from '../core/lettrology-engine/monthlyEngine';
import { formatCompound, type CompoundValue } from '../core/lettrology-engine/compoundTrail';
import {
  addHistoricalYears,
  formatHistoricalMonthYear,
  formatHistoricalYear,
  formatReportDob,
  historicalYearDifference,
  nextHistoricalYear,
  parseHistoricalDate,
  parseHistoricalYearInput,
} from '../core/historicalDate';
import './StudentTimeline.css';
import { ReportIdentity } from '../vendor/student-charts/ReportIdentity';

interface Props {
  person: PersonRecord;
  mode: 'FULL' | 'ANNUAL' | 'MONTHLY';
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dateLabel = (year: number, month?: number) => month ? formatHistoricalMonthYear(year, month) : formatHistoricalYear(year);
const annotate = (label: string, value: CompoundValue): CellAnnotation => ({ title: `${label}: forensic compound ${formatCompound(value)}${value.isPowerNumber ? ` · PN ${value.powerNumber}` : ''}`, warning: value.isPowerNumber });
const EMPTY_MONTH: MonthsSet = { essence: '............', personalYear: '............', personalMonth: '............', personalMonthEssence: '............', combined: '............' };

export function StudentTimeline({ person, mode, year, month, onYearChange, onMonthChange }: Props) {
  const parsedDob = parseHistoricalDate(person.dob);
  if (!parsedDob) return <section className="student-timeline"><p>Unable to read this birth date.</p></section>;

  const birthYear = parsedDob.signedYear;
  const birthMonth = parsedDob.month;
  const birthDay = parsedDob.day;
  const requestedAge = year === 0 ? 0 : historicalYearDifference(birthYear, year);
  const focusAge = Math.max(0, requestedAge);
  const focusYear = addHistoricalYears(birthYear, focusAge);
  const maxCalendarAge = Math.max(0, historicalYearDifference(birthYear, 9999));
  const [timelineRangeMax, setTimelineRangeMax] = useState(() => Math.min(maxCalendarAge, Math.max(119, focusAge + 20)));
  const maxAge = timelineRangeMax;
  const reportCurrentYear = parsedDob.year + focusAge;
  const report = useMemo(() => new Report(normalizeName(person.verifiedBirthName).toUpperCase(), formatReportDob(person.dob), reportCurrentYear), [person.verifiedBirthName, person.dob, reportCurrentYear]);
  const start = Math.max(0, focusAge - 14);
  const extendedStart = Math.max(0, focusAge - 40);
  const [fitSheet, setFitSheet] = useState(true);
  const [sheetScale, setSheetScale] = useState(1);
  const [chartZoom, setChartZoom] = useState(100);
  const sheetViewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusAge > timelineRangeMax) {
      setTimelineRangeMax(Math.min(maxCalendarAge, Math.max(focusAge + 20, timelineRangeMax)));
    }
  }, [focusAge, maxCalendarAge, timelineRangeMax]);

  useEffect(() => {
    const viewport = sheetViewport.current;
    if (!viewport || mode !== 'FULL') return;
    const resize = () => setSheetScale(Math.min(1, viewport.clientWidth / 794, Math.max(260, window.innerHeight - 180) / 1048));
    const observer = new ResizeObserver(resize);
    observer.observe(viewport); window.addEventListener('resize', resize); resize();
    return () => { observer.disconnect(); window.removeEventListener('resize', resize); };
  }, [mode]);

  const [showPatterns, setShowPatterns] = useState(true);
  const [showDiagonals, setShowDiagonals] = useState(true);
  const [showIntensifiers, setShowIntensifiers] = useState(true);
  const annualStartAge = Math.max(0, Math.min(start, extendedStart) - 1);
  const annualEndAge = Math.min(maxCalendarAge, Math.max(start + 31, extendedStart + 81, focusAge + 2));
  const annual = useMemo(() => generateAnnualTimeMap(person.verifiedBirthName, person.dob, annualStartAge, annualEndAge, 'AGE'), [person.verifiedBirthName, person.dob, annualStartAge, annualEndAge]);
  const stateFor = (y: number) => annual.find(s => s.calendarYear === y);
  const selectedAnnual = stateFor(focusYear);
  const monthlyYears = [addHistoricalYears(focusYear, -1), focusYear, addHistoricalYears(focusYear, 1)];
  const monthly = useMemo(() => monthlyYears.flatMap(y => {
    const state = annual.find(s => s.calendarYear === y);
    return state ? generateMonthlyCalendar(state, annual.find(s => s.calendarYear === nextHistoricalYear(y))) : [];
  }), [annual, focusYear]);
  const selectedMonthly = monthly.find(s => s.year === focusYear && s.monthIndex === month);

  const annualAnnotations = (offset: number, length: number) => Object.fromEntries((['ESS','COM','PY'] as const).map(label => [label, Array.from({length}, (_, i) => {
    const y = addHistoricalYears(birthYear, offset + i);
    const state = stateFor(y);
    return state ? annotate(`${formatHistoricalYear(y)} ${label}`, state[({ESS:'ess',COM:'com',PY:'py',CY:'cy'} as const)[label]]) : {title: formatHistoricalYear(y), warning:false};
  })]));
  const monthAnnotations = Object.fromEntries((['ESS','PME','MCOM','PM','PY'] as const).map(label => [label, Array.from({length:36}, (_, i) => {
    const y = addHistoricalYears(focusYear, -1 + Math.floor(i / 12)), m = i % 12 + 1;
    const state = monthly.find(s => s.year === y && s.monthIndex === m);
    return state ? annotate(`${dateLabel(y,m)} ${label}`, state[({ESS:'ess',PME:'pme',MCOM:'mcom',PM:'pm',PY:'py'} as const)[label]]) : {title:'Before birth',warning:false};
  })]));
  monthAnnotations.CM = Array.from({length:36}, (_,i) => ({title:dateLabel(addHistoricalYears(focusYear, -1 + Math.floor(i/12)),i%12+1),warning:false,selected:i === 12 + month - 1}));

  const changeYear = (value: number) => {
    if (!Number.isFinite(value) || value === 0) return;
    const age = historicalYearDifference(birthYear, Math.trunc(value));
    if (age < 0 || age > maxCalendarAge) return;
    onYearChange(Math.trunc(value));
  };
  const changeYearText = (value: string) => {
    const parsed = parseHistoricalYearInput(value);
    if (parsed !== null) changeYear(parsed);
  };
  const changeMonth = (delta: number) => {
    const index = focusAge * 12 + month - 1 + delta;
    if (index < 0 || index > maxCalendarAge * 12 + 11) return;
    changeYear(addHistoricalYears(birthYear, Math.floor(index / 12))); onMonthChange(index % 12 + 1);
  };

  const buildYearSet = (offset: number, length: number): YearsSet => {
    const base = report.getYearSet(offset, length);
    const states = Array.from({length}, (_, i) => stateFor(addHistoricalYears(birthYear, offset + i)));
    const row = (pick: (state: NonNullable<typeof states[number]>) => number) => states.map(state => state ? String(pick(state)) : ' ').join('');
    return {
      names: base.names,
      essence: row(state => state.ess.root),
      combined: row(state => state.com.root),
      personalYear: row(state => state.py.root),
      calendarYear: row(state => state.cy.root),
    };
  };

  const monthSets: MonthsSet[] = monthlyYears.map(y => {
    const states = monthly.filter(s => s.year === y).sort((a,b) => a.monthIndex - b.monthIndex);
    if (states.length !== 12) return EMPTY_MONTH;
    return {
      essence: states.map(s => s.ess.root).join(''),
      personalYear: states.map(s => s.py.root).join(''),
      personalMonth: states.map(s => s.pm.root).join(''),
      personalMonthEssence: states.map(s => s.pme.root).join(''),
      combined: states.map(s => s.mcom.root).join(''),
    };
  });

  const compoundRows: [string, CompoundValue | undefined][] = mode !== 'MONTHLY'
    ? [['ESS',selectedAnnual?.ess],['COM',selectedAnnual?.com],['PY',selectedAnnual?.py],['CY',selectedAnnual?.cy], ...(showDiagonals ? [['Birthday lapse',selectedAnnual?.birthdayLapse.combinedCompound] as [string,CompoundValue | undefined]] : [])]
    : [['ESS',selectedMonthly?.ess],['PME',selectedMonthly?.pme],['MCOM',selectedMonthly?.mcom],['PM',selectedMonthly?.pm],['PY',selectedMonthly?.py], ...(showDiagonals ? [['End crossover',selectedMonthly?.crossover?.combinedCompound] as [string,CompoundValue | undefined]] : [])];

  const focusRangeStart = formatHistoricalYear(addHistoricalYears(birthYear, start));
  const focusRangeEnd = formatHistoricalYear(addHistoricalYears(birthYear, start + 29));
  const monthRangeStart = formatHistoricalYear(addHistoricalYears(focusYear, -1));
  const monthRangeEnd = formatHistoricalYear(addHistoricalYears(focusYear, 1));
  const effectiveSheetZoom = mode === 'FULL' ? (fitSheet ? sheetScale : 1) * (chartZoom / 100) : 1;

  return <section className={`student-timeline ${mode === 'FULL' ? 'complete-chart' : ''}`} aria-label={`${mode === 'FULL' ? 'Full chart report' : mode === 'ANNUAL' ? 'Annual student timeline' : 'Monthly student timeline'}`}>
    <div className="timeline-navigation">
      <div><h2>{mode === 'FULL' ? 'Chart time controls' : mode === 'ANNUAL' ? 'Annual timeline' : 'Monthly timeline'}</h2><p>{person.displayName} · {dateLabel(focusYear,mode === 'MONTHLY' ? month : undefined)} · Age {focusAge}</p></div>
      <label className="timeline-year-input">Go to year<input aria-label="Go to timeline year, for example 44 BC or 2026 AD" type="text" key={focusYear} defaultValue={formatHistoricalYear(focusYear)} onBlur={e => {if(e.target.value) changeYearText(e.target.value); e.target.value = formatHistoricalYear(focusYear);}} onKeyDown={e => {if(e.key === 'Enter') e.currentTarget.blur();}} /></label>
      <label className="timeline-year-slider">Timeline position · {formatHistoricalYear(focusYear)} · Age {focusAge}<input aria-label="Timeline position slider" type="range" min={0} max={maxAge} value={Math.min(focusAge, maxAge)} onChange={e => changeYear(addHistoricalYears(birthYear,Number(e.target.value)))} /></label>
      {mode !== 'ANNUAL' && <div className="timeline-month-controls">
        <button className="secondary-button" aria-label="Previous timeline month" disabled={focusAge === 0 && month === 1} onClick={() => changeMonth(-1)}><ChevronLeft size={20}/></button>
        <label>Month: {months[month-1]}<input aria-label="Timeline month slider" type="range" min={1} max={12} value={month} onChange={e => onMonthChange(Number(e.target.value))}/></label>
        <button className="secondary-button" aria-label="Next timeline month" disabled={focusAge === maxCalendarAge && month === 12} onClick={() => changeMonth(1)}><ChevronRight size={20}/></button>
      </div>}
    </div>
    {mode === 'FULL' && <div className="sheet-view-controls">
      <button className="secondary-button" aria-pressed={fitSheet} onClick={() => {setFitSheet(!fitSheet); sheetViewport.current?.scrollIntoView({block:'start'});}}>{fitSheet ? 'Enlarge for reading' : 'Fit complete sheet'}</button>
      <label className="chart-size-control">Chart size · {chartZoom}%<input aria-label="Chart size" type="range" min={75} max={135} step={5} value={chartZoom} onChange={e => setChartZoom(Number(e.target.value))} /></label>
      <span>Timeline position and chart size are separate controls.</span>
    </div>}
    <div ref={sheetViewport} className="timeline-sheet-viewport">
    <div className="timeline-report-sheet" style={mode === 'FULL' ? {zoom: effectiveSheetZoom} : undefined}>
    {mode === 'FULL' && <ReportIdentity report={report}/>}
    <div className="timeline-chart-card">
      <h3>{mode !== 'MONTHLY' ? 'Yearly Timeline — Personal Cycles' : 'Yearly / Monthly Timeline Summary'}</h3>
      <div className="student-chart-paper">
        <div className="print-panel-scroll" tabIndex={0} role="region" aria-label="Timeline chart; scroll horizontally to explore">
          <TimelineAnnotations.Provider value={showPatterns ? (mode !== 'MONTHLY' ? annualAnnotations(start,30) : monthAnnotations) : (mode === 'MONTHLY' ? {CM:monthAnnotations.CM} : {})}>
            {mode !== 'MONTHLY' ? <PrintYearSection report={report} start={start} length={30} variant="focus" markerAge={focusAge} yearSetOverride={buildYearSet(start,30)}/> : <PrintMonthSection report={report} currentYear={reportCurrentYear} focusYear={focusYear} focusAgeOverride={focusAge} setsOverride={monthSets} yearLabelsOverride={monthlyYears.map(formatHistoricalYear)}/>}
          </TimelineAnnotations.Provider>
        </div>
      </div>
      <p className="timeline-caption">{mode !== 'MONTHLY' ? `${focusRangeStart}–${focusRangeEnd} · Ages ${start}–${start + 29} · * marks the selected age.` : `${monthRangeStart}–${monthRangeEnd} · January through December in each year. The gold frame marks the center year.`}</p>
    </div>
    {mode === 'FULL' && <div className="timeline-chart-card">
      <h3>Yearly / Monthly Timeline Summary</h3>
      <div className="student-chart-paper"><div className="print-panel-scroll" tabIndex={0} role="region" aria-label="Three year monthly timeline; scroll horizontally to explore">
        <TimelineAnnotations.Provider value={showPatterns ? monthAnnotations : {CM:monthAnnotations.CM}}><PrintMonthSection report={report} currentYear={reportCurrentYear} focusYear={focusYear} focusAgeOverride={focusAge} setsOverride={monthSets} yearLabelsOverride={monthlyYears.map(formatHistoricalYear)}/></TimelineAnnotations.Provider>
      </div></div>
      <p className="timeline-caption">{monthRangeStart}–{monthRangeEnd} · January through December. Gold marks the center year and selected month.</p>
    </div>}
    {mode !== 'MONTHLY' && <section className="timeline-extended"><h3>Sequence Timeline — Extended Cycles · Ages {extendedStart}–{extendedStart+79}</h3>
      <div className="student-chart-paper"><div className="print-panel-scroll" tabIndex={0} role="region" aria-label="Extended sequence timeline; scroll horizontally to explore">
        <TimelineAnnotations.Provider value={showPatterns ? annualAnnotations(extendedStart,80) : {}}><PrintYearSection report={report} start={extendedStart} length={80} variant="lifetime" markerAge={focusAge} yearSetOverride={buildYearSet(extendedStart,80)}/></TimelineAnnotations.Provider>
      </div></div>
    </section>}
    </div></div>
    <details className="timeline-warning-panel" aria-label="Forensic pattern warnings">
      <summary>Pattern warnings · {dateLabel(focusYear,mode === 'MONTHLY' ? month : undefined)}</summary>
      <p>The timeline keeps the student chart’s values. Outlined cells flag existing forensic compound patterns for that date; the compound values are shown below.</p>
      <div className="timeline-pattern-options">
        <label><input type="checkbox" checked={showPatterns} onChange={e=>setShowPatterns(e.target.checked)}/>Highlight patterns</label>
        <label><input type="checkbox" checked={showDiagonals} onChange={e=>setShowDiagonals(e.target.checked)}/> {mode === 'FULL' ? 'Birthday lapse / End crossover' : mode === 'ANNUAL' ? 'Birthday lapse' : 'End crossover'}</label>
        {mode !== 'MONTHLY' && <label><input type="checkbox" checked={showIntensifiers} onChange={e=>setShowIntensifiers(e.target.checked)}/>Intensifications</label>}
      </div>
      <dl className="timeline-compounds">{compoundRows.map(([label,value]) => value && <div key={label}><dt>{label}</dt><dd className={showPatterns && value.isPowerNumber ? 'forensic-power' : ''}>{formatCompound(value)}{value.isPowerNumber && <small> PN {value.powerNumber}</small>}</dd></div>)}</dl>
      {mode === 'FULL' && selectedMonthly && <div><h4>Monthly patterns · {dateLabel(focusYear,month)}</h4><dl className="timeline-compounds">{([['ESS',selectedMonthly.ess],['PME',selectedMonthly.pme],['MCOM',selectedMonthly.mcom],['PM',selectedMonthly.pm],['PY',selectedMonthly.py],...(showDiagonals && selectedMonthly.crossover ? [['End crossover',selectedMonthly.crossover.combinedCompound]] : [])] as [string,CompoundValue][]).map(([label,value])=><div key={label}><dt>{label}</dt><dd className={showPatterns && value.isPowerNumber ? 'forensic-power' : ''}>{formatCompound(value)}{value.isPowerNumber && <small> PN {value.powerNumber}</small>}</dd></div>)}</dl></div>}
      <div className="timeline-flags">
        {(mode !== 'MONTHLY' ? selectedAnnual?.powerNumbers : selectedMonthly?.powerNumbers)?.map(n=><span className="forensic-power" key={n}>PN {n}</span>)}
        {mode !== 'MONTHLY' && showIntensifiers && selectedAnnual?.isIntensified && <span className="forensic-intensified">INTENS</span>}
        {mode !== 'MONTHLY' && selectedAnnual?.isCycleReset && <span className="forensic-reset">9→1 RESET</span>}
      </div>
      <details className="timeline-warning-list"><summary>All warnings in this timeline</summary>
        <div>{(mode !== 'MONTHLY' ? annual.filter(s => {const age = historicalYearDifference(birthYear,s.calendarYear);return age >= start && age < start + 30;}).map(s => ({year:s.calendarYear, month:undefined as number | undefined, labels:[...s.powerNumbers.map(n=>`PN ${n}`), ...(showIntensifiers && s.isIntensified ? ['INTENS'] : []), ...(s.isCycleReset ? ['9→1 RESET'] : []), ...(showDiagonals && s.birthdayLapse.isPowerNumber ? [`Birthday lapse ${formatCompound(s.birthdayLapse.combinedCompound)}`] : [])]})) : monthly.map(s => ({year:s.year,month:s.monthIndex,labels:[...s.powerNumbers.map(n=>`PN ${n}`),...(showDiagonals && s.crossover?.isPowerNumber ? [`End crossover ${formatCompound(s.crossover.combinedCompound)}`] : [])]}))).filter(s=>s.labels.length).map(s=><button className="secondary-button" key={`${s.year}-${s.month ?? 0}`} onClick={()=>{changeYear(s.year);if(s.month) onMonthChange(s.month);}}><strong>{dateLabel(s.year,s.month)}</strong><span>{s.labels.join(' · ')}</span></button>)}</div>
      </details>
    </details>
  </section>;
}