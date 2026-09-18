import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PersonRecord } from '../types';
import { Report, normalizeName } from '../vendor/student-charts/numerology';
import { PrintYearSection, PrintMonthSection, TimelineAnnotations, type CellAnnotation } from '../vendor/student-charts/Timeline';
import { generateAnnualTimeMap } from '../core/lettrology-engine/annualEngine';
import { generateMonthlyCalendar } from '../core/lettrology-engine/monthlyEngine';
import { formatCompound, type CompoundValue } from '../core/lettrology-engine/compoundTrail';
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
const dateLabel = (year: number, month?: number) => month ? `${months[month - 1]} ${year}` : String(year);
const annotate = (label: string, value: CompoundValue): CellAnnotation => ({ title: `${label}: forensic compound ${formatCompound(value)}${value.isPowerNumber ? ` · PN ${value.powerNumber}` : ''}`, warning: value.isPowerNumber });

export function StudentTimeline({ person, mode, year, month, onYearChange, onMonthChange }: Props) {
  const [birthYear, birthMonth, birthDay] = person.dob.split('-').map(Number);
  const focusYear = Math.min(9998, Math.max(birthYear, year));
  const focusAge = focusYear - birthYear;
  const currentYear = new Date().getFullYear();
  const report = useMemo(() => new Report(normalizeName(person.verifiedBirthName).toUpperCase(), `${String(birthDay).padStart(2, '0')}/${String(birthMonth).padStart(2, '0')}/${birthYear}`, currentYear), [person.verifiedBirthName, person.dob, currentYear]);
  const start = Math.max(0, focusAge - 14);
  const extendedStart = Math.floor(focusAge / 80) * 80;
  const maxYear = Math.min(9998, Math.max(birthYear + 119, focusYear + 20));
  const [showPatterns, setShowPatterns] = useState(true);
  const [showDiagonals, setShowDiagonals] = useState(true);
  const [showIntensifiers, setShowIntensifiers] = useState(true);
  const annual = useMemo(() => generateAnnualTimeMap(person.verifiedBirthName, person.dob, birthYear + Math.max(0, Math.min(start, extendedStart) - 1), birthYear + Math.max(start + 31, extendedStart + 81)), [person.verifiedBirthName, person.dob, start, extendedStart]);
  const stateFor = (y: number) => annual.find(s => s.calendarYear === y);
  const selectedAnnual = stateFor(focusYear);
  const monthly = useMemo(() => [focusYear - 1, focusYear, focusYear + 1].flatMap(y => {
    const state = annual.find(s => s.calendarYear === y);
    return state ? generateMonthlyCalendar(state, annual.find(s => s.calendarYear === y + 1)) : [];
  }), [annual, focusYear]);
  const selectedMonthly = monthly.find(s => s.year === focusYear && s.monthIndex === month);
  const annualAnnotations = (offset: number, length: number) => Object.fromEntries((['ESS','COM','PY'] as const).map(label => [label, Array.from({length}, (_, i) => {
    const y = birthYear + offset + i;
    const state = stateFor(y);
    return state ? annotate(`${y} ${label}`, state[({ESS:'ess',COM:'com',PY:'py',CY:'cy'} as const)[label]]) : {title: String(y), warning:false};
  })]));
  const monthAnnotations = Object.fromEntries((['ESS','PME','MCOM','PM','PY'] as const).map(label => [label, Array.from({length:36}, (_, i) => {
    const y = focusYear - 1 + Math.floor(i / 12), m = i % 12 + 1;
    const state = monthly.find(s => s.year === y && s.monthIndex === m);
    return state ? annotate(`${dateLabel(y,m)} ${label}`, state[({ESS:'ess',PME:'pme',MCOM:'mcom',PM:'pm',PY:'py'} as const)[label]]) : {title:'Before birth',warning:false};
  })]));
  monthAnnotations.CM = Array.from({length:36}, (_,i) => ({title:dateLabel(focusYear - 1 + Math.floor(i/12),i%12+1),warning:false,selected:i === 12 + month - 1}));
  const changeYear = (value: number) => { if (Number.isFinite(value)) onYearChange(Math.min(9998, Math.max(birthYear, Math.trunc(value)))); };
  const changeMonth = (delta: number) => {
    const index = (focusYear - birthYear) * 12 + month - 1 + delta;
    if (index < 0 || index > (9998 - birthYear) * 12 + 11) return;
    changeYear(birthYear + Math.floor(index / 12)); onMonthChange(index % 12 + 1);
  };
  const compoundRows: [string, CompoundValue | undefined][] = mode !== 'MONTHLY'
    ? [['ESS',selectedAnnual?.ess],['COM',selectedAnnual?.com],['PY',selectedAnnual?.py],['CY',selectedAnnual?.cy], ...(showDiagonals ? [['Birthday lapse',selectedAnnual?.birthdayLapse.combinedCompound] as [string,CompoundValue | undefined]] : [])]
    : [['ESS',selectedMonthly?.ess],['PME',selectedMonthly?.pme],['MCOM',selectedMonthly?.mcom],['PM',selectedMonthly?.pm],['PY',selectedMonthly?.py], ...(showDiagonals ? [['End crossover',selectedMonthly?.crossover?.combinedCompound] as [string,CompoundValue | undefined]] : [])];

  return <section className="student-timeline" aria-label={`${mode === 'FULL' ? 'Full chart report' : mode === 'ANNUAL' ? 'Annual student timeline' : 'Monthly student timeline'}`}>
    {mode === 'FULL' && <ReportIdentity report={report}/> }
    <div className="timeline-navigation">
      <div><h2>{mode === 'FULL' ? 'Chart time controls' : mode === 'ANNUAL' ? 'Annual timeline' : 'Monthly timeline'}</h2><p>{person.displayName} · {dateLabel(focusYear,mode === 'MONTHLY' ? month : undefined)} · Age {focusAge}</p></div>
      <label className="timeline-year-input">Go to year<input aria-label="Go to timeline year" type="number" min={birthYear} max={9998} key={focusYear} defaultValue={focusYear} onBlur={e => {if(e.target.value) changeYear(Number(e.target.value)); else e.target.value = String(focusYear);}} onKeyDown={e => {if(e.key === "Enter") e.currentTarget.blur();}} /></label>
      <label className="timeline-year-slider">Year: {focusYear}<input aria-label="Timeline year slider" type="range" min={birthYear} max={maxYear} value={focusYear} onChange={e => changeYear(Number(e.target.value))} /></label>
      {mode !== 'ANNUAL' && <div className="timeline-month-controls">
        <button className="secondary-button" aria-label="Previous timeline month" disabled={focusYear === birthYear && month === 1} onClick={() => changeMonth(-1)}><ChevronLeft size={20}/></button>
        <label>Month: {months[month-1]}<input aria-label="Timeline month slider" type="range" min={1} max={12} value={month} onChange={e => onMonthChange(Number(e.target.value))}/></label>
        <button className="secondary-button" aria-label="Next timeline month" disabled={focusYear === 9998 && month === 12} onClick={() => changeMonth(1)}><ChevronRight size={20}/></button>
      </div>}
    </div>
    <div className="timeline-chart-card">
      <h3>{mode !== 'MONTHLY' ? 'Yearly Timeline — Personal Cycles' : 'Yearly / Monthly Timeline Summary'}</h3>
      <div className="student-chart-paper">
        <div className="print-panel-scroll" tabIndex={0} role="region" aria-label="Timeline chart; scroll horizontally to explore">
          <TimelineAnnotations.Provider value={showPatterns ? (mode !== 'MONTHLY' ? annualAnnotations(start,30) : monthAnnotations) : (mode === 'MONTHLY' ? {CM:monthAnnotations.CM} : {})}>
            {mode !== 'MONTHLY' ? <PrintYearSection report={report} start={start} length={30} variant="focus"/> : <PrintMonthSection report={report} currentYear={currentYear} focusYear={focusYear}/>}
          </TimelineAnnotations.Provider>
        </div>
      </div>
      <p className="timeline-caption">{mode !== 'MONTHLY' ? `${birthYear + start}–${birthYear + start + 29} · Ages ${start}–${start + 29} · * marks the current age.` : `${focusYear - 1}–${focusYear + 1} · January through December in each year. The gold frame marks the center year.`}</p>
    </div>
    {mode === 'FULL' && <div className="timeline-chart-card">
      <h3>Yearly / Monthly Timeline Summary</h3>
      <div className="student-chart-paper"><div className="print-panel-scroll" tabIndex={0} role="region" aria-label="Three year monthly timeline; scroll horizontally to explore">
        <TimelineAnnotations.Provider value={showPatterns ? monthAnnotations : {CM:monthAnnotations.CM}}><PrintMonthSection report={report} currentYear={currentYear} focusYear={focusYear}/></TimelineAnnotations.Provider>
      </div></div>
      <p className="timeline-caption">{focusYear - 1}–{focusYear + 1} · January through December. Gold marks the center year and selected month.</p>
    </div>}
    {mode !== 'MONTHLY' && <section className="timeline-extended"><h3>Sequence Timeline — Extended Cycles · Ages {extendedStart}–{extendedStart+79}</h3>
      <div className="student-chart-paper"><div className="print-panel-scroll" tabIndex={0} role="region" aria-label="Extended sequence timeline; scroll horizontally to explore">
        <TimelineAnnotations.Provider value={showPatterns ? annualAnnotations(extendedStart,80) : {}}><PrintYearSection report={report} start={extendedStart} length={80} variant="lifetime"/></TimelineAnnotations.Provider>
      </div></div>
    </section>}
    <section className="timeline-warning-panel" aria-label="Forensic pattern warnings">
      <h3>Pattern warnings · {dateLabel(focusYear,mode === 'MONTHLY' ? month : undefined)}</h3>
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
        <div>{(mode !== 'MONTHLY' ? annual.filter(s => s.calendarYear >= birthYear + start && s.calendarYear < birthYear + start + 30).map(s => ({year:s.calendarYear, month:undefined as number | undefined, labels:[...s.powerNumbers.map(n=>`PN ${n}`), ...(showIntensifiers && s.isIntensified ? ['INTENS'] : []), ...(s.isCycleReset ? ['9→1 RESET'] : []), ...(showDiagonals && s.birthdayLapse.isPowerNumber ? [`Birthday lapse ${formatCompound(s.birthdayLapse.combinedCompound)}`] : [])]})) : monthly.map(s => ({year:s.year,month:s.monthIndex,labels:[...s.powerNumbers.map(n=>`PN ${n}`),...(showDiagonals && s.crossover?.isPowerNumber ? [`End crossover ${formatCompound(s.crossover.combinedCompound)}`] : [])]}))).filter(s=>s.labels.length).map(s=><button className="secondary-button" key={`${s.year}-${s.month ?? 0}`} onClick={()=>{changeYear(s.year);if(s.month) onMonthChange(s.month);}}><strong>{dateLabel(s.year,s.month)}</strong><span>{s.labels.join(' · ')}</span></button>)}</div>
      </details>
    </section>
  </section>;
}
