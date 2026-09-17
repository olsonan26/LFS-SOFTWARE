/**
 * @license
 * Lettrology Forensic Science - Forensic Focus Mode & Arithmetic Breakdown
 * PRD Section 24: Forensic Focus Mode
 * PRD Section 49: Professional Language & Non-Evidentiary Framing
 */

import React, { useState, useMemo } from 'react';
import {
  Crosshair,
  AlertTriangle,
  FileCheck,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Info,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { EventRecord, PersonRecord, CaseRecord, EvidenceRecord } from '../types.ts';
import {
  generateAnnualTimeMap,
  AnnualState,
} from '../core/lettrology-engine/annualEngine.ts';
import {
  generateMonthlyCalendar,
  MonthlyState,
} from '../core/lettrology-engine/monthlyEngine.ts';
import {
  generateForensicSignature,
  ForensicSignatureBreakdown,
  POWER_NUMBER_DESCRIPTIONS,
} from '../core/lettrology-engine/patternEngine.ts';

interface ForensicFocusViewProps {
  caseRecord: CaseRecord;
  events: EventRecord[];
  people: PersonRecord[];
  evidenceList: EvidenceRecord[];
  initialEventId?: string;
}

export const ForensicFocusView: React.FC<ForensicFocusViewProps> = ({
  caseRecord,
  events,
  people,
  evidenceList,
  initialEventId,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEventId || events[0]?.eventId || ''
  );
  const [activeSubjectId, setActiveSubjectId] = useState<string>(
    people[0]?.personId || ''
  );
  const [showExperimental, setShowExperimental] = useState<boolean>(true);

  // Selected event
  const selectedEvent = useMemo(() => {
    return events.find(e => e.eventId === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // People involved in selected event
  const eventSubjects = useMemo(() => {
    if (!selectedEvent) return people;
    const involved = people.filter(p => selectedEvent.peopleInvolved.includes(p.personId));
    return involved.length > 0 ? involved : people;
  }, [selectedEvent, people]);

  // Active person for breakdown
  const currentSubject = useMemo(() => {
    const found = eventSubjects.find(p => p.personId === activeSubjectId);
    return found || eventSubjects[0] || people[0];
  }, [eventSubjects, activeSubjectId, people]);

  // Parse event date
  const eventDateParsed = useMemo(() => {
    if (!selectedEvent) return { year: 2024, month: 7, day: 14 };
    const parts = selectedEvent.startDate.split('-').map(Number);
    return {
      year: parts[0] || 2024,
      month: parts[1] || 1,
      day: parts[2] || 1,
    };
  }, [selectedEvent]);

  // Compute annual and monthly state for the event timestamp
  const annualState = useMemo(() => {
    if (!currentSubject) return null;
    const timeMap = generateAnnualTimeMap(
      currentSubject.verifiedBirthName,
      currentSubject.dob,
      eventDateParsed.year,
      eventDateParsed.year
    );
    return timeMap[0] || null;
  }, [currentSubject, eventDateParsed.year]);

  const nextAnnualState = useMemo(() => {
    if (!currentSubject) return null;
    const timeMap = generateAnnualTimeMap(
      currentSubject.verifiedBirthName,
      currentSubject.dob,
      eventDateParsed.year + 1,
      eventDateParsed.year + 1
    );
    return timeMap[0] || null;
  }, [currentSubject, eventDateParsed.year]);

  const monthlyState = useMemo(() => {
    if (!annualState) return null;
    const months = generateMonthlyCalendar(annualState, nextAnnualState || undefined);
    return months[eventDateParsed.month - 1] || months[0] || null;
  }, [annualState, nextAnnualState, eventDateParsed.month]);

  // Generate complete transparent arithmetic signature
  const signature: ForensicSignatureBreakdown | null = useMemo(() => {
    if (!currentSubject || !annualState || !monthlyState || !selectedEvent) return null;
    return generateForensicSignature(
      currentSubject.verifiedBirthName,
      selectedEvent.startDate,
      annualState,
      monthlyState,
      selectedEvent.time
    );
  }, [currentSubject, annualState, monthlyState, selectedEvent]);

  // Linked evidence items for this event
  const linkedEvidence = useMemo(() => {
    if (!selectedEvent) return [];
    return evidenceList.filter(ev => selectedEvent.evidenceIds.includes(ev.evidenceId));
  }, [selectedEvent, evidenceList]);

  if (!selectedEvent || !currentSubject) {
    return <div className="p-8 text-center text-slate-700 font-bold">No events or subjects available.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Top Banner: Absolute Rule 7 & 15 Warning */}
      <div className="p-4 rounded-lg bg-amber-50 border-2 border-amber-400 flex items-start gap-3 text-xs text-amber-950 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div>
          <span className="font-black uppercase tracking-wider text-amber-950 block mb-0.5 text-xs">
            Forensic Focus Standard: Numerical Pattern Research Is Not Evidentiary Proof
          </span>
          <p className="text-slate-800 font-medium leading-relaxed">
            The calculations below represent deterministic numerical timing models associated with the subject’s
            verified birth name and date of birth during the documented event window. These patterns do not establish
            culpability, motive, guilt, or legal responsibility. Factual conclusions must rely exclusively on physical,
            documentary, and corroborated forensic evidence.
          </p>
        </div>
      </div>

      {/* Control Header: Event & Subject Selector */}
      <div className="p-4 rounded-lg bg-white border-2 border-slate-300 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Event Selector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 border-2 border-red-400 flex items-center justify-center text-red-900 font-black">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <label className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-1">
              Documented Event Under Review
            </label>
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="bg-white border-2 border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold text-slate-950 focus:outline-none focus:border-slate-800"
            >
              {events.map(e => (
                <option key={e.eventId} value={e.eventId}>
                  {e.title} ({e.startDate} {e.time ? `• ${e.time}` : ''}) • {e.category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject In Question */}
        <div className="flex items-center gap-3">
          <div>
            <label className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-1">
              Aligned Subject
            </label>
            <select
              value={activeSubjectId}
              onChange={e => setActiveSubjectId(e.target.value)}
              className="bg-white border-2 border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold text-slate-950 focus:outline-none focus:border-slate-800"
            >
              {eventSubjects.map(p => (
                <option key={p.personId} value={p.personId}>
                  {p.displayName} ({p.roleInCase}) • DOB: {p.dob}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <label className="flex items-center gap-1.5 text-xs text-slate-900 font-bold cursor-pointer bg-slate-100 px-3 py-2 rounded-md border-2 border-slate-300 hover:border-slate-600">
              <input
                type="checkbox"
                checked={showExperimental}
                onChange={e => setShowExperimental(e.target.checked)}
                className="rounded border-slate-400 text-purple-700 w-4 h-4"
              />
              <span className="text-purple-950 font-bold">Show Experimental Rules</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Grid: Event Facts (Left) & Complete Arithmetic Signature (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Factual Evidence & Event Profile */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200 mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-600" />
                Event Provenance & Facts
              </h4>
              <span className="text-xs px-2.5 py-0.5 rounded-md font-black bg-emerald-100 border border-emerald-400 text-emerald-950 uppercase">
                {selectedEvent.factStatus}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-0.5">
                  Event Title
                </span>
                <span className="font-black text-slate-950 text-sm">{selectedEvent.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-0.5">
                    Date & Time
                  </span>
                  <span className="font-mono font-black text-blue-950">
                    {selectedEvent.startDate} {selectedEvent.time ? `@ ${selectedEvent.time}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-0.5">
                    Precision
                  </span>
                  <span className="text-slate-900 font-bold">{selectedEvent.datePrecision}</span>
                </div>
              </div>

              {selectedEvent.location && (
                <div>
                  <span className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-0.5">
                    Documented Location
                  </span>
                  <span className="text-slate-900 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-600" />
                    {selectedEvent.location}
                  </span>
                </div>
              )}

              <div>
                <span className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-0.5">
                  Factual Description
                </span>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-md border-2 border-slate-200 leading-relaxed font-medium">
                  {selectedEvent.description}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-0.5">
                  Source Reliability
                </span>
                <span className="text-emerald-900 font-black">{selectedEvent.sourceReliability}</span>
              </div>

              {/* Linked Evidence Files */}
              <div className="pt-3 border-t-2 border-slate-200">
                <span className="text-xs text-slate-800 font-black uppercase tracking-wider block mb-2">
                  Corroborating Evidence ({linkedEvidence.length})
                </span>
                {linkedEvidence.length > 0 ? (
                  <div className="space-y-2">
                    {linkedEvidence.map(ev => (
                      <div
                        key={ev.evidenceId}
                        className="p-2.5 rounded-md bg-slate-50 border-2 border-slate-200 text-xs"
                      >
                        <div className="font-black text-slate-950">{ev.title}</div>
                        <div className="text-xs text-slate-700 flex justify-between mt-1 font-semibold">
                          <span>{ev.evidenceType}</span>
                          <span className="text-emerald-900 font-bold">Rating: {ev.reliabilityRating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic font-medium">No direct evidence items linked.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Arithmetic Signature Panel (PRD Section 24.2) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200 mb-4">
              <div>
                <h4 className="text-base font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Forensic Signature: Exact Arithmetic Proof
                </h4>
                <p className="text-xs text-slate-700 font-semibold mt-0.5">
                  Transparent operand-level calculations for <strong className="text-black">{currentSubject.displayName}</strong> on <strong className="text-black">{selectedEvent.startDate}</strong>.
                </p>
              </div>
              <div className="text-xs px-2.5 py-1 rounded-md border-2 border-amber-500 bg-amber-50 font-black text-amber-950">
                Deterministic Engine v1.0.4
              </div>
            </div>

            {/* Arithmetic Formula Table */}
            {signature && (
              <div className="space-y-4">
                <div className="overflow-x-auto border-2 border-slate-300 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b-2 border-slate-300 font-black">
                        <th className="p-3">Layer</th>
                        <th className="p-3">Exact Operands</th>
                        <th className="p-3 text-center">Raw Sum</th>
                        <th className="p-3 text-center">Compound Trail</th>
                        <th className="p-3 text-center">Root</th>
                        <th className="p-3">Authentic Marker</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-200 font-medium">
                      {/* Canonical Lines */}
                      {signature.canonicalLines.map((line, idx) => (
                        <tr
                          key={`canon-${idx}`}
                          className={`hover:bg-slate-50 transition-colors ${
                            line.isPowerNumber ? 'bg-red-50' : ''
                          }`}
                        >
                          <td className="p-3 font-black text-slate-950 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0"></span>
                            <span>{line.label}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-blue-950 text-xs">{line.operands}</td>
                          <td className="p-3 text-center font-mono font-black text-slate-950">
                            {line.rawSum}
                          </td>
                          <td className="p-3 text-center font-mono font-black text-amber-900">
                            {line.compoundTrail}
                          </td>
                          <td className="p-3 text-center font-mono font-black text-emerald-900">
                            {line.root}
                          </td>
                          <td className="p-3">
                            {line.isPowerNumber && line.powerNumber ? (
                              <span className="px-2 py-0.5 rounded-md text-xs font-black bg-red-100 text-red-950 border-2 border-red-500">
                                Power Number {line.powerNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Experimental Research Lines (PRD Section 23) */}
                      {showExperimental &&
                        signature.experimentalLines.map((line, idx) => (
                          <tr
                            key={`exp-${idx}`}
                            className="bg-purple-50 hover:bg-purple-100 transition-colors border-l-4 border-purple-600"
                          >
                            <td className="p-3 font-black text-purple-950 flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-200 text-purple-950 border border-purple-400 uppercase">
                                Exp
                              </span>
                              <span>{line.label}</span>
                            </td>
                            <td className="p-3 font-mono font-bold text-purple-950 text-xs">{line.operands}</td>
                            <td className="p-3 text-center font-mono font-black text-purple-950">{line.rawSum}</td>
                            <td className="p-3 text-center font-mono font-black text-purple-900">
                              {line.compoundTrail}
                            </td>
                            <td className="p-3 text-center font-mono font-black text-purple-950">{line.root}</td>
                            <td className="p-3">
                              {line.isPowerNumber && line.powerNumber ? (
                                <span className="px-2 py-0.5 rounded-md text-xs font-black bg-amber-100 text-amber-950 border-2 border-amber-600">
                                  Exp PN {line.powerNumber}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Analytical Observations (PRD Section 49 Wording Rules) */}
                <div className="p-3.5 bg-slate-50 rounded-lg border-2 border-slate-300 space-y-2">
                  <span className="text-xs uppercase tracking-wider text-slate-950 font-black block">
                    Calculated Research Observations:
                  </span>
                  {signature.summaryObservations.map((obs, i) => (
                    <div key={i} className="text-xs text-slate-900 font-semibold flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-600 mt-1 shrink-0"></span>
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>

                {/* Active Power Number Semantic Contexts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  {([11, 13, 16] as const).map(pn => {
                    const desc = POWER_NUMBER_DESCRIPTIONS[pn];
                    return (
                      <div
                        key={pn}
                        className="p-3 rounded-lg bg-amber-50 border-2 border-amber-300 text-xs shadow-sm"
                      >
                        <span className="font-black text-amber-950 block mb-1 uppercase tracking-wide">
                          {desc.title}
                        </span>
                        <p className="text-slate-800 font-medium leading-relaxed">{desc.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
